"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";

type OrderStatus =
  | "Processing"
  | "Shipped"
  | "Delivered";

type PaymentStatus =
  | "Paid (Demo)"
  | "Pending";

type DeliveryLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

type ShippingAddress = {
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  location?: DeliveryLocation;
};

type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  customer: string;
  email?: string;
  phone?: string;
  subtotal?: number;
  discount?: number;
  total: number;
  promoCode?: string;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  createdAt?: string;
  shippingAddress?: ShippingAddress;
  items?: OrderItem[];
};

const ORDER_STORAGE_KEY =
  "nova-admin-orders";

const trackingSteps: OrderStatus[] = [
  "Processing",
  "Shipped",
  "Delivered",
];

function formatMoney(value: number) {
  return value.toLocaleString("en-SA", {
    minimumFractionDigits:
      Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function getStatusIndex(
  status: OrderStatus,
) {
  return trackingSteps.indexOf(status);
}

export default function TrackOrderPage() {
  const [orderInput, setOrderInput] =
    useState("");

  const [order, setOrder] =
    useState<Order | null>(null);

  const [searched, setSearched] =
    useState(false);

  const [error, setError] =
    useState("");

  function findOrderById(
    orderId: string,
  ) {
    setError("");
    setSearched(true);

    const normalizedOrderId =
      orderId.trim().toUpperCase();

    if (!normalizedOrderId) {
      setOrder(null);
      setError(
        "Enter your NOVA order number.",
      );
      return;
    }

    const savedOrders =
      window.localStorage.getItem(
        ORDER_STORAGE_KEY,
      );

    if (!savedOrders) {
      setOrder(null);
      setError(
        "No saved orders were found.",
      );
      return;
    }

    try {
      const orders: Order[] =
        JSON.parse(savedOrders);

      const foundOrder =
        orders.find(
          (item) =>
            item.id.toUpperCase() ===
            normalizedOrderId,
        ) || null;

      if (!foundOrder) {
        setOrder(null);
        setError(
          "Order not found. Check the order number and try again.",
        );
        return;
      }

      setOrder(foundOrder);
      setOrderInput(foundOrder.id);
    } catch {
      setOrder(null);
      setError(
        "We could not load the order. Please try again.",
      );
    }
  }

  useEffect(() => {
    const searchParams =
      new URLSearchParams(
        window.location.search,
      );

    const orderFromUrl =
      searchParams.get("order");

    if (orderFromUrl) {
      setOrderInput(orderFromUrl);
      findOrderById(orderFromUrl);
    }
  }, []);

  function handleTrackOrder(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    findOrderById(orderInput);
  }

  function resetTracking() {
    setOrder(null);
    setOrderInput("");
    setSearched(false);
    setError("");
  }

  const statusIndex = order
    ? getStatusIndex(order.status)
    : -1;

  const formattedDate =
    order?.createdAt
      ? new Date(
          order.createdAt,
        ).toLocaleString()
      : "Order date unavailable";

  const deliveryLocation =
    order?.shippingAddress?.location;

  const hasDeliveryLocation =
    typeof deliveryLocation?.latitude ===
      "number" &&
    typeof deliveryLocation?.longitude ===
      "number";

  const mapsUrl =
    hasDeliveryLocation &&
    deliveryLocation
      ? `https://www.google.com/maps?q=${deliveryLocation.latitude},${deliveryLocation.longitude}`
      : "";

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-zinc-950">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            NOVA
            <span className="text-blue-600">
              .
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium transition hover:border-blue-600 hover:text-blue-600"
            >
              Back to Store
            </Link>

            <Link
              href="/cart"
              className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Cart
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        {/* INTRO */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Order Tracking
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Track your NOVA order.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-500">
            Enter your order number to view
            fulfillment progress, payment status,
            order items, and delivery information.
          </p>
        </div>

        {/* SEARCH */}
        <form
          onSubmit={handleTrackOrder}
          className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm"
        >
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Order Number
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={orderInput}
              onChange={(event) =>
                setOrderInput(
                  event.target.value,
                )
              }
              placeholder="Example: NOVA-76574837"
              className="min-w-0 flex-1 rounded-full border border-black/10 bg-[#f7f7f5] px-5 py-4 font-medium uppercase outline-none transition focus:border-blue-600"
            />

            <button
              type="submit"
              className="rounded-full bg-blue-600 px-7 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              Track Order →
            </button>
          </div>

        </form>

        {error && (
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {!order && !searched && (
          <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-dashed border-black/10 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-zinc-950">
              <span className="text-xl font-black tracking-tight text-white">
                NOVA<span className="text-blue-500">.</span>
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Your delivery journey starts here
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-zinc-500">
              Use the NOVA order number shown
              after checkout to see the latest
              fulfillment status.
            </p>
          </div>
        )}

        {order && (
          <div className="mt-10 space-y-8">
            {/* TRACKING CARD */}
            <section className="rounded-[2.5rem] bg-zinc-950 p-7 text-white md:p-10">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                    Tracking Result
                  </p>

                  <h2 className="mt-3 text-3xl font-black md:text-4xl">
                    {order.id}
                  </h2>

                  <p className="mt-3 text-sm text-zinc-400">
                    {formattedDate}
                  </p>
                </div>

                <div className="rounded-full bg-white/10 px-5 py-3">
                  <p className="text-xs uppercase tracking-widest text-zinc-400">
                    Current Status
                  </p>

                  <p
                    className={`mt-1 font-bold ${
                      order.status ===
                      "Delivered"
                        ? "text-green-400"
                        : order.status ===
                            "Shipped"
                          ? "text-blue-400"
                          : "text-amber-400"
                    }`}
                  >
                    {order.status}
                  </p>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {trackingSteps.map(
                  (step, index) => {
                    const completed =
                      statusIndex >= index;

                    const current =
                      statusIndex === index;

                    return (
                      <div
                        key={step}
                        className="relative"
                      >
                        <div
                          className={`rounded-[1.5rem] border p-5 transition ${
                            completed
                              ? "border-blue-500/40 bg-blue-500/10"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold ${
                              completed
                                ? "bg-blue-600 text-white"
                                : "bg-white/10 text-zinc-500"
                            }`}
                          >
                            {completed
                              ? "✓"
                              : index + 1}
                          </div>

                          <p
                            className={`mt-5 font-bold ${
                              completed
                                ? "text-white"
                                : "text-zinc-500"
                            }`}
                          >
                            {step}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-zinc-500">
                            {step ===
                            "Processing"
                              ? "Your order has been received and is being prepared."
                              : step ===
                                  "Shipped"
                                ? "Your order has left the NOVA fulfillment workflow."
                                : "Your order has reached its final delivery stage."}
                          </p>

                          {current && (
                            <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                              Current Stage
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-6">
                {/* CUSTOMER */}
                <section className="rounded-[2rem] border border-black/10 bg-white p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                    Customer
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    Order Information
                  </h3>

                  <div className="mt-7 grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-400">
                        Customer
                      </p>

                      <p className="mt-2 font-semibold">
                        {order.customer}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-400">
                        Payment
                      </p>

                      <p className="mt-2 font-semibold">
                        {order.paymentMethod ||
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-400">
                        Payment Status
                      </p>

                      <p
                        className={`mt-2 font-semibold ${
                          order.paymentStatus ===
                          "Paid (Demo)"
                            ? "text-green-600"
                            : order.paymentStatus ===
                                "Pending"
                              ? "text-amber-600"
                              : "text-zinc-500"
                        }`}
                      >
                        {order.paymentStatus === "Paid (Demo)"
                          ? "Paid (Test)"
                          : order.paymentStatus ||
                            "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-400">
                        Promo Code
                      </p>

                      <p className="mt-2 font-semibold">
                        {order.promoCode ||
                          "None"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* ITEMS */}
                <section className="rounded-[2rem] border border-black/10 bg-white p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                    Products
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    Order Items
                  </h3>

                  {order.items &&
                  order.items.length >
                    0 ? (
                    <div className="mt-7 space-y-4">
                      {order.items.map(
                        (item) => (
                          <div
                            key={
                              item.productId
                            }
                            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#f7f7f5] p-5"
                          >
                            <div>
                              <p className="font-semibold">
                                {item.name}
                              </p>

                              <p className="mt-1 text-sm text-zinc-500">
                                {formatMoney(
                                  item.price,
                                )}{" "}
                                SAR ×{" "}
                                {
                                  item.quantity
                                }
                              </p>
                            </div>

                            <p className="font-bold">
                              {formatMoney(
                                item.price *
                                  item.quantity,
                              )}{" "}
                              SAR
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="mt-6 text-zinc-500">
                      Product details are
                      unavailable for this
                      order.
                    </p>
                  )}
                </section>

                {/* DELIVERY */}
                <section className="rounded-[2rem] border border-black/10 bg-white p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                    Delivery
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    Shipping Information
                  </h3>

                  {order.shippingAddress ? (
                    <div className="mt-7">
                      <p className="font-semibold">
                        {
                          order
                            .shippingAddress
                            .address
                        }
                      </p>

                      <p className="mt-2 leading-7 text-zinc-500">
                        {
                          order
                            .shippingAddress
                            .city
                        }
                        ,{" "}
                        {
                          order
                            .shippingAddress
                            .region
                        }{" "}
                        {
                          order
                            .shippingAddress
                            .postalCode
                        }
                        <br />
                        {
                          order
                            .shippingAddress
                            .country
                        }
                      </p>

                      {hasDeliveryLocation && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-6 inline-flex rounded-full border border-blue-600 px-5 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          Open Delivery Location →
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="mt-6 text-zinc-500">
                      Shipping information is
                      unavailable.
                    </p>
                  )}
                </section>
              </div>

              {/* SUMMARY */}
              <aside className="h-fit rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-black/10 lg:sticky lg:top-8">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                  Summary
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Order Total
                </h3>

                <div className="mt-7 space-y-4 border-b border-black/10 pb-6 text-sm">
                  <div className="flex justify-between gap-4 text-zinc-500">
                    <span>Subtotal</span>

                    <span className="font-medium text-zinc-950">
                      {formatMoney(
                        order.subtotal ??
                          order.total +
                            (order.discount ??
                              0),
                      )}{" "}
                      SAR
                    </span>
                  </div>

                  {(order.discount ??
                    0) > 0 && (
                    <div className="flex justify-between gap-4 text-green-600">
                      <span>
                        Discount
                        {order.promoCode
                          ? ` (${order.promoCode})`
                          : ""}
                      </span>

                      <span className="font-semibold">
                        −
                        {formatMoney(
                          order.discount ??
                            0,
                        )}{" "}
                        SAR
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 text-zinc-500">
                    <span>Shipping</span>

                    <span className="font-semibold text-green-600">
                      Free
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4 py-6">
                  <span className="font-bold">
                    Total
                  </span>

                  <span className="text-3xl font-black">
                    {formatMoney(
                      order.total,
                    )}{" "}
                    SAR
                  </span>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/"
                    className="block rounded-full bg-blue-600 py-4 text-center font-semibold text-white transition hover:bg-blue-700"
                  >
                    Continue Shopping
                  </Link>

                  <button
                    type="button"
                    onClick={resetTracking}
                    className="w-full rounded-full border border-black/10 py-4 font-semibold transition hover:border-blue-600 hover:text-blue-600"
                  >
                    Track Another Order
                  </button>
                </div>
              </aside>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}


