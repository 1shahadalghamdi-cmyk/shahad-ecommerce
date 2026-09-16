"use client";

import Link from "next/link";

import {
  useCart,
} from "@/components/CartProvider";

import {
  useStoreProducts,
} from "@/hooks/useStoreProducts";

const categories = [
  {
    name: "Computers",
    icon: "💻",
    description:
      "Performance for work and creativity",
  },
  {
    name: "Accessories",
    icon: "⌨️",
    description:
      "Upgrade your everyday setup",
  },
  {
    name: "Audio",
    icon: "🎧",
    description:
      "Premium sound, anywhere",
  },
  {
    name: "Displays",
    icon: "🖥️",
    description:
      "See every detail clearly",
  },
];

export default function Home() {
  const products =
    useStoreProducts();

  const {
    addToCart,
    totalItems,
  } = useCart();

  const featuredProduct =
    products.find(
      (product) =>
        product.id === 1,
    ) ||
    products[0];

  const featuredProducts =
    products.slice(0, 4);

  function scrollToProducts() {
    document
      .getElementById(
        "products",
      )
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  function scrollToCategories() {
    document
      .getElementById(
        "categories",
      )
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-zinc-950">
      {/* NAVBAR */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            NOVA
            <span className="text-blue-600">
              .
            </span>
          </Link>

          <nav className="hidden items-center gap-9 text-sm font-medium md:flex">
            <Link
              href="/"
              className="transition hover:text-blue-600"
            >
              Home
            </Link>

            <button
              onClick={
                scrollToProducts
              }
              className="transition hover:text-blue-600"
            >
              Shop
            </button>

            <button
              onClick={
                scrollToCategories
              }
              className="transition hover:text-blue-600"
            >
              Categories
            </button>

            <a
              href="#about"
              className="transition hover:text-blue-600"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium transition hover:border-blue-600 hover:text-blue-600 sm:block"
            >
              Sign In
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

      {/* HERO */}
      <section className="border-b border-black/5 bg-[#f7f7f5]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">
              Modern Technology Store
            </p>

            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.05] md:text-6xl">
              Technology designed
              for your{" "}
              <span className="text-blue-600">
                everyday life.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-500">
              Discover carefully
              selected technology,
              accessories, and devices
              designed to improve the
              way you work, create,
              and connect.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <button
                onClick={
                  scrollToProducts
                }
                className="rounded-full bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
              >
                Shop Collection
              </button>

              <button
                onClick={
                  scrollToCategories
                }
                className="rounded-full border border-black/10 bg-white px-8 py-4 font-semibold transition hover:border-blue-600 hover:text-blue-600"
              >
                Explore Categories
              </button>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-black/10 pt-8">
              <div>
                <p className="text-2xl font-black">
                  {
                    categories.length
                  }
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Product Categories
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">
                  {
                    products.length
                  }
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Store Products
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">
                  100%
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Responsive Experience
                </p>
              </div>
            </div>
          </div>

          {/* FEATURED HERO PRODUCT */}
          {featuredProduct ? (
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-950 to-blue-900 p-8 text-white md:p-10">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium">
                  Featured Product
                </span>

                <span className="text-sm text-white/50">
                  NOVA / 2026
                </span>
              </div>

              <div className="flex min-h-64 items-center justify-center text-8xl md:text-9xl">
                {
                  featuredProduct.icon
                }
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                {
                  featuredProduct.category
                }
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                {
                  featuredProduct.name
                }
              </h2>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
                <div>
                  <p className="text-2xl font-black">
                    {
                      featuredProduct.price
                    }{" "}
                    SAR
                  </p>

                  <p
                    className={`mt-2 text-xs font-medium ${
                      featuredProduct.stock >
                      0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {featuredProduct.stock >
                    0
                      ? `${featuredProduct.stock} in stock`
                      : "Out of stock"}
                  </p>
                </div>

                <button
                  disabled={
                    featuredProduct.stock <=
                    0
                  }
                  onClick={() =>
                    addToCart(
                      featuredProduct.id,
                    )
                  }
                  className="rounded-full bg-white px-7 py-3 font-semibold text-black transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                >
                  {featuredProduct.stock >
                  0
                    ? "Add to Cart →"
                    : "Sold Out"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-96 items-center justify-center rounded-[2.5rem] bg-zinc-950 p-8 text-center text-white">
              <div>
                <div className="text-6xl">
                  📦
                </div>

                <p className="mt-5 text-xl font-bold">
                  No products available
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section
        id="categories"
        className="bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                Categories
              </p>

              <h2 className="mt-3 text-4xl font-black">
                Shop by category
              </h2>
            </div>

            <button
              onClick={
                scrollToProducts
              }
              className="font-medium text-blue-600"
            >
              View all →
            </button>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(
              (category) => {
                const count =
                  products.filter(
                    (product) =>
                      product.category ===
                      category.name,
                  ).length;

                return (
                  <button
                    key={
                      category.name
                    }
                    onClick={
                      scrollToProducts
                    }
                    className="rounded-3xl border border-black/10 bg-[#f7f7f5] p-7 text-left transition hover:-translate-y-1 hover:border-blue-600"
                  >
                    <div className="text-5xl">
                      {
                        category.icon
                      }
                    </div>

                    <h3 className="mt-8 text-xl font-bold">
                      {
                        category.name
                      }
                    </h3>

                    <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-500">
                      {
                        category.description
                      }
                    </p>

                    <div className="mt-7 flex items-center justify-between">
                      <span className="font-medium text-blue-600">
                        Explore →
                      </span>

                      <span className="text-xs text-zinc-400">
                        {count}{" "}
                        {count === 1
                          ? "product"
                          : "products"}
                      </span>
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section
        id="products"
        className="bg-[#f7f7f5]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Featured Products
          </p>

          <h2 className="mt-3 text-4xl font-black">
            Built for your setup
          </h2>

          {featuredProducts.length >
          0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {featuredProducts.map(
                (
                  product,
                  index,
                ) => (
                  <article
                    key={
                      product.id
                    }
                    className="overflow-hidden rounded-3xl border border-black/10 bg-white"
                  >
                    <div className="relative flex h-72 items-center justify-center bg-zinc-100 text-7xl">
                      <span className="absolute left-5 top-5 rounded-full bg-black px-3 py-1.5 text-xs text-white">
                        {index === 0
                          ? "Featured"
                          : product.stock <=
                              5
                            ? "Low Stock"
                            : "NOVA"}
                      </span>

                      {
                        product.icon
                      }
                    </div>

                    <div className="p-6">
                      <p className="text-xs uppercase tracking-widest text-zinc-400">
                        {
                          product.category
                        }
                      </p>

                      <h3 className="mt-3 min-h-14 text-xl font-bold">
                        {
                          product.name
                        }
                      </h3>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <p className="text-lg font-bold">
                          {
                            product.price
                          }{" "}
                          SAR
                        </p>

                        <p
                          className={`text-xs font-medium ${
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
                            ? `${product.stock} left`
                            : "Sold out"}
                        </p>
                      </div>

                      <button
                        disabled={
                          product.stock <=
                          0
                        }
                        onClick={() =>
                          addToCart(
                            product.id,
                          )
                        }
                        className="mt-6 w-full rounded-full bg-black py-3.5 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                      >
                        {product.stock >
                        0
                          ? "Add to Cart"
                          : "Out of Stock"}
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-black/10 bg-white px-6 py-20 text-center">
              <div className="text-6xl">
                📦
              </div>

              <h3 className="mt-5 text-2xl font-bold">
                No products available
              </h3>

              <p className="mt-2 text-zinc-500">
                Add products from
                the NOVA administration
                dashboard.
              </p>
            </div>
          )}

          {products.length > 4 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {products
                .slice(4)
                .map(
                  (product) => (
                    <article
                      key={
                        product.id
                      }
                      className="overflow-hidden rounded-3xl border border-black/10 bg-white"
                    >
                      <div className="flex h-60 items-center justify-center bg-zinc-100 text-7xl">
                        {
                          product.icon
                        }
                      </div>

                      <div className="p-6">
                        <p className="text-xs uppercase tracking-widest text-zinc-400">
                          {
                            product.category
                          }
                        </p>

                        <h3 className="mt-3 min-h-14 text-xl font-bold">
                          {
                            product.name
                          }
                        </h3>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <p className="font-bold">
                            {
                              product.price
                            }{" "}
                            SAR
                          </p>

                          <p className="text-xs text-zinc-500">
                            {
                              product.stock
                            }{" "}
                            in stock
                          </p>
                        </div>

                        <button
                          disabled={
                            product.stock <=
                            0
                          }
                          onClick={() =>
                            addToCart(
                              product.id,
                            )
                          }
                          className="mt-6 w-full rounded-full bg-black py-3.5 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                        >
                          {product.stock >
                          0
                            ? "Add to Cart"
                            : "Out of Stock"}
                        </button>
                      </div>
                    </article>
                  ),
                )}
            </div>
          )}
        </div>
      </section>

      {/* WHY NOVA */}
      <section
        id="about"
        className="bg-zinc-950 text-white"
      >
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              Why NOVA
            </p>

            <h2 className="mt-5 max-w-xl text-5xl font-black leading-tight">
              A complete digital
              commerce experience.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                title:
                  "Secure Checkout",
                description:
                  "Structured checkout workflow with simulated payment options.",
              },
              {
                title:
                  "Inventory Control",
                description:
                  "Real-time product stock synchronized with the admin dashboard.",
              },
              {
                title:
                  "Product Management",
                description:
                  "Products can be created, updated, and removed by administrators.",
              },
              {
                title:
                  "Order Management",
                description:
                  "Customer orders flow directly into the administration workflow.",
              },
            ].map(
              (feature) => (
                <div
                  key={
                    feature.title
                  }
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <h3 className="font-bold">
                    {
                      feature.title
                    }
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {
                      feature.description
                    }
                  </p>
                </div>
              ),
            )}
          </div>
        </div>

        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8">
            <p className="font-black">
              NOVA
              <span className="text-blue-500">
                .
              </span>
            </p>

            <p className="text-sm text-zinc-500">
              Enterprise E-Commerce
              Platform • Portfolio Project
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}
