"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type OrderStatus =
  | "Processing"
  | "Shipped"
  | "Delivered";

type PaymentStatus =
  | "Paid (Demo)"
  | "Pending";

type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

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

type Order = {
  id: string;
  customer: string;
  email?: string;
  phone?: string;
  total: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  createdAt?: string;
  shippingAddress?: ShippingAddress;
  items?: OrderItem[];
};

export default function OrderDetailsPage() {
  const params = useParams();

  const rawId = params.id;

  const orderId = Array.isArray(rawId)
    ? rawId[0]
    : rawId;

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const savedOrders =
      window.localStorage.getItem(
        "nova-admin-orders",
      );

    if (!savedOrders) {
      setLoading(false);
      return;
    }

    try {
      const orders: Order[] =
        JSON.parse(savedOrders);

      const foundOrder =
        orders.find(
          (item) =>
            item.id === orderId,
        ) || null;

      setOrder(foundOrder);
    } catch {
      setOrder(null);
    }

    setLoading(false);
  }, [orderId]);

  function updateStatus(
    newStatus: OrderStatus,
  ) {
    if (!order) return;

    const savedOrders =
      window.localStorage.getItem(
        "nova-admin-orders",
      );

    if (!savedOrders) return;

    try {
      const orders: Order[] =
        JSON.parse(savedOrders);

      const updatedOrders =
        orders.map((item) =>
          item.id === order.id
            ? {
                ...item,
                status: newStatus,
              }
            : item,
        );

      window.localStorage.setItem(
        "nova-admin-orders",
        JSON.stringify(updatedOrders),
      );

      setOrder({
        ...order,
        status: newStatus,
      });
    } catch {
      return;
    }
  }

  function getStatusClasses(
    status: OrderStatus,
  ) {
    if (status === "Delivered") {
      return "border-green-200 bg-green-50 text-green-700";
    }

    if (status === "Shipped") {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  function getPaymentStatusClasses(
    status?: PaymentStatus,
  ) {
    if (status === "Paid (Demo)") {
      return "border-green-200 bg-green-50 text-green-700";
    }

    if (status === "Pending") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-zinc-200 bg-zinc-50 text-zinc-500";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f4f2] text-zinc-950">
        <p className="text-zinc-500">
          Loading order...
        </p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f4f2] px-6 text-zinc-950">
        <div className="w-full max-w-lg rounded-[2rem] border border-black/10 bg-white p-10 text-center">
          <div className="text-5xl">
            🧾
          </div>

          <h1 className="mt-5 text-3xl font-black">
            Order not found
          </h1>

          <p className="mt-3 text-zinc-500">
            This order could not be found in
            the NOVA order records.
          </p>

          <Link
            href="/admin"
            className="mt-7 inline-block rounded-full bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const formattedDate =
    order.createdAt
      ? new Date(
          order.createdAt,
        ).toLocaleString()
      : "Demo Order";

  const deliveryLocation =
    order.shippingAddress?.location;

  const hasDeliveryLocation =
    typeof deliveryLocation?.latitude === "number" &&
    typeof deliveryLocation?.longitude === "number";

  const mapsUrl = hasDeliveryLocation
    ? `https://www.google.com/maps?q=${deliveryLocation.latitude},${deliveryLocation.longitude}`
    : "";

  return (
    <main className="min-h-screen bg-[#f4f4f2] text-zinc-950">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-2xl font-black tracking-tight"
            >
              NOVA
              <span className="text-blue-600">
                .
              </span>
            </Link>

            <span className="hidden rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 md:block">
              Order Details
            </span>
          </div>

          <Link
            href="/admin"
            className="text-sm font-medium transition hover:text-blue-600"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* ORDER HEADER */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
              Order Management
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              {order.id}
            </h1>

            <p className="mt-3 text-zinc-500">
              {formattedDate}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Order Status
            </label>

            <select
              value={order.status}
              onChange={(event) =>
                updateStatus(
                  event.target
                    .value as OrderStatus,
                )
              }
              className={`rounded-full border px-5 py-3 font-semibold outline-none ${getStatusClasses(
                order.status,
              )}`}
            >
              <option value="Processing">
                Processing
              </option>

              <option value="Shipped">
                Shipped
              </option>

              <option value="Delivered">
                Delivered
              </option>
            </select>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* CUSTOMER */}
            <section className="rounded-[2rem] border border-black/10 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                Customer
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Customer Information
              </h2>

              <div className="mt-7 grid gap-7 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-400">
                    Full Name
                  </p>

                  <p className="mt-2 font-semibold">
                    {order.customer}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-400">
                    Email
                  </p>

                  <p className="mt-2 font-semibold">
                    {order.email ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-400">
                    Phone
                  </p>

                  <p className="mt-2 font-semibold">
                    {order.phone ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-400">
                    Payment Method
                  </p>

                  <p className="mt-2 font-semibold">
                    {order.paymentMethod ||
                      "Demo Order"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-400">
                    Payment Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${getPaymentStatusClasses(
                      order.paymentStatus,
                    )}`}
                  >
                    {order.paymentStatus ||
                      "Not available"}
                  </span>
                </div>
              </div>
            </section>

            {/* SHIPPING */}
            <section className="rounded-[2rem] border border-black/10 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                Delivery
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Shipping Address
              </h2>

              {order.shippingAddress ? (
                <div className="mt-7 grid gap-7 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-widest text-zinc-400">
                      Address
                    </p>

                    <p className="mt-2 font-semibold">
                      {
                        order
                          .shippingAddress
                          .address
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-400">
                      City
                    </p>

                    <p className="mt-2 font-semibold">
                      {
                        order
                          .shippingAddress
                          .city
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-400">
                      Region
                    </p>

                    <p className="mt-2 font-semibold">
                      {
                        order
                          .shippingAddress
                          .region
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-400">
                      Postal Code
                    </p>

                    <p className="mt-2 font-semibold">
                      {
                        order
                          .shippingAddress
                          .postalCode
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-400">
                      Country
                    </p>

                    <p className="mt-2 font-semibold">
                      {
                        order
                          .shippingAddress
                          .country
                      }
                    </p>
                  </div>

                  <div className="sm:col-span-2 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-400">
                          Delivery Pin
                        </p>

                        <p
                          className={`mt-2 font-semibold ${
                            hasDeliveryLocation
                              ? "text-green-700"
                              : "text-zinc-500"
                          }`}
                        >
                          {hasDeliveryLocation
                            ? "Location attached ✓"
                            : "No location attached"}
                        </p>
                      </div>

                      {hasDeliveryLocation && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          📍 Open in Maps →
                        </a>
                      )}
                    </div>

                    {hasDeliveryLocation && (
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600">
                        <span>
                          Latitude:{" "}
                          {deliveryLocation.latitude.toFixed(
                            5,
                          )}
                        </span>

                        <span>
                          Longitude:{" "}
                          {deliveryLocation.longitude.toFixed(
                            5,
                          )}
                        </span>

                        {typeof deliveryLocation.accuracy ===
                          "number" && (
                          <span>
                            Accuracy: ±
                            {Math.round(
                              deliveryLocation.accuracy,
                            )}
                            m
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-zinc-500">
                  Shipping information is
                  unavailable for this demo
                  order.
                </p>
              )}
            </section>

            {/* ITEMS */}
            <section className="rounded-[2rem] border border-black/10 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                Products
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Order Items
              </h2>

              {order.items &&
              order.items.length > 0 ? (
                <div className="mt-7 space-y-4">
                  {order.items.map(
                    (item) => (
                      <div
                        key={item.productId}
                        className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-[#f7f7f5] p-5"
                      >
                        <div>
                          <p className="font-semibold">
                            {item.name}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            {item.price} SAR ×{" "}
                            {item.quantity}
                          </p>
                        </div>

                        <p className="text-lg font-bold">
                          {item.price *
                            item.quantity}{" "}
                          SAR
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-6 text-zinc-500">
                  Item details are unavailable
                  for this demo order.
                </p>
              )}
            </section>
          </div>

          {/* SUMMARY */}
          <aside className="h-fit rounded-[2rem] bg-zinc-950 p-7 text-white lg:sticky lg:top-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
              Order Summary
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              {order.id}
            </h2>

            <div className="mt-8 space-y-5 border-b border-white/10 pb-6">
              <div className="flex justify-between gap-5 text-sm">
                <span className="text-zinc-400">
                  Customer
                </span>

                <span className="text-right">
                  {order.customer}
                </span>
              </div>

              <div className="flex justify-between gap-5 text-sm">
                <span className="text-zinc-400">
                  Status
                </span>

                <span>
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between gap-5 text-sm">
                <span className="text-zinc-400">
                  Payment
                </span>

                <span className="text-right">
                  {order.paymentMethod ||
                    "Demo"}
                </span>
              </div>

              <div className="flex justify-between gap-5 text-sm">
                <span className="text-zinc-400">
                  Payment Status
                </span>

                <span
                  className={
                    order.paymentStatus === "Paid (Demo)"
                      ? "font-semibold text-green-400"
                      : order.paymentStatus === "Pending"
                        ? "font-semibold text-amber-400"
                        : "text-zinc-500"
                  }
                >
                  {order.paymentStatus ||
                    "Not available"}
                </span>
              </div>

              <div className="flex justify-between gap-5 text-sm">
                <span className="text-zinc-400">
                  Delivery Pin
                </span>

                <span
                  className={
                    hasDeliveryLocation
                      ? "font-semibold text-green-400"
                      : "text-zinc-500"
                  }
                >
                  {hasDeliveryLocation
                    ? "Attached"
                    : "Not attached"}
                </span>
              </div>
            </div>

            {hasDeliveryLocation && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 block rounded-full border border-white/15 bg-white/5 py-3 text-center text-sm font-semibold transition hover:border-blue-400 hover:text-blue-400"
              >
                📍 Open Delivery Location →
              </a>
            )}

            <div className="flex items-center justify-between py-7">
              <span className="text-lg font-bold">
                Total
              </span>

              <span className="text-2xl font-black">
                {order.total} SAR
              </span>
            </div>

            <Link
              href="/admin"
              className="block rounded-full bg-blue-600 py-4 text-center font-semibold transition hover:bg-blue-500"
            >
              Back to Orders
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}

