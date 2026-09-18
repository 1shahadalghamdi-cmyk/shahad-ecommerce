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

export default function CartPage() {
  const products = useStoreProducts();

  const {
    cart,
    totalItems,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const [promoInput, setPromoInput] =
    useState("");

  const [appliedPromo, setAppliedPromo] =
    useState<AppliedPromo | null>(null);

  const [promoMessage, setPromoMessage] =
    useState("");

  const [promoError, setPromoError] =
    useState("");

  useEffect(() => {
    const savedPromo =
      window.localStorage.getItem(
        PROMO_STORAGE_KEY,
      );

    if (!savedPromo) {
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
        const promo =
          promoCodes[
            parsed.code as PromoCode
          ];

        setAppliedPromo(promo);
        setPromoInput(promo.code);
      } else {
        window.localStorage.removeItem(
          PROMO_STORAGE_KEY,
        );
      }
    } catch {
      window.localStorage.removeItem(
        PROMO_STORAGE_KEY,
      );
    }
  }, []);

  const cartProducts = useMemo(
    () =>
      cart
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
        ),
    [cart, products],
  );

  const subtotal = useMemo(
    () =>
      cartProducts.reduce(
        (total, product) =>
          total +
          product.price *
            product.quantity,
        0,
      ),
    [cartProducts],
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

  const finalTotal = roundMoney(
    Math.max(
      0,
      subtotal - discountAmount,
    ),
  );

  function handleApplyPromo(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPromoError("");
    setPromoMessage("");

    const normalizedCode =
      promoInput
        .trim()
        .toUpperCase() as PromoCode;

    if (!normalizedCode) {
      setPromoError(
        "Enter a promo code first.",
      );
      return;
    }

    const promo =
      promoCodes[normalizedCode];

    if (!promo) {
      setPromoError(
        "This promo code is not valid.",
      );
      return;
    }

    setAppliedPromo(promo);
    setPromoInput(promo.code);

    window.localStorage.setItem(
      PROMO_STORAGE_KEY,
      JSON.stringify(promo),
    );

    setPromoMessage(
      `${promo.code} applied successfully — ${promo.label}.`,
    );
  }

  function removePromo() {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoMessage("");
    setPromoError("");

    window.localStorage.removeItem(
      PROMO_STORAGE_KEY,
    );
  }

  function handleClearCart() {
    clearCart();
    removePromo();
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
              onClick={handleClearCart}
              className="text-sm font-medium text-red-600 transition hover:text-red-700"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartProducts.length === 0 ? (
          <div className="rounded-[2rem] border border-black/10 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-zinc-950">
              <span className="text-xl font-black tracking-tight text-white">
                NOVA<span className="text-blue-500">.</span>
              </span>
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
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* ITEMS */}
            <div className="space-y-4">
              {cartProducts.map(
                (product) => (
                  <article
                    key={product.id}
                    className="flex flex-col gap-5 rounded-3xl border border-black/10 bg-white p-5 sm:flex-row"
                  >
                    <Link
                      href={`/products/${product.id}`}
                      className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 sm:w-32"
                      aria-label={`View ${product.name} details`}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-contain p-3 transition duration-300 hover:scale-105"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-zinc-400">
                          No Image
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex flex-wrap justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-zinc-400">
                            {
                              product.category
                            }
                          </p>

                          <Link
                            href={`/products/${product.id}`}
                            className="inline-block"
                          >
                            <h2 className="mt-2 text-xl font-bold transition hover:text-blue-600">
                              {product.name}
                            </h2>
                          </Link>

                          <p className="mt-2 font-semibold">
                            {formatMoney(product.price)} SAR
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
                          {formatMoney(
                            product.price *
                              product.quantity,
                          )}{" "}
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

              {/* PROMO CODE */}
              <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      Promo Code
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Apply an available discount code
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Offer
                  </span>
                </div>

                {appliedPromo ? (
                  <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-green-400">
                          {
                            appliedPromo.code
                          }
                        </p>

                        <p className="mt-1 text-xs leading-5 text-green-200">
                          {
                            appliedPromo.label
                          }
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={removePromo}
                        className="text-xs font-semibold text-red-300 transition hover:text-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={
                      handleApplyPromo
                    }
                    className="mt-4"
                  >
                    <div className="flex gap-2">
                      <input
                        value={promoInput}
                        onChange={(event) =>
                          setPromoInput(
                            event.target.value,
                          )
                        }
                        placeholder="Enter code"
                        autoCapitalize="characters"
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-zinc-500 focus:border-blue-500"
                      />

                      <button
                        type="submit"
                        className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-blue-500 hover:text-white"
                      >
                        Apply
                      </button>
                    </div>
                  </form>
                )}

                {promoMessage && (
                  <p className="mt-3 text-xs leading-5 text-green-400">
                    {promoMessage}
                  </p>
                )}

                {promoError && (
                  <p className="mt-3 text-xs leading-5 text-red-400">
                    {promoError}
                  </p>
                )}

                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                    Demo Codes
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      "NOVA10",
                      "WELCOME15",
                      "SAVE50",
                    ].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setPromoInput(
                            code,
                          );
                          setPromoError("");
                          setPromoMessage("");
                        }}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-blue-500 hover:text-blue-400"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-4 border-b border-white/10 pb-6 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Items</span>

                  <span className="text-white">
                    {totalItems}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>

                  <span className="text-white">
                    {formatMoney(subtotal)} SAR
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between gap-4 text-green-400">
                    <span>
                      Discount (
                      {appliedPromo.code})
                    </span>

                    <span>
                      −{formatMoney(discountAmount)} SAR
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>

                  <span className="text-green-400">
                    Free
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-6">
                <div>
                  <p className="text-sm text-zinc-500">
                    Final Total
                  </p>

                  {appliedPromo && (
                    <p className="mt-1 text-xs text-green-400">
                      You save{" "}
                      {formatMoney(discountAmount)} SAR
                    </p>
                  )}
                </div>

                <span className="text-2xl font-black">
                  {formatMoney(finalTotal)} SAR
                </span>
              </div>

              <Link
                href="/checkout"
                className="block w-full rounded-full bg-blue-600 py-4 text-center font-semibold transition hover:bg-blue-500"
              >
                Proceed to Checkout →
              </Link>

              <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
                Applied promo codes are carried
                into checkout automatically.
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}


