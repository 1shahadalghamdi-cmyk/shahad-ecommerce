"use client";

import Link from "next/link";

import { useCart } from "@/components/CartProvider";
import { useStoreProducts } from "@/hooks/useStoreProducts";

export default function CartPage() {
  const products = useStoreProducts();

  const {
    cart,
    totalItems,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const cartProducts = cart
    .map((item) => {
      const product = products.find(
        (product) =>
          product.id === item.productId,
      );

      if (!product) return null;

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
    );

  const subtotal = cartProducts.reduce(
    (total, product) =>
      total +
      product.price * product.quantity,
    0,
  );

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
            href="/"
            className="text-sm font-medium transition hover:text-blue-600"
          >
            ← Continue Shopping
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
              Shopping Cart
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Your Cart
            </h1>

            <p className="mt-3 text-zinc-500">
              {totalItems}{" "}
              {totalItems === 1
                ? "item"
                : "items"}{" "}
              in your cart
            </p>
          </div>

          {cartProducts.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm font-medium text-red-600 transition hover:text-red-700"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartProducts.length === 0 ? (
          <div className="rounded-[2rem] border border-black/10 bg-white px-6 py-20 text-center">
            <div className="text-7xl">
              🛒
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-zinc-500">
              Discover NOVA products and add
              something to your setup.
            </p>

            <Link
              href="/#products"
              className="mt-8 inline-block rounded-full bg-blue-600 px-7 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              Shop Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* ITEMS */}
            <div className="space-y-4">
              {cartProducts.map(
                (product) => (
                  <article
                    key={product.id}
                    className="flex flex-col gap-5 rounded-3xl border border-black/10 bg-white p-5 sm:flex-row"
                  >
                    <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-6xl sm:w-32">
                      {product.icon}
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex flex-wrap justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-zinc-400">
                            {
                              product.category
                            }
                          </p>

                          <h2 className="mt-2 text-xl font-bold">
                            {product.name}
                          </h2>

                          <p className="mt-2 font-semibold">
                            {product.price} SAR
                          </p>

                          <p
                            className={`mt-2 text-xs font-medium ${
                              product.stock >
                              0
                                ? product.stock <=
                                  5
                                  ? "text-amber-600"
                                  : "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {product.stock >
                            0
                              ? `${product.stock} available`
                              : "Out of stock"}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            removeFromCart(
                              product.id,
                            )
                          }
                          className="h-fit text-sm font-medium text-red-600"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center rounded-full border border-black/10 bg-[#f7f7f5]">
                          <button
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                product.quantity -
                                  1,
                              )
                            }
                            className="px-4 py-2 text-lg"
                          >
                            −
                          </button>

                          <span className="min-w-10 text-center font-semibold">
                            {
                              product.quantity
                            }
                          </span>

                          <button
                            disabled={
                              product.quantity >=
                              product.stock
                            }
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                product.quantity +
                                  1,
                              )
                            }
                            className="px-4 py-2 text-lg disabled:cursor-not-allowed disabled:text-zinc-300"
                          >
                            +
                          </button>
                        </div>

                        <p className="text-lg font-bold">
                          {product.price *
                            product.quantity}{" "}
                          SAR
                        </p>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>

            {/* SUMMARY */}
            <aside className="h-fit rounded-[2rem] bg-zinc-950 p-7 text-white lg:sticky lg:top-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                Order Summary
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Summary
              </h2>

              <div className="mt-8 space-y-4 border-b border-white/10 pb-6 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Items</span>

                  <span className="text-white">
                    {totalItems}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>

                  <span className="text-white">
                    {subtotal} SAR
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>

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

              <Link
                href="/checkout"
                className="block w-full rounded-full bg-blue-600 py-4 text-center font-semibold transition hover:bg-blue-500"
              >
                Proceed to Checkout →
              </Link>

              <p className="mt-4 text-center text-xs text-zinc-500">
                Secure checkout simulation
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
