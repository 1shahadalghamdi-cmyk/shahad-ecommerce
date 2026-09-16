"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useCart,
} from "@/components/CartProvider";

import {
  useStoreProducts,
} from "@/hooks/useStoreProducts";

import {
  getStoredProducts,
  Product,
} from "@/lib/products";

type PaymentMethod =
  | "Card"
  | "Cash on Delivery";

type StoredOrder = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  total: number;

  status:
    | "Processing"
    | "Shipped"
    | "Delivered";

  paymentMethod: PaymentMethod;

  createdAt: string;

  shippingAddress: {
    address: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };

  items: {
    productId: number;
    name: string;
    price: number;
    quantity: number;
  }[];
};

export default function CheckoutPage() {
  const storeProducts =
    useStoreProducts();

  const {
    cart,
    totalItems,
    clearCart,
  } = useCart();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Card");

  const [orderPlaced, setOrderPlaced] =
    useState(false);

  const [orderNumber, setOrderNumber] =
    useState("");

  const [confirmedTotal, setConfirmedTotal] =
    useState(0);

  const [checkoutError, setCheckoutError] =
    useState("");

  const cartProducts = useMemo(
    () =>
      cart
        .map((item) => {
          const product =
            storeProducts.find(
              (product) =>
                product.id ===
                item.productId,
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
          (
            item,
          ): item is NonNullable<typeof item> =>
            item !== null,
        ),
    [cart, storeProducts],
  );

  const subtotal =
    cartProducts.reduce(
      (total, product) =>
        total +
        product.price *
          product.quantity,
      0,
    );

  function getOrders() {
    const savedOrders =
      window.localStorage.getItem(
        "nova-admin-orders",
      );

    if (!savedOrders) {
      return [];
    }

    try {
      return JSON.parse(
        savedOrders,
      ) as StoredOrder[];
    } catch {
      return [];
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setCheckoutError("");

    if (cartProducts.length === 0) {
      setCheckoutError(
        "Your cart is empty.",
      );

      return;
    }

    const formData =
      new FormData(
        event.currentTarget,
      );

    const firstName = String(
      formData.get("firstName") ||
        "",
    ).trim();

    const lastName = String(
      formData.get("lastName") ||
        "",
    ).trim();

    const email = String(
      formData.get("email") || "",
    ).trim();

    const phone = String(
      formData.get("phone") || "",
    ).trim();

    const address = String(
      formData.get("address") ||
        "",
    ).trim();

    const city = String(
      formData.get("city") || "",
    ).trim();

    const region = String(
      formData.get("region") ||
        "",
    ).trim();

    const postalCode = String(
      formData.get("postalCode") ||
        "",
    ).trim();

    const country = String(
      formData.get("country") ||
        "Saudi Arabia",
    );

    /*
      Important:
      Re-read inventory directly
      from localStorage at the moment
      the customer places the order.
    */
    const currentInventory =
      getStoredProducts();

    const unavailableItem =
      cartProducts.find(
        (cartProduct) => {
          const liveProduct =
            currentInventory.find(
              (product) =>
                product.id ===
                cartProduct.id,
            );

          if (!liveProduct) {
            return true;
          }

          return (
            liveProduct.stock <
            cartProduct.quantity
          );
        },
      );

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
      Use current inventory prices
      when the order is submitted.
    */
    const confirmedItems =
      cartProducts.map(
        (cartProduct) => {
          const liveProduct =
            currentInventory.find(
              (product) =>
                product.id ===
                cartProduct.id,
            );

          return {
            productId:
              cartProduct.id,

            name:
              liveProduct?.name ||
              cartProduct.name,

            price:
              liveProduct?.price ||
              cartProduct.price,

            quantity:
              cartProduct.quantity,
          };
        },
      );

    const finalTotal =
      confirmedItems.reduce(
        (total, item) =>
          total +
          item.price *
            item.quantity,
        0,
      );

    /*
      Reduce inventory.
    */
    const updatedInventory:
      Product[] =
      currentInventory.map(
        (product) => {
          const orderedItem =
            confirmedItems.find(
              (item) =>
                item.productId ===
                product.id,
            );

          if (!orderedItem) {
            return product;
          }

          return {
            ...product,

            stock:
              product.stock -
              orderedItem.quantity,
          };
        },
      );

    window.localStorage.setItem(
      "nova-admin-products",
      JSON.stringify(
        updatedInventory,
      ),
    );

    const generatedOrderNumber =
      `NOVA-${Date.now()
        .toString()
        .slice(-8)}`;

    const newOrder: StoredOrder = {
      id: generatedOrderNumber,

      customer:
        `${firstName} ${lastName}`.trim(),

      email,

      phone,

      total: finalTotal,

      status: "Processing",

      paymentMethod,

      createdAt:
        new Date().toISOString(),

      shippingAddress: {
        address,
        city,
        region,
        postalCode,
        country,
      },

      items: confirmedItems,
    };

    const existingOrders =
      getOrders();

    window.localStorage.setItem(
      "nova-admin-orders",
      JSON.stringify([
        newOrder,
        ...existingOrders,
      ]),
    );

    setConfirmedTotal(
      finalTotal,
    );

    setOrderNumber(
      generatedOrderNumber,
    );

    setOrderPlaced(true);

    clearCart();

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
            Your order has been
            recorded successfully and
            sent to the NOVA
            administration workflow.
            No real payment was
            processed.
          </p>

          <div className="mx-auto mt-8 max-w-sm space-y-4 rounded-2xl bg-zinc-100 p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-400">
                Order Number
              </p>

              <p className="mt-2 text-xl font-bold">
                {orderNumber}
              </p>
            </div>

            <div className="border-t border-black/10 pt-4">
              <p className="text-xs uppercase tracking-widest text-zinc-400">
                Order Total
              </p>

              <p className="mt-2 text-lg font-bold">
                {confirmedTotal} SAR
              </p>
            </div>

            <div className="border-t border-black/10 pt-4">
              <p className="text-xs uppercase tracking-widest text-zinc-400">
                Status
              </p>

              <p className="mt-2 font-semibold text-amber-600">
                Processing
              </p>
            </div>
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
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
            <Link
              href="/"
              className="text-2xl font-black"
            >
              NOVA
              <span className="text-blue-600">
                .
              </span>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="rounded-[2rem] border border-black/10 bg-white p-12">
            <div className="text-6xl">
              🛒
            </div>

            <h1 className="mt-6 text-3xl font-bold">
              Your cart is empty
            </h1>

            <p className="mt-3 text-zinc-500">
              Add products before
              continuing to checkout.
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
            NOVA
            <span className="text-blue-600">
              .
            </span>
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
            Enter your delivery
            details and choose a
            payment method.
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
                    placeholder="+966 5X XXX XXXX"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>
              </div>
            </section>

            {/* SHIPPING */}
            <section className="rounded-[2rem] border border-black/10 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                Step 2
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Shipping Address
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Address
                  </label>

                  <input
                    required
                    name="address"
                    type="text"
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
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none transition focus:border-blue-600"
                  >
                    <option>
                      Saudi Arabia
                    </option>

                    <option>
                      Bahrain
                    </option>

                    <option>
                      United Arab Emirates
                    </option>

                    <option>
                      Kuwait
                    </option>
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
                  onClick={() =>
                    setPaymentMethod(
                      "Card",
                    )
                  }
                  className={`rounded-2xl border p-5 text-left transition ${
                    paymentMethod ===
                    "Card"
                      ? "border-blue-600 bg-blue-50"
                      : "border-black/10"
                  }`}
                >
                  <p className="font-semibold">
                    💳 Card
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Demo card payment
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      "Cash on Delivery",
                    )
                  }
                  className={`rounded-2xl border p-5 text-left transition ${
                    paymentMethod ===
                    "Cash on Delivery"
                      ? "border-blue-600 bg-blue-50"
                      : "border-black/10"
                  }`}
                >
                  <p className="font-semibold">
                    📦 Cash on Delivery
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Pay when delivered
                  </p>
                </button>
              </div>

              {paymentMethod ===
                "Card" && (
                <div className="mt-6 rounded-2xl bg-zinc-100 p-5">
                  <p className="mb-5 text-sm text-zinc-500">
                    Demo only — do not
                    enter real payment
                    information.
                  </p>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium">
                        Card Number
                      </label>

                      <input
                        required
                        name="cardNumber"
                        type="text"
                        placeholder="4242 4242 4242 4242"
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
                        placeholder="12/30"
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
                        type="text"
                        placeholder="123"
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
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
              {cartProducts.map(
                (product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 border-b border-white/10 pb-5"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
                      {
                        product.icon
                      }
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {
                          product.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Qty:{" "}
                        {
                          product.quantity
                        }
                      </p>
                    </div>

                    <p className="font-semibold">
                      {product.price *
                        product.quantity}{" "}
                      SAR
                    </p>
                  </div>
                ),
              )}
            </div>

            <div className="mt-6 space-y-4 border-b border-white/10 pb-6 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Items</span>

                <span className="text-white">
                  {totalItems}
                </span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>
                  Subtotal
                </span>

                <span className="text-white">
                  {subtotal} SAR
                </span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>
                  Shipping
                </span>

                <span className="text-green-400">
                  Free
                </span>
              </div>
            </div>

            <div className="flex justify-between py-6 text-xl font-bold">
              <span>Total</span>

              <span>
                {subtotal} SAR
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
                🔒 Portfolio checkout
                simulation. No real
                payment or transaction
                will be processed.
              </p>
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}
