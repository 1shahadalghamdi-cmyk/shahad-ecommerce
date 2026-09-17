"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

import { useCart } from "@/components/CartProvider";
import { useStoreProducts } from "@/hooks/useStoreProducts";
import { getStoredProducts, Product } from "@/lib/products";

type PaymentMethod = "Card" | "Cash on Delivery";
type PaymentStatus = "Paid (Demo)" | "Pending";

type PromoCode =
  | "NOVA10"
  | "WELCOME15"
  | "SAVE50";

type AppliedPromo = {
  code: PromoCode;
  label: string;
  type: "percentage" | "fixed";
  value: number;
};

const PROMO_STORAGE_KEY =
  "nova-applied-promo";

const promoCodes: Record<
  PromoCode,
  AppliedPromo
> = {
  NOVA10: {
    code: "NOVA10",
    label: "10% off your order",
    type: "percentage",
    value: 10,
  },
  WELCOME15: {
    code: "WELCOME15",
    label: "15% welcome discount",
    type: "percentage",
    value: 15,
  },
  SAVE50: {
    code: "SAVE50",
    label: "50 SAR off your order",
    type: "fixed",
    value: 50,
  },
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function formatMoney(value: number) {
  return value.toLocaleString("en-SA", {
    minimumFractionDigits:
      Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

type DeliveryLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

type StoredOrder = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  status: "Processing" | "Shipped" | "Delivered";
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;

  shippingAddress: {
    address: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    location?: DeliveryLocation;
  };

  items: {
    productId: number;
    name: string;
    price: number;
    quantity: number;
  }[];
};

function isValidExpiry(expiry: string) {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);

  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);

  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const expiryDate = new Date(year, month, 0, 23, 59, 59, 999);

  return expiryDate >= now;
}

export default function CheckoutPage() {
  const storeProducts = useStoreProducts();

  const { cart, totalItems, clearCart } = useCart();

  useEffect(() => {
    const savedPromo =
      window.localStorage.getItem(
        PROMO_STORAGE_KEY,
      );

    if (!savedPromo) {
      setAppliedPromo(null);
      return;
    }

    try {
      const parsed =
        JSON.parse(savedPromo) as AppliedPromo;

      if (
        parsed &&
        typeof parsed.code === "string" &&
        parsed.code in promoCodes
      ) {
        setAppliedPromo(
          promoCodes[
            parsed.code as PromoCode
          ],
        );
      } else {
        setAppliedPromo(null);
        window.localStorage.removeItem(
          PROMO_STORAGE_KEY,
        );
      }
    } catch {
      setAppliedPromo(null);
      window.localStorage.removeItem(
        PROMO_STORAGE_KEY,
      );
    }
  }, []);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Card");

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [confirmedPaymentStatus, setConfirmedPaymentStatus] =
    useState<PaymentStatus>("Pending");

  const [appliedPromo, setAppliedPromo] =
    useState<AppliedPromo | null>(null);

  const [confirmedDiscount, setConfirmedDiscount] =
    useState(0);

  const [checkoutError, setCheckoutError] = useState("");

  const [deliveryLocation, setDeliveryLocation] =
    useState<DeliveryLocation | null>(null);

  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [locationMessage, setLocationMessage] = useState("");

  const cartProducts = useMemo(
    () =>
      cart
        .map((item) => {
          const product = storeProducts.find(
            (product) => product.id === item.productId,
          );

          if (!product) {
            return null;
          }

          return {
            ...product,
            quantity: item.quantity,
          };
        })
        .filter(
          (item): item is NonNullable<typeof item> => item !== null,
        ),
    [cart, storeProducts],
  );

  const subtotal = cartProducts.reduce(
    (total, product) =>
      total + product.price * product.quantity,
    0,
  );

  const discountAmount = useMemo(() => {
    if (!appliedPromo) {
      return 0;
    }

    if (
      appliedPromo.type ===
      "percentage"
    ) {
      return Math.min(
        subtotal,
        roundMoney(
          (subtotal *
            appliedPromo.value) /
            100,
        ),
      );
    }

    return Math.min(
      subtotal,
      appliedPromo.value,
    );
  }, [appliedPromo, subtotal]);

  const checkoutTotal = roundMoney(
    Math.max(
      0,
      subtotal - discountAmount,
    ),
  );

  function getOrders() {
    const savedOrders = window.localStorage.getItem(
      "nova-admin-orders",
    );

    if (!savedOrders) {
      return [];
    }

    try {
      return JSON.parse(savedOrders) as StoredOrder[];
    } catch {
      return [];
    }
  }

  function handleUseMyLocation() {
    setLocationMessage("");
    setCheckoutError("");

    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationMessage(
        "Location services are not supported by this browser.",
      );
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setLocationStatus("success");
        setLocationMessage(
          "Location captured successfully. It will be attached to this order.",
        );
      },
      (error) => {
        setDeliveryLocation(null);
        setLocationStatus("error");

        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage(
            "Location permission was denied. You can continue using the written address only.",
          );
          return;
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationMessage(
            "Your current location is unavailable. Please try again.",
          );
          return;
        }

        if (error.code === error.TIMEOUT) {
          setLocationMessage(
            "Location request timed out. Please try again.",
          );
          return;
        }

        setLocationMessage(
          "We could not capture your location. Please try again.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCheckoutError("");

    if (cartProducts.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    const firstName = String(
      formData.get("firstName") || "",
    ).trim();

    const lastName = String(
      formData.get("lastName") || "",
    ).trim();

    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();

    const address = String(
      formData.get("address") || "",
    ).trim();

    const city = String(formData.get("city") || "").trim();

    const region = String(
      formData.get("region") || "",
    ).trim();

    const postalCode = String(
      formData.get("postalCode") || "",
    ).trim();

    const country = String(
      formData.get("country") || "Saudi Arabia",
    ).trim();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !region ||
      !postalCode ||
      !country
    ) {
      setCheckoutError(
        "Please complete all contact and shipping fields.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (paymentMethod === "Card") {
      const cardholderName = String(
        formData.get("cardholderName") || "",
      ).trim();

      const cardNumber = String(
        formData.get("cardNumber") || "",
      )
        .replace(/\s+/g, "")
        .trim();

      const expiry = String(
        formData.get("expiry") || "",
      ).trim();

      const cvv = String(formData.get("cvv") || "").trim();

      if (!cardholderName) {
        setCheckoutError(
          "Please enter the cardholder name for the demo payment.",
        );
        return;
      }

      if (!/^\d{13,19}$/.test(cardNumber)) {
        setCheckoutError(
          "Please enter a valid demo card number using 13 to 19 digits.",
        );
        return;
      }

      if (!isValidExpiry(expiry)) {
        setCheckoutError(
          "Please enter a valid future expiry date in MM/YY format.",
        );
        return;
      }

      if (!/^\d{3,4}$/.test(cvv)) {
        setCheckoutError(
          "Please enter a valid 3 or 4 digit CVV.",
        );
        return;
      }
    }

    /*
      Important:
      Re-read inventory directly from localStorage at the moment
      the customer places the order.
    */
    const currentInventory = getStoredProducts();

    const unavailableItem = cartProducts.find((cartProduct) => {
      const liveProduct = currentInventory.find(
        (product) => product.id === cartProduct.id,
      );

      if (!liveProduct) {
        return true;
      }

      return liveProduct.stock < cartProduct.quantity;
    });

    if (unavailableItem) {
      setCheckoutError(
        `${unavailableItem.name} does not have enough stock to complete this order.`,
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    /*
      Use current inventory prices when the order is submitted.
    */
    const confirmedItems = cartProducts.map((cartProduct) => {
      const liveProduct = currentInventory.find(
        (product) => product.id === cartProduct.id,
      );

      return {
        productId: cartProduct.id,
        name: liveProduct?.name || cartProduct.name,
        price: liveProduct?.price || cartProduct.price,
        quantity: cartProduct.quantity,
      };
    });

    const confirmedSubtotal =
      confirmedItems.reduce(
        (total, item) =>
          total +
          item.price * item.quantity,
        0,
      );

    let confirmedDiscount = 0;

    if (appliedPromo) {
      if (
        appliedPromo.type ===
        "percentage"
      ) {
        confirmedDiscount =
          Math.min(
            confirmedSubtotal,
            roundMoney(
              (confirmedSubtotal *
                appliedPromo.value) /
                100,
            ),
          );
      } else {
        confirmedDiscount =
          Math.min(
            confirmedSubtotal,
            appliedPromo.value,
          );
      }
    }

    const finalTotal = roundMoney(
      Math.max(
        0,
        confirmedSubtotal -
          confirmedDiscount,
      ),
    );

    /*
      Reduce inventory.
    */
    const updatedInventory: Product[] = currentInventory.map(
      (product) => {
        const orderedItem = confirmedItems.find(
          (item) => item.productId === product.id,
        );

        if (!orderedItem) {
          return product;
        }

        return {
          ...product,
          stock: product.stock - orderedItem.quantity,
        };
      },
    );

    window.localStorage.setItem(
      "nova-admin-products",
      JSON.stringify(updatedInventory),
    );

    const generatedOrderNumber = `NOVA-${Date.now()
      .toString()
      .slice(-8)}`;

    const paymentStatus: PaymentStatus =
      paymentMethod === "Card" ? "Paid (Demo)" : "Pending";

    const newOrder: StoredOrder = {
      id: generatedOrderNumber,
      customer: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      subtotal: confirmedSubtotal,
      discount: confirmedDiscount,
      total: finalTotal,
      promoCode:
        appliedPromo?.code,
      status: "Processing",
      paymentMethod,
      paymentStatus,
      createdAt: new Date().toISOString(),

      shippingAddress: {
        address,
        city,
        region,
        postalCode,
        country,
        ...(deliveryLocation
          ? {
              location: deliveryLocation,
            }
          : {}),
      },

      items: confirmedItems,
    };

    const existingOrders = getOrders();

    window.localStorage.setItem(
      "nova-admin-orders",
      JSON.stringify([newOrder, ...existingOrders]),
    );

    setConfirmedTotal(finalTotal);
    setConfirmedDiscount(
      confirmedDiscount,
    );
    setConfirmedPaymentStatus(paymentStatus);
    setOrderNumber(generatedOrderNumber);
    setOrderPlaced(true);

    clearCart();

    window.localStorage.removeItem(
      PROMO_STORAGE_KEY,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (orderPlaced) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-6 py-16 text-zinc-950">
        <div className="w-full max-w-2xl rounded-[2.5rem] border border-black/10 bg-white p-10 text-center shadow-sm md:p-14">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            ✓
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Order Confirmed
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-5xl">
            Thank you for your order.
          </h1>

          <p className="mx-auto mt-5 max-w-lg leading-7 text-zinc-500">
            Your order has been recorded successfully and sent to the
            NOVA administration workflow. Card payments are simulated
            for portfolio demonstration only.
          </p>

          <div className="mx-auto mt-8 max-w-sm space-y-4 rounded-2xl bg-zinc-100 p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-400">
                Order Number
              </p>

              <p className="mt-2 text-xl font-bold">{orderNumber}</p>
            </div>

            {confirmedDiscount > 0 && (
              <div className="border-t border-black/10 pt-4">
                <p className="text-xs uppercase tracking-widest text-zinc-400">
                  Discount
                </p>

                <p className="mt-2 font-semibold text-green-600">
                  −{formatMoney(confirmedDiscount)} SAR
                </p>
              </div>
            )}

            <div className="border-t border-black/10 pt-4">
              <p className="text-xs uppercase tracking-widest text-zinc-400">
                Order Total
              </p>

              <p className="mt-2 text-lg font-bold">
                {formatMoney(confirmedTotal)} SAR
              </p>
            </div>

            <div className="border-t border-black/10 pt-4">
              <p className="text-xs uppercase tracking-widest text-zinc-400">
                Order Status
              </p>

              <p className="mt-2 font-semibold text-amber-600">
                Processing
              </p>
            </div>

            <div className="border-t border-black/10 pt-4">
              <p className="text-xs uppercase tracking-widest text-zinc-400">
                Payment Status
              </p>

              <p
                className={`mt-2 font-semibold ${
                  confirmedPaymentStatus === "Paid (Demo)"
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {confirmedPaymentStatus}
              </p>
            </div>

            {deliveryLocation && (
              <div className="border-t border-black/10 pt-4">
                <p className="text-xs uppercase tracking-widest text-zinc-400">
                  Delivery Location
                </p>

                <p className="mt-2 text-sm font-medium text-green-700">
                  Location attached ✓
                </p>

                <a
                  href={`https://www.google.com/maps?q=${deliveryLocation.latitude},${deliveryLocation.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline"
                >
                  Open in Maps →
                </a>
              </div>
            )}
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/track-order"
              className="rounded-full bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              Track Order →
            </Link>

            <Link
              href="/"
              className="rounded-full border border-black/10 px-8 py-4 font-semibold transition hover:border-blue-600 hover:text-blue-600"
            >
              Back to Store
            </Link>

            <Link
              href="/admin"
              className="rounded-full border border-black/10 px-8 py-4 font-semibold transition hover:border-blue-600 hover:text-blue-600"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-zinc-950">
        <header className="border-b border-black/10 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <Link href="/" className="text-2xl font-black">
              NOVA<span className="text-blue-600">.</span>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="rounded-[2rem] border border-black/10 bg-white p-12">
            <div className="text-6xl">🛒</div>

            <h1 className="mt-6 text-3xl font-bold">
              Your cart is empty
            </h1>

            <p className="mt-3 text-zinc-500">
              Add products before continuing to checkout.
            </p>

            <Link
              href="/#products"
              className="mt-8 inline-block rounded-full bg-blue-600 px-7 py-4 font-semibold text-white"
            >
              Shop Products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-zinc-950">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            NOVA<span className="text-blue-600">.</span>
          </Link>

          <Link
            href="/cart"
            className="text-sm font-medium transition hover:text-blue-600"
          >
            ← Back to Cart
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Secure Checkout
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Complete your order
          </h1>

          <p className="mt-3 text-zinc-500">
            Enter your delivery details, optionally attach your current
            location, and choose a payment method.
          </p>
        </div>

        {checkoutError && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-medium text-red-700">
            ⚠️ {checkoutError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1fr_400px]"
        >
          <div className="space-y-6">
            {/* CONTACT */}
            <section className="rounded-[2rem] border border-black/10 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                Step 1
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Contact Information
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    First Name
                  </label>

                  <input
                    required
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Shahad"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Last Name
                  </label>

                  <input
                    required
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Alghamdi"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="customer@example.com"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone
                  </label>

                  <input
                    required
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+966 5X XXX XXXX"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>
              </div>
            </section>

            {/* SHIPPING */}
            <section className="rounded-[2rem] border border-black/10 bg-white p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                    Step 2
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Shipping Address
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={locationStatus === "loading"}
                  className="rounded-full border border-blue-600 px-5 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {locationStatus === "loading"
                    ? "Getting Location..."
                    : deliveryLocation
                      ? "✓ Location Added"
                      : "📍 Use My Location"}
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm leading-6 text-zinc-600">
                  Your written address is still required. Location is an
                  optional extra delivery pin that can be attached to the
                  order for the admin team.
                </p>

                {locationMessage && (
                  <p
                    className={`mt-3 text-sm font-medium ${
                      locationStatus === "success"
                        ? "text-green-700"
                        : locationStatus === "error"
                          ? "text-red-600"
                          : "text-zinc-600"
                    }`}
                  >
                    {locationMessage}
                  </p>
                )}

                {deliveryLocation && (
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-medium text-green-700">
                      Latitude: {deliveryLocation.latitude.toFixed(5)}
                    </span>

                    <span className="font-medium text-green-700">
                      Longitude: {deliveryLocation.longitude.toFixed(5)}
                    </span>

                    <a
                      href={`https://www.google.com/maps?q=${deliveryLocation.latitude},${deliveryLocation.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Preview Map →
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Address
                  </label>

                  <input
                    required
                    name="address"
                    type="text"
                    autoComplete="street-address"
                    placeholder="Street and building number"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    City
                  </label>

                  <input
                    required
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="Dammam"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Region
                  </label>

                  <input
                    required
                    name="region"
                    type="text"
                    autoComplete="address-level1"
                    placeholder="Eastern Province"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Postal Code
                  </label>

                  <input
                    required
                    name="postalCode"
                    type="text"
                    autoComplete="postal-code"
                    placeholder="32241"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Country
                  </label>

                  <select
                    required
                    name="country"
                    defaultValue="Saudi Arabia"
                    autoComplete="country-name"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none transition focus:border-blue-600"
                  >
                    <option>Saudi Arabia</option>
                    <option>Bahrain</option>
                    <option>United Arab Emirates</option>
                    <option>Kuwait</option>
                  </select>
                </div>
              </div>
            </section>

            {/* PAYMENT */}
            <section className="rounded-[2rem] border border-black/10 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                Step 3
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Payment Method
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Card")}
                  className={`rounded-2xl border p-5 text-left transition ${
                    paymentMethod === "Card"
                      ? "border-blue-600 bg-blue-50"
                      : "border-black/10"
                  }`}
                >
                  <p className="font-semibold">💳 Card</p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Simulated online payment
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("Cash on Delivery")
                  }
                  className={`rounded-2xl border p-5 text-left transition ${
                    paymentMethod === "Cash on Delivery"
                      ? "border-blue-600 bg-blue-50"
                      : "border-black/10"
                  }`}
                >
                  <p className="font-semibold">📦 Cash on Delivery</p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Payment stays pending until delivery
                  </p>
                </button>
              </div>

              {paymentMethod === "Card" && (
                <div className="mt-6 rounded-2xl bg-zinc-100 p-5">
                  <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      Demo payment only — do not enter real card
                      information.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium">
                        Cardholder Name
                      </label>

                      <input
                        required
                        name="cardholderName"
                        type="text"
                        autoComplete="off"
                        placeholder="Demo Customer"
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium">
                        Card Number
                      </label>

                      <input
                        required
                        name="cardNumber"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="4242 4242 4242 4242"
                        maxLength={23}
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Expiry
                      </label>

                      <input
                        required
                        name="expiry"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="12/30"
                        maxLength={5}
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        CVV
                      </label>

                      <input
                        required
                        name="cvv"
                        type="password"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="123"
                        maxLength={4}
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm leading-6 text-green-800">
                      For this portfolio simulation, a valid demo card
                      form is marked as <strong>Paid (Demo)</strong>. No
                      bank, payment gateway, or real transaction is used.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === "Cash on Delivery" && (
                <div className="mt-6 rounded-2xl border border-black/10 bg-zinc-50 p-5">
                  <p className="font-semibold">
                    Cash on Delivery selected
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    The order will be created with payment status{" "}
                    <strong>Pending</strong> until delivery.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* SUMMARY */}
          <aside className="h-fit rounded-[2rem] bg-zinc-950 p-7 text-white lg:sticky lg:top-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
              Your Order
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Order Summary
            </h2>

            <div className="mt-7 space-y-5">
              {cartProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 border-b border-white/10 pb-5"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
                    {product.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{product.name}</p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Qty: {product.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    {product.price * product.quantity} SAR
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4 border-b border-white/10 pb-6 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Items</span>
                <span className="text-white">{totalItems}</span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-white">{subtotal} SAR</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between gap-4 text-green-400">
                  <span>
                    Discount ({appliedPromo.code})
                  </span>

                  <span>
                    −{formatMoney(discountAmount)} SAR
                  </span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="text-green-400">Free</span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Payment</span>

                <span className="text-white">
                  {paymentMethod === "Card"
                    ? "Card (Demo)"
                    : "Cash on Delivery"}
                </span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Delivery Pin</span>

                <span
                  className={
                    deliveryLocation
                      ? "text-green-400"
                      : "text-zinc-500"
                  }
                >
                  {deliveryLocation ? "Attached" : "Optional"}
                </span>
              </div>
            </div>

            <div className="flex justify-between py-6 text-xl font-bold">
              <span>Total</span>
              <span>
                {formatMoney(checkoutTotal)} SAR
              </span>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-blue-600 py-4 font-semibold transition hover:bg-blue-500"
            >
              Place Order →
            </button>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs leading-5 text-zinc-400">
                🔒 Portfolio checkout simulation. Card validation,
                payment status, inventory updates, delivery pin, and
                order creation are demonstrated without processing a
                real transaction.
              </p>
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}

