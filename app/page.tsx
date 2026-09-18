"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import {
  useCart,
} from "@/components/CartProvider";

import {
  useStoreProducts,
} from "@/hooks/useStoreProducts";


type SupportMessage = {
  id: string;
  sender: "customer" | "admin";
  text: string;
  createdAt: string;
};

type SupportConversation = {
  id: string;
  customerName: string;
  customerEmail: string;
  status: "Open" | "Closed";
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
};

const SUPPORT_STORAGE_KEY =
  "nova-support-conversations";

const CUSTOMER_CHAT_ID_KEY =
  "nova-support-conversation-id";

const CUSTOMER_CHAT_LAST_SEEN_KEY =
  "nova-support-last-seen";

const WISHLIST_STORAGE_KEY =
  "nova-wishlist";

function getStoredConversations(): SupportConversation[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved =
    window.localStorage.getItem(
      SUPPORT_STORAGE_KEY,
    );

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

type CustomerSession = {
  id: string;
  name: string;
  email: string;
};

const CUSTOMER_SESSION_KEY =
  "nova-customer-session";

const categories = [
  {
    name: "Computers",
    image: "/products/novabook-pro.png",
    description:
      "Performance for work and creativity",
  },
  {
    name: "Accessories",
    image: "/products/arc-keyboard.png",
    description:
      "Upgrade your everyday setup",
  },
  {
    name: "Audio",
    image: "/products/nova-headphones.png",
    description:
      "Premium sound, anywhere",
  },
  {
    name: "Displays",
    image: "/products/vision-monitor.png",
    description:
      "See every detail clearly",
  },
];

function getProductImage(
  productName: string,
  productImage?: string,
) {
  if (productImage) {
    return productImage;
  }

  const normalizedName =
    productName.trim().toLowerCase();

  const productImages: Record<
    string,
    string
  > = {
    "nova wireless headphones":
      "/products/nova-headphones.png",
    "arc mechanical keyboard":
      "/products/arc-keyboard.png",
    "flow wireless mouse":
      "/products/flow-mouse.png",
    "vision 27” monitor":
      "/products/vision-monitor.png",
    'vision 27" monitor':
      "/products/vision-monitor.png",
    "novabook pro 14":
      "/products/novabook-pro.png",
    "nova mini pc":
      "/products/nova-mini-pc.png",
    "nova usb-c hub":
      "/products/nova-usb-c-hub.png",
  };

  return (
    productImages[normalizedName] || ""
  );
}


export default function Home() {
  const products =
    useStoreProducts();

  const {
    addToCart,
    totalItems,
  } = useCart();

  const [chatOpen, setChatOpen] =
    useState(false);

  const [chatName, setChatName] =
    useState("");

  const [chatEmail, setChatEmail] =
    useState("");

  const [chatMessage, setChatMessage] =
    useState("");

  const [conversation, setConversation] =
    useState<SupportConversation | null>(
      null,
    );

  const [chatError, setChatError] =
    useState("");

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [productSearch, setProductSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [wishlistIds, setWishlistIds] =
    useState<number[]>([]);

  const [wishlistOnly, setWishlistOnly] =
    useState(false);

  const [addedProductId, setAddedProductId] =
    useState<number | null>(null);

  const [cartToast, setCartToast] =
    useState("");

  const [cartPulse, setCartPulse] =
    useState(false);

  const [customerSession, setCustomerSession] =
    useState<CustomerSession | null>(
      null,
    );

  const cartFeedbackTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      productSearch.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.category
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesWishlist =
        !wishlistOnly ||
        wishlistIds.includes(product.id);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesWishlist
      );
    });
  }, [
    products,
    productSearch,
    selectedCategory,
    wishlistIds,
    wishlistOnly,
  ]);

  useEffect(() => {
    function syncCustomerSession() {
      const savedSession =
        window.localStorage.getItem(
          CUSTOMER_SESSION_KEY,
        );

      if (!savedSession) {
        setCustomerSession(null);
        return;
      }

      try {
        setCustomerSession(
          JSON.parse(
            savedSession,
          ),
        );
      } catch {
        setCustomerSession(null);
        window.localStorage.removeItem(
          CUSTOMER_SESSION_KEY,
        );
      }
    }

    syncCustomerSession();

    window.addEventListener(
      "storage",
      syncCustomerSession,
    );

    window.addEventListener(
      "focus",
      syncCustomerSession,
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncCustomerSession,
      );

      window.removeEventListener(
        "focus",
        syncCustomerSession,
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      if (cartFeedbackTimer.current) {
        clearTimeout(
          cartFeedbackTimer.current,
        );
      }
    };
  }, []);

  useEffect(() => {
    function syncWishlist() {
      const savedWishlist =
        window.localStorage.getItem(
          WISHLIST_STORAGE_KEY,
        );

      if (!savedWishlist) {
        setWishlistIds([]);
        return;
      }

      try {
        const parsed =
          JSON.parse(savedWishlist);

        if (
          Array.isArray(parsed)
        ) {
          setWishlistIds(
            parsed.filter(
              (item) =>
                typeof item ===
                "number",
            ),
          );
        }
      } catch {
        setWishlistIds([]);
      }
    }

    syncWishlist();

    window.addEventListener(
      "storage",
      syncWishlist,
    );

    window.addEventListener(
      "focus",
      syncWishlist,
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncWishlist,
      );

      window.removeEventListener(
        "focus",
        syncWishlist,
      );
    };
  }, []);

  useEffect(() => {
    function syncConversation() {
      const activeConversationId =
        window.localStorage.getItem(
          CUSTOMER_CHAT_ID_KEY,
        );

      if (!activeConversationId) {
        setConversation(null);
        return;
      }

      const conversations =
        getStoredConversations();

      const activeConversation =
        conversations.find(
          (item) =>
            item.id ===
            activeConversationId,
        ) || null;

      setConversation(activeConversation);

      if (activeConversation) {
        setChatName(
          activeConversation.customerName,
        );

        setChatEmail(
          activeConversation.customerEmail,
        );

        const lastSeenValue =
          window.localStorage.getItem(
            CUSTOMER_CHAT_LAST_SEEN_KEY,
          );

        const lastSeenTime =
          lastSeenValue
            ? new Date(
                lastSeenValue,
              ).getTime()
            : 0;

        const unreadAdminMessages =
          activeConversation.messages.filter(
            (message) =>
              message.sender === "admin" &&
              new Date(
                message.createdAt,
              ).getTime() >
                lastSeenTime,
          ).length;

        setUnreadCount(
          unreadAdminMessages,
        );
      } else {
        setUnreadCount(0);
      }
    }

    syncConversation();

    window.addEventListener(
      "storage",
      syncConversation,
    );

    window.addEventListener(
      "focus",
      syncConversation,
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncConversation,
      );

      window.removeEventListener(
        "focus",
        syncConversation,
      );
    };
  }, []);

  useEffect(() => {
    if (!chatOpen || !conversation) {
      return;
    }

    const latestAdminMessage =
      [...conversation.messages]
        .reverse()
        .find(
          (message) =>
            message.sender === "admin",
        );

    if (!latestAdminMessage) {
      setUnreadCount(0);
      return;
    }

    window.localStorage.setItem(
      CUSTOMER_CHAT_LAST_SEEN_KEY,
      latestAdminMessage.createdAt,
    );

    setUnreadCount(0);
  }, [chatOpen, conversation]);

  function sendChatMessage(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setChatError("");

    const cleanName =
      chatName.trim();

    const cleanEmail =
      chatEmail.trim();

    const cleanMessage =
      chatMessage.trim();

    if (!cleanName) {
      setChatError(
        "Please enter your name.",
      );
      return;
    }

    if (!cleanMessage) {
      setChatError(
        "Please enter a message.",
      );
      return;
    }

    const now =
      new Date().toISOString();

    const newMessage: SupportMessage = {
      id: `MSG-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      sender: "customer",
      text: cleanMessage,
      createdAt: now,
    };

    const conversations =
      getStoredConversations();

    let activeConversation =
      conversation;

    if (!activeConversation) {
      activeConversation = {
        id: `CHAT-${Date.now()
          .toString()
          .slice(-8)}`,
        customerName: cleanName,
        customerEmail: cleanEmail,
        status: "Open",
        createdAt: now,
        updatedAt: now,
        messages: [newMessage],
      };

      window.localStorage.setItem(
        CUSTOMER_CHAT_ID_KEY,
        activeConversation.id,
      );

      conversations.unshift(
        activeConversation,
      );
    } else {
      activeConversation = {
        ...activeConversation,
        customerName: cleanName,
        customerEmail: cleanEmail,
        status: "Open",
        updatedAt: now,
        messages: [
          ...activeConversation.messages,
          newMessage,
        ],
      };

      const conversationIndex =
        conversations.findIndex(
          (item) =>
            item.id ===
            activeConversation?.id,
        );

      if (conversationIndex >= 0) {
        conversations[
          conversationIndex
        ] = activeConversation;
      } else {
        conversations.unshift(
          activeConversation,
        );
      }
    }

    window.localStorage.setItem(
      SUPPORT_STORAGE_KEY,
      JSON.stringify(conversations),
    );

    setConversation(
      activeConversation,
    );

    setChatMessage("");
  }

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

  function chooseCategory(
    categoryName: string,
  ) {
    setSelectedCategory(categoryName);

    document
      .getElementById(
        "products",
      )
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  function clearProductFilters() {
    setProductSearch("");
    setSelectedCategory("All");
    setWishlistOnly(false);
  }

  function toggleWishlist(
    productId: number,
  ) {
    setWishlistIds((current) => {
      const updated =
        current.includes(productId)
          ? current.filter(
              (id) => id !== productId,
            )
          : [...current, productId];

      window.localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(updated),
      );

      return updated;
    });
  }

  function openWishlist() {
    setWishlistOnly(true);

    document
      .getElementById(
        "products",
      )
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  function handleAddToCart(
    productId: number,
    productName: string,
  ) {
    addToCart(productId);

    setAddedProductId(productId);
    setCartToast(productName);
    setCartPulse(true);

    if (cartFeedbackTimer.current) {
      clearTimeout(
        cartFeedbackTimer.current,
      );
    }

    cartFeedbackTimer.current =
      setTimeout(() => {
        setAddedProductId(null);
        setCartToast("");
        setCartPulse(false);
      }, 2600);
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

            <Link
              href="/track-order"
              className="transition hover:text-blue-600"
            >
              Track Order
            </Link>

            <a
              href="#about"
              className="transition hover:text-blue-600"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="hidden rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium transition hover:border-blue-600 hover:text-blue-600 sm:block"
            >
              {customerSession
                ? `Hi, ${customerSession.name.split(" ")[0]}`
                : "Sign In"}
            </Link>

            <button
              type="button"
              onClick={openWishlist}
              className="hidden rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium transition hover:border-rose-500 hover:text-rose-600 sm:block"
            >
              Wishlist ({wishlistIds.length})
            </button>

            <Link
              href="/cart"
              className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ${
                cartPulse
                  ? "scale-110 bg-green-600 shadow-lg ring-4 ring-green-100"
                  : "bg-black hover:bg-zinc-800"
              }`}
            >
              {cartPulse
                ? `Added · Cart (${totalItems})`
                : `Cart (${totalItems})`}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-black/5 bg-[#f7f7f5]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">
              Enterprise Retail Experience
            </p>

            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.05] md:text-6xl">
              Smarter technology for
              modern{" "}
              <span className="text-blue-600">
                work and everyday life.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-500">
              Explore a curated collection of
              computers, accessories, audio, and
              displays through a connected retail
              experience built around convenience,
              visibility, and control.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <button
                onClick={
                  scrollToProducts
                }
                className="rounded-full bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
              >
                Explore Products
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
                  Active Products
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">
                  End-to-End
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Connected Workflow
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

              <Link
                href={`/products/${featuredProduct.id}`}
                className="group mt-6 block"
              >
                <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-[2rem] bg-white">
                  {getProductImage(
                    featuredProduct.name,
                    featuredProduct.image,
                  ) ? (
                    <img
                      src={getProductImage(
                        featuredProduct.name,
                        featuredProduct.image,
                      )}
                      alt={featuredProduct.name}
                      className="h-72 w-full object-contain p-6 transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-400">
                      No Image
                    </div>
                  )}
                </div>
              </Link>

              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                {featuredProduct.category}
              </p>

              <Link
                href={`/products/${featuredProduct.id}`}
                className="group inline-block"
              >
                <h2 className="mt-3 text-3xl font-bold transition group-hover:text-blue-300">
                  {featuredProduct.name}
                </h2>
              </Link>

              {featuredProduct.shortDescription && (
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
                  {featuredProduct.shortDescription}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
                <div>
                  <p className="text-2xl font-black">
                    {featuredProduct.price} SAR
                  </p>

                  <p
                    className={`mt-2 text-xs font-medium ${
                      featuredProduct.stock > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {featuredProduct.stock > 0
                      ? `${featuredProduct.stock} in stock`
                      : "Out of stock"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/products/${featuredProduct.id}`}
                    className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-white hover:bg-white/10"
                  >
                    View Details →
                  </Link>

                  <button
                    disabled={
                      featuredProduct.stock <= 0
                    }
                    onClick={() =>
                      handleAddToCart(
                        featuredProduct.id,
                        featuredProduct.name,
                      )
                    }
                    className={`rounded-full px-7 py-3 font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 ${
                      addedProductId ===
                      featuredProduct.id
                        ? "scale-105 bg-green-500 text-white shadow-lg"
                        : "bg-white text-black hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    {featuredProduct.stock <= 0
                      ? "Sold Out"
                      : addedProductId ===
                          featuredProduct.id
                        ? "Added to Cart"
                        : "Add to Cart →"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-96 items-center justify-center rounded-[2.5rem] bg-zinc-950 p-8 text-center text-white">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-xs font-black tracking-[0.18em] text-white">
                  NOVA
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
                    onClick={() =>
                      chooseCategory(
                        category.name,
                      )
                    }
                    className="rounded-3xl border border-black/10 bg-[#f7f7f5] p-7 text-left transition hover:-translate-y-1 hover:border-blue-600"
                  >
                    <div className="flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-white">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-contain p-4 transition duration-300 hover:scale-105"
                      />
                    </div>

                    <h3 className="mt-6 text-xl font-bold">
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
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                  Store Products
                </p>

                <h2 className="mt-3 text-4xl font-black">
                  Explore the NOVA catalog
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-zinc-500">
                  Browse products, compare categories,
                  save favorites, and open any product
                  for full specifications and details.
                </p>
              </div>

              <div className="w-full sm:w-96">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Search Products
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="7"
                      />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                  </span>

                  <input
                    value={productSearch}
                    onChange={(event) =>
                      setProductSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search by product or category..."
                    className="w-full rounded-full border border-black/10 bg-white py-3.5 pl-11 pr-5 text-sm outline-none transition focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {[
                "All",
                ...categories.map(
                  (category) =>
                    category.name,
                ),
              ].map((categoryName) => {
                const active =
                  selectedCategory ===
                  categoryName;

                return (
                  <button
                    key={categoryName}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        categoryName,
                      )
                    }
                    className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-black/10 bg-white text-zinc-600 hover:border-blue-600 hover:text-blue-600"
                    }`}
                  >
                    {categoryName}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setWishlistOnly(
                    (current) => !current,
                  )
                }
                className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  wishlistOnly
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-black/10 bg-white text-zinc-600 hover:border-rose-500 hover:text-rose-600"
                }`}
              >
                Wishlist ({wishlistIds.length})
              </button>

              {(selectedCategory !== "All" ||
                productSearch.trim() ||
                wishlistOnly) && (
                <button
                  type="button"
                  onClick={clearProductFilters}
                  className="ml-auto text-sm font-semibold text-zinc-400 transition hover:text-black"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 text-sm">
              <p className="text-zinc-500">
                Showing{" "}
                <span className="font-semibold text-zinc-950">
                  {filteredProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-zinc-950">
                  {products.length}
                </span>{" "}
                products
              </p>

              <div className="flex flex-wrap items-center gap-4 text-zinc-400">
                <p>
                  Category:{" "}
                  <span className="font-semibold text-zinc-700">
                    {selectedCategory}
                  </span>
                </p>

                {wishlistOnly && (
                  <p>
                    View:{" "}
                    <span className="font-semibold text-rose-600">
                      Wishlist only
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map(
                (product, index) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative">
                      <Link
                        href={`/products/${product.id}`}
                        className="block"
                        aria-label={`View ${product.name} details`}
                      >
                        <div className="relative flex h-72 items-center justify-center overflow-hidden bg-zinc-100">
                          {getProductImage(
                            product.name,
                            product.image,
                          ) ? (
                            <img
                              src={getProductImage(
                                product.name,
                                product.image,
                              )}
                              alt={product.name}
                              className="h-full w-full object-contain p-7 transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white text-sm font-semibold text-zinc-400">
                              No Image
                            </div>
                          )}
                        </div>
                      </Link>

                      <span className="absolute left-5 top-5 rounded-full bg-black px-3 py-1.5 text-xs text-white">
                        {product.stock <= 0
                          ? "Sold Out"
                          : product.stock <= 5
                            ? "Low Stock"
                            : selectedCategory ===
                                "All" &&
                              productSearch.trim() ===
                                "" &&
                              index === 0
                              ? "Featured"
                              : "NOVA"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          toggleWishlist(
                            product.id,
                          )
                        }
                        aria-label={
                          wishlistIds.includes(
                            product.id,
                          )
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                        }
                        title={
                          wishlistIds.includes(
                            product.id,
                          )
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        className={`absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border text-xl shadow-sm transition ${
                          wishlistIds.includes(
                            product.id,
                          )
                            ? "border-rose-200 bg-rose-500 text-white"
                            : "border-black/10 bg-white text-zinc-500 hover:border-rose-300 hover:text-rose-600"
                        }`}
                      >
                        {wishlistIds.includes(
                          product.id,
                        )
                          ? "♥"
                          : "♡"}
                      </button>
                    </div>

                    <div className="p-6">
                      <p className="text-xs uppercase tracking-widest text-zinc-400">
                        {product.category}
                      </p>

                      <Link
                        href={`/products/${product.id}`}
                        className="inline-block"
                      >
                        <h3 className="mt-3 text-xl font-bold transition hover:text-blue-600">
                          {product.name}
                        </h3>
                      </Link>

                      {product.shortDescription && (
                        <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-500">
                          {product.shortDescription}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <p className="text-lg font-bold">
                          {product.price} SAR
                        </p>

                        <p
                          className={`text-xs font-medium ${
                            product.stock > 0
                              ? product.stock <= 5
                                ? "text-amber-600"
                                : "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.stock > 0
                            ? `${product.stock} left`
                            : "Sold out"}
                        </p>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <Link
                          href={`/products/${product.id}`}
                          className="rounded-full border border-black/10 py-3.5 text-center text-sm font-semibold transition hover:border-blue-600 hover:text-blue-600"
                        >
                          View Details
                        </Link>

                        <button
                          disabled={
                            product.stock <= 0
                          }
                          onClick={() =>
                            handleAddToCart(
                              product.id,
                              product.name,
                            )
                          }
                          className={`rounded-full py-3.5 text-sm font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 ${
                            addedProductId ===
                            product.id
                              ? "scale-[1.03] bg-green-600 shadow-lg"
                              : "bg-black hover:bg-blue-600"
                          }`}
                        >
                          {product.stock <= 0
                            ? "Out of Stock"
                            : addedProductId ===
                                product.id
                              ? "Added"
                              : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="mt-10 rounded-[2rem] border border-dashed border-black/10 bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-[10px] font-black tracking-[0.15em] text-white">
                NOVA
              </div>

              <h3 className="mt-5 text-2xl font-bold">
                {wishlistOnly
                  ? "Your wishlist is empty"
                  : "No matching products"}
              </h3>

              <p className="mx-auto mt-3 max-w-lg leading-7 text-zinc-500">
                {wishlistOnly
                  ? "Tap the heart on any product to save it here for later."
                  : "Try another product name or category, or clear the current filters."}
              </p>

              <button
                type="button"
                onClick={clearProductFilters}
                className="mt-7 rounded-full bg-blue-600 px-7 py-3.5 font-semibold text-white transition hover:bg-blue-700"
              >
                {wishlistOnly
                  ? "Browse Products"
                  : "Show All Products"}
              </button>
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
              A connected retail
              management experience.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                title:
                  "Secure Checkout",
                description:
                  "A structured checkout flow with promotions, delivery details, and secure test-mode payment validation.",
              },
              {
                title:
                  "Inventory Control",
                description:
                  "Product stock updates across the storefront and administration workflow as orders are processed.",
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
                  "Orders move from checkout into administration, fulfillment status, and customer tracking.",
              },
              {
                title:
                  "Customer Support",
                description:
                  "Customer conversations are connected to a dedicated administration support inbox.",
              },
              {
                title:
                  "Wishlist",
                description:
                  "Customers can save favorite products and quickly return to their selected items.",
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
              Enterprise E-Commerce & Retail
              Management Platform
            </p>
          </div>
        </footer>
      </section>

      {/* CART FEEDBACK */}
      {cartToast && (
        <div className="pointer-events-none fixed left-1/2 top-7 z-[100] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2">
          <div className="animate-bounce rounded-[1.5rem] border border-green-200 bg-white p-4 shadow-2xl ring-4 ring-green-100">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] font-black tracking-wider text-white">
                ADD
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-zinc-950">
                  Added to Cart!
                </p>

                <p className="mt-1 truncate text-sm text-zinc-500">
                  {cartToast}
                </p>
              </div>

              <div className="rounded-full bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
                +1 item
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER SUPPORT CHAT */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen && (
          <div className="mb-4 flex h-[620px] max-h-[72vh] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-zinc-950 px-5 py-4 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                  NOVA Support
                </p>

                <h3 className="mt-1 text-lg font-bold">
                  Customer Chat
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setChatOpen(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg transition hover:bg-white/20"
                aria-label="Close support chat"
              >
                ×
              </button>
            </div>

            <div className="border-b border-black/10 bg-blue-50 px-5 py-3">
              <p className="text-xs leading-5 text-zinc-600">
                Customer messages are routed directly to the
                NOVA administration support inbox.
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[#f7f7f5] p-5">
              {!conversation ||
              conversation.messages.length ===
                0 ? (
                <div className="rounded-2xl border border-black/10 bg-white p-5">
                  <p className="font-semibold">
                    How can we help?
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Send a message to start a
                    conversation with NOVA Support.
                    Your conversation will appear
                    in the administration inbox.
                  </p>
                </div>
              ) : (
                conversation.messages.map(
                  (message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender ===
                        "customer"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.sender ===
                          "customer"
                            ? "bg-blue-600 text-white"
                            : "border border-black/10 bg-white text-zinc-950"
                        }`}
                      >
                        <p className="text-sm leading-6">
                          {message.text}
                        </p>

                        <p
                          className={`mt-2 text-[10px] ${
                            message.sender ===
                            "customer"
                              ? "text-blue-100"
                              : "text-zinc-400"
                          }`}
                        >
                          {message.sender ===
                          "customer"
                            ? "You"
                            : "NOVA Support"}{" "}
                          •{" "}
                          {new Date(
                            message.createdAt,
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>

            <form
              onSubmit={sendChatMessage}
              className="border-t border-black/10 bg-white p-4"
            >
              {!conversation && (
                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  <input
                    value={chatName}
                    onChange={(event) =>
                      setChatName(
                        event.target.value,
                      )
                    }
                    placeholder="Your name"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                  />

                  <input
                    type="email"
                    value={chatEmail}
                    onChange={(event) =>
                      setChatEmail(
                        event.target.value,
                      )
                    }
                    placeholder="Email (optional)"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                  />
                </div>
              )}

              {conversation && (
                <div className="mb-3 flex items-center justify-between rounded-xl bg-zinc-100 px-3 py-2 text-xs">
                  <span className="font-medium text-zinc-600">
                    {conversation.customerName}
                  </span>

                  <span
                    className={`font-semibold ${
                      conversation.status ===
                      "Open"
                        ? "text-green-600"
                        : "text-zinc-400"
                    }`}
                  >
                    {conversation.status}
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <textarea
                  value={chatMessage}
                  onChange={(event) =>
                    setChatMessage(
                      event.target.value,
                    )
                  }
                  rows={2}
                  placeholder="Type your message..."
                  className="min-h-12 flex-1 resize-none rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 py-3 text-sm outline-none focus:border-blue-600"
                />

                <button
                  type="submit"
                  className="self-end rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Send
                </button>
              </div>

              {chatError && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {chatError}
                </p>
              )}
            </form>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setChatOpen(
              (current) => !current,
            )
          }
          className="relative ml-auto flex items-center gap-3 rounded-full bg-blue-600 px-5 py-4 font-semibold text-white shadow-xl transition hover:bg-blue-700"
        >
          {unreadCount > 0 &&
            !chatOpen && (
              <span className="absolute -right-1 -top-2 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white ring-4 ring-[#f7f7f5]">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}

          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/15 px-2 text-[10px] font-black tracking-wider">
            SUP
          </span>

          <span>
            {chatOpen
              ? "Close Chat"
              : "Live Support"}
          </span>
        </button>
      </div>
    </main>
  );
}


