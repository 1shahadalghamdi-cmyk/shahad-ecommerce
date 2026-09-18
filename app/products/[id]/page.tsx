"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  useParams,
} from "next/navigation";

import {
  useCart,
} from "@/components/CartProvider";

import {
  useStoreProducts,
} from "@/hooks/useStoreProducts";

const WISHLIST_STORAGE_KEY =
  "nova-wishlist";

export default function ProductDetailsPage() {
  const params = useParams();
  const products = useStoreProducts();

  const {
    cart,
    addToCart,
    totalItems,
  } = useCart();

  const rawId = params?.id;

  const productId = Number(
    Array.isArray(rawId)
      ? rawId[0]
      : rawId,
  );

  const product =
    products.find(
      (item) =>
        item.id === productId,
    );

  const [wishlistIds, setWishlistIds] =
    useState<number[]>([]);

  const [quantity, setQuantity] =
    useState(1);

  const [added, setAdded] =
    useState(false);

  useEffect(() => {
    const saved =
      window.localStorage.getItem(
        WISHLIST_STORAGE_KEY,
      );

    if (!saved) {
      return;
    }

    try {
      const parsed =
        JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setWishlistIds(
          parsed.filter(
            (item) =>
              typeof item === "number",
          ),
        );
      }
    } catch {
      setWishlistIds([]);
    }
  }, []);

  useEffect(() => {
    setQuantity(1);
    setAdded(false);
  }, [productId]);

  const existingCartQuantity =
    useMemo(() => {
      if (!product) {
        return 0;
      }

      return (
        cart.find(
          (item) =>
            item.productId ===
            product.id,
        )?.quantity || 0
      );
    }, [cart, product]);

  const maxSelectableQuantity =
    product
      ? Math.max(
          0,
          product.stock -
            existingCartQuantity,
        )
      : 0;

  const relatedProducts =
    useMemo(() => {
      if (!product) {
        return [];
      }

      return products
        .filter(
          (item) =>
            item.category ===
              product.category &&
            item.id !== product.id,
        )
        .slice(0, 3);
    }, [products, product]);

  function toggleWishlist(
    targetProductId: number,
  ) {
    setWishlistIds((current) => {
      const updated =
        current.includes(
          targetProductId,
        )
          ? current.filter(
              (id) =>
                id !==
                targetProductId,
            )
          : [
              ...current,
              targetProductId,
            ];

      window.localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(updated),
      );

      return updated;
    });
  }

  function handleAddToCart() {
    if (
      !product ||
      product.stock <= 0 ||
      maxSelectableQuantity <= 0
    ) {
      return;
    }

    const safeQuantity =
      Math.min(
        quantity,
        maxSelectableQuantity,
      );

    for (
      let index = 0;
      index < safeQuantity;
      index += 1
    ) {
      addToCart(product.id);
    }

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2200);
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-zinc-950">
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
              className="text-sm font-medium text-blue-600"
            >
              ← Back to Store
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="rounded-[2.5rem] border border-black/10 bg-white p-12">
            <h1 className="text-3xl font-black">
              Product not found
            </h1>

            <p className="mt-3 text-zinc-500">
              This product is not currently available in the NOVA catalog.
            </p>

            <Link
              href="/#products"
              className="mt-8 inline-block rounded-full bg-blue-600 px-7 py-4 font-semibold text-white"
            >
              Browse Products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const isWishlisted =
    wishlistIds.includes(
      product.id,
    );

  const cartIsAtStockLimit =
    maxSelectableQuantity <= 0;

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
              href="/#products"
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium transition hover:border-blue-600 hover:text-blue-600"
            >
              ← Back to Products
            </Link>

            <Link
              href="/cart"
              className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Cart ({totalItems})
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        {/* BREADCRUMB */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
          <Link
            href="/"
            className="transition hover:text-blue-600"
          >
            Store
          </Link>

          <span>/</span>

          <Link
            href="/#products"
            className="transition hover:text-blue-600"
          >
            {product.category}
          </Link>

          <span>/</span>

          <span className="font-medium text-zinc-700">
            {product.name}
          </span>
        </nav>

        {/* MAIN PRODUCT */}
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          {/* IMAGE */}
          <div className="overflow-hidden rounded-[2.5rem] border border-black/10 bg-white">
            <div className="flex min-h-[560px] items-center justify-center bg-zinc-100 p-5 md:p-8">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-[530px] w-full object-contain"
                />
              ) : (
                <div className="rounded-2xl bg-white px-8 py-6 text-sm font-semibold text-zinc-400">
                  Product image unavailable
                </div>
              )}
            </div>
          </div>

          {/* INFO */}
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
                {product.category}
              </span>

              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  product.stock <= 0
                    ? "bg-red-50 text-red-600"
                    : product.stock <= 5
                      ? "bg-amber-50 text-amber-600"
                      : "bg-green-50 text-green-600"
                }`}
              >
                {product.stock <= 0
                  ? "Sold Out"
                  : product.stock <= 5
                    ? `Only ${product.stock} left`
                    : `${product.stock} in stock`}
              </span>

              <span className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-500">
                SKU: NOVA-{String(product.id).padStart(4, "0")}
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 text-3xl font-black">
              {product.price} SAR
            </p>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-500">
              {product.description ||
                product.shortDescription ||
                "A carefully selected NOVA technology product designed for modern everyday use."}
            </p>

            {/* QUANTITY + ACTIONS */}
            <div className="mt-8 rounded-[2rem] border border-black/10 bg-white p-5">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Quantity
                  </p>

                  <div className="mt-3 flex w-fit items-center rounded-full border border-black/10 bg-[#f7f7f5]">
                    <button
                      type="button"
                      disabled={
                        quantity <= 1
                      }
                      onClick={() =>
                        setQuantity(
                          (current) =>
                            Math.max(
                              1,
                              current - 1,
                            ),
                        )
                      }
                      className="px-5 py-3 text-xl disabled:cursor-not-allowed disabled:text-zinc-300"
                    >
                      −
                    </button>

                    <span className="min-w-12 text-center font-bold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      disabled={
                        quantity >=
                          maxSelectableQuantity ||
                        cartIsAtStockLimit
                      }
                      onClick={() =>
                        setQuantity(
                          (current) =>
                            Math.min(
                              maxSelectableQuantity,
                              current + 1,
                            ),
                        )
                      }
                      className="px-5 py-3 text-xl disabled:cursor-not-allowed disabled:text-zinc-300"
                    >
                      +
                    </button>
                  </div>

                  {existingCartQuantity > 0 && (
                    <p className="mt-2 text-xs text-zinc-400">
                      {existingCartQuantity} already in your cart
                    </p>
                  )}
                </div>

                <p className="text-sm text-zinc-500">
                  {cartIsAtStockLimit
                    ? "Maximum available quantity is already in your cart."
                    : `${maxSelectableQuantity} available to add`}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  disabled={
                    product.stock <= 0 ||
                    cartIsAtStockLimit
                  }
                  onClick={
                    handleAddToCart
                  }
                  className={`rounded-full px-8 py-4 font-semibold text-white transition-all disabled:cursor-not-allowed disabled:bg-zinc-300 ${
                    added
                      ? "scale-[1.02] bg-green-600 shadow-lg"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {product.stock <= 0
                    ? "Out of Stock"
                    : cartIsAtStockLimit
                      ? "Stock Limit Reached"
                      : added
                        ? `✓ Added ${quantity} to Cart`
                        : `Add ${quantity} to Cart →`}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toggleWishlist(
                      product.id,
                    )
                  }
                  className={`rounded-full border px-7 py-4 font-semibold transition ${
                    isWishlisted
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-black/10 bg-white hover:border-rose-500 hover:text-rose-600"
                  }`}
                >
                  {isWishlisted
                    ? "♥ Saved to Wishlist"
                    : "♡ Add to Wishlist"}
                </button>
              </div>
            </div>

            {/* SERVICE CARDS */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <p className="text-sm font-bold">
                  Free Delivery
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Enjoy complimentary delivery on all NOVA orders.
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <p className="text-sm font-bold">
                  Easy Returns
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Simple and flexible returns for eligible products.
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <p className="text-sm font-bold">
                  NOVA Support
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Get help with products, orders, delivery, and account questions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS + SPECS */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-[2rem] bg-zinc-950 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              Product Overview
            </p>

            <h2 className="mt-4 text-3xl font-black">
              {product.name}
            </h2>

            <p className="mt-5 leading-7 text-zinc-400">
              {product.description ||
                product.shortDescription ||
                "A modern NOVA product selected for practical everyday use."}
            </p>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-sm text-zinc-500">
                Product ID
              </p>

              <p className="mt-1 font-semibold">
                NOVA-{String(product.id).padStart(4, "0")}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
              Specifications
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Product specifications
            </h2>

            {product.specifications &&
            product.specifications.length > 0 ? (
              <div className="mt-8 divide-y divide-black/10">
                {product.specifications.map(
                  (specification) => (
                    <div
                      key={
                        specification.label
                      }
                      className="flex flex-wrap items-center justify-between gap-4 py-5"
                    >
                      <span className="text-zinc-500">
                        {specification.label}
                      </span>

                      <span className="font-semibold">
                        {specification.value}
                      </span>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="mt-6 text-zinc-500">
                Detailed specifications will be added to this product.
              </p>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                  You May Also Like
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Related products
                </h2>
              </div>

              <Link
                href="/#products"
                className="font-semibold text-blue-600"
              >
                View all products →
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map(
                (relatedProduct) => {
                  const relatedWishlisted =
                    wishlistIds.includes(
                      relatedProduct.id,
                    );

                  return (
                    <article
                      key={
                        relatedProduct.id
                      }
                      className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white"
                    >
                      <div className="relative flex h-64 items-center justify-center bg-zinc-100 p-6">
                        <Link
                          href={`/products/${relatedProduct.id}`}
                          className="flex h-full w-full items-center justify-center"
                        >
                          {relatedProduct.image ? (
                            <img
                              src={
                                relatedProduct.image
                              }
                              alt={
                                relatedProduct.name
                              }
                              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-zinc-400">
                              Product image unavailable
                            </span>
                          )}
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            toggleWishlist(
                              relatedProduct.id,
                            )
                          }
                          className={`absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border text-xl shadow-sm transition ${
                            relatedWishlisted
                              ? "border-rose-500 bg-rose-500 text-white"
                              : "border-black/10 bg-white text-zinc-500 hover:border-rose-500 hover:text-rose-600"
                          }`}
                        >
                          {relatedWishlisted
                            ? "♥"
                            : "♡"}
                        </button>
                      </div>

                      <div className="p-6">
                        <p className="text-xs uppercase tracking-widest text-zinc-400">
                          {relatedProduct.category}
                        </p>

                        <Link
                          href={`/products/${relatedProduct.id}`}
                        >
                          <h3 className="mt-3 text-xl font-bold transition hover:text-blue-600">
                            {relatedProduct.name}
                          </h3>
                        </Link>

                        <div className="mt-5 flex items-center justify-between gap-4">
                          <p className="font-bold">
                            {relatedProduct.price} SAR
                          </p>

                          <p
                            className={`text-xs font-medium ${
                              relatedProduct.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {relatedProduct.stock > 0
                              ? `${relatedProduct.stock} in stock`
                              : "Sold out"}
                          </p>
                        </div>

                        <Link
                          href={`/products/${relatedProduct.id}`}
                          className="mt-6 block rounded-full border border-black/10 py-3.5 text-center text-sm font-semibold transition hover:border-blue-600 hover:text-blue-600"
                        >
                          View Details →
                        </Link>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

