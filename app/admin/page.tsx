/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type AdminProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  icon: string;
  image?: string;
};

type OrderStatus =
  | "Processing"
  | "Shipped"
  | "Delivered";

type OrderFilter =
  | "All"
  | OrderStatus;

type Order = {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
};

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

type SupportFilter =
  | "All"
  | "Open"
  | "Closed";

const SUPPORT_STORAGE_KEY =
  "nova-support-conversations";


const PRODUCT_IMAGE_BY_NAME: Record<
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
  "nova usb-c hub":
    "/products/nova-usb-c-hub.png",
  "novabook pro 14":
    "/products/novabook-pro.png",
  "nova mini pc":
    "/products/nova-mini-pc.png",
};

function getKnownProductImage(
  productName: string,
) {
  return (
    PRODUCT_IMAGE_BY_NAME[
      productName.trim().toLowerCase()
    ] || ""
  );
}

function normalizeProduct(
  product: AdminProduct,
): AdminProduct {
  return {
    ...product,
    image:
      product.image ||
      getKnownProductImage(product.name) ||
      undefined,
  };
}

function getFallbackIcon(
  productCategory: string,
) {
  if (productCategory === "Audio") {
    return "🎧";
  }

  if (productCategory === "Displays") {
    return "🖥️";
  }

  if (productCategory === "Computers") {
    return "💻";
  }

  return "📦";
}

const initialProducts: AdminProduct[] = [
  {
    id: 1,
    name: "Nova Wireless Headphones",
    category: "Audio",
    price: 549,
    stock: 24,
    icon: "🎧",
    image: "/products/nova-headphones.png",
  },
  {
    id: 2,
    name: "Arc Mechanical Keyboard",
    category: "Accessories",
    price: 399,
    stock: 18,
    icon: "⌨️",
    image: "/products/arc-keyboard.png",
  },
  {
    id: 3,
    name: "Flow Wireless Mouse",
    category: "Accessories",
    price: 249,
    stock: 8,
    icon: "🖱️",
    image: "/products/flow-mouse.png",
  },
  {
    id: 4,
    name: "Vision 27” Monitor",
    category: "Displays",
    price: 1299,
    stock: 4,
    icon: "🖥️",
    image: "/products/vision-monitor.png",
  },
  {
    id: 5,
    name: "Nova USB-C Hub",
    category: "Accessories",
    price: 199,
    stock: 14,
    icon: "🔌",
    image: "/products/nova-usb-c-hub.png",
  },
  {
    id: 6,
    name: "NovaBook Pro 14",
    category: "Computers",
    price: 4299,
    stock: 7,
    icon: "💻",
    image: "/products/novabook-pro.png",
  },
  {
    id: 7,
    name: "NOVA Mini PC",
    category: "Computers",
    price: 2499,
    stock: 6,
    icon: "🖥️",
    image: "/products/nova-mini-pc.png",
  },
];

const initialOrders: Order[] = [
  {
    id: "NOVA-10482",
    customer: "Ahmed AlHarbi",
    total: 1299,
    status: "Processing",
  },
  {
    id: "NOVA-10481",
    customer: "Sara AlQahtani",
    total: 798,
    status: "Shipped",
  },
  {
    id: "NOVA-10480",
    customer: "Nora AlOtaibi",
    total: 549,
    status: "Delivered",
  },
];

export default function AdminPage() {
  const [products, setProducts] =
    useState<AdminProduct[]>(initialProducts);

  const [orders, setOrders] =
    useState<Order[]>(initialOrders);

  const [productsLoaded, setProductsLoaded] =
    useState(false);

  const [ordersLoaded, setOrdersLoaded] =
    useState(false);

  const [search, setSearch] = useState("");

  const [orderSearch, setOrderSearch] =
    useState("");

  const [orderFilter, setOrderFilter] =
    useState<OrderFilter>("All");

  const [supportConversations, setSupportConversations] =
    useState<SupportConversation[]>([]);

  const [selectedConversationId, setSelectedConversationId] =
    useState("");

  const [supportSearch, setSupportSearch] =
    useState("");

  const [supportFilter, setSupportFilter] =
    useState<SupportFilter>("All");

  const [supportReply, setSupportReply] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<AdminProduct | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] =
    useState("Accessories");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [icon, setIcon] = useState("📦");

  useEffect(() => {
    const savedProducts =
      window.localStorage.getItem(
        "nova-admin-products",
      );

    if (savedProducts) {
      try {
        const parsedProducts =
          JSON.parse(savedProducts);

        setProducts(
          Array.isArray(parsedProducts)
            ? parsedProducts.map(
                (product) =>
                  normalizeProduct(product),
              )
            : initialProducts,
        );
      } catch {
        window.localStorage.removeItem(
          "nova-admin-products",
        );
      }
    }

    setProductsLoaded(true);
  }, []);

  useEffect(() => {
    if (!productsLoaded) return;

    window.localStorage.setItem(
      "nova-admin-products",
      JSON.stringify(products),
    );
  }, [products, productsLoaded]);

  useEffect(() => {
    const savedOrders =
      window.localStorage.getItem(
        "nova-admin-orders",
      );

    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch {
        window.localStorage.removeItem(
          "nova-admin-orders",
        );
      }
    }

    setOrdersLoaded(true);
  }, []);

  useEffect(() => {
    if (!ordersLoaded) return;

    window.localStorage.setItem(
      "nova-admin-orders",
      JSON.stringify(orders),
    );
  }, [orders, ordersLoaded]);

  useEffect(() => {
    function syncSupportConversations() {
      const savedConversations =
        window.localStorage.getItem(
          SUPPORT_STORAGE_KEY,
        );

      if (!savedConversations) {
        setSupportConversations([]);
        setSelectedConversationId("");
        return;
      }

      try {
        const parsed =
          JSON.parse(savedConversations);

        const conversations:
          SupportConversation[] =
          Array.isArray(parsed)
            ? parsed
            : [];

        setSupportConversations(
          conversations,
        );

        setSelectedConversationId(
          (current) => {
            if (
              current &&
              conversations.some(
                (conversation) =>
                  conversation.id ===
                  current,
              )
            ) {
              return current;
            }

            return (
              conversations[0]?.id ||
              ""
            );
          },
        );
      } catch {
        setSupportConversations([]);
      }
    }

    syncSupportConversations();

    window.addEventListener(
      "storage",
      syncSupportConversations,
    );

    window.addEventListener(
      "focus",
      syncSupportConversations,
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncSupportConversations,
      );

      window.removeEventListener(
        "focus",
        syncSupportConversations,
      );
    };
  }, []);

  const inventoryValue = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total +
          product.price * product.stock,
        0,
      ),
    [products],
  );

  const lowStockProducts =
    products.filter(
      (product) => product.stock <= 8,
    ).length;

  const totalStock =
    products.reduce(
      (total, product) =>
        total + product.stock,
      0,
    );

  const filteredProducts =
    products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ) ||
        product.category
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  const filteredOrders = useMemo(() => {
    const normalizedSearch =
      orderSearch.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        orderFilter === "All" ||
        order.status === orderFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        order.id
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.customer
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [orders, orderFilter, orderSearch]);

  const orderCounts = useMemo(
    () => ({
      All: orders.length,
      Processing: orders.filter(
        (order) =>
          order.status === "Processing",
      ).length,
      Shipped: orders.filter(
        (order) =>
          order.status === "Shipped",
      ).length,
      Delivered: orders.filter(
        (order) =>
          order.status === "Delivered",
      ).length,
    }),
    [orders],
  );

  const filteredSupportConversations =
    useMemo(() => {
      const normalizedSearch =
        supportSearch
          .trim()
          .toLowerCase();

      return supportConversations
        .filter((conversation) => {
          const matchesFilter =
            supportFilter === "All" ||
            conversation.status ===
              supportFilter;

          const matchesSearch =
            normalizedSearch.length ===
              0 ||
            conversation.customerName
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            conversation.customerEmail
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            conversation.id
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            conversation.messages.some(
              (message) =>
                message.text
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ),
            );

          return (
            matchesFilter &&
            matchesSearch
          );
        })
        .sort(
          (a, b) =>
            new Date(
              b.updatedAt,
            ).getTime() -
            new Date(
              a.updatedAt,
            ).getTime(),
        );
    }, [
      supportConversations,
      supportFilter,
      supportSearch,
    ]);

  const selectedConversation =
    useMemo(
      () =>
        supportConversations.find(
          (conversation) =>
            conversation.id ===
            selectedConversationId,
        ) || null,
      [
        supportConversations,
        selectedConversationId,
      ],
    );

  const supportCounts = useMemo(
    () => ({
      All: supportConversations.length,
      Open: supportConversations.filter(
        (conversation) =>
          conversation.status ===
          "Open",
      ).length,
      Closed:
        supportConversations.filter(
          (conversation) =>
            conversation.status ===
            "Closed",
        ).length,
    }),
    [supportConversations],
  );

  function resetForm() {
    setName("");
    setCategory("Accessories");
    setPrice("");
    setStock("");
    setImage("");
    setIcon("📦");
    setEditingProduct(null);
    setShowForm(false);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleEdit(
    product: AdminProduct,
  ) {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setImage(
      product.image ||
        getKnownProductImage(
          product.name,
        ),
    );
    setIcon(
      product.icon ||
        getFallbackIcon(
          product.category,
        ),
    );
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleDelete(id: number) {
    const confirmed =
      window.confirm(
        "Delete this product from inventory?",
      );

    if (!confirmed) return;

    setProducts((current) =>
      current.filter(
        (product) =>
          product.id !== id,
      ),
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const parsedPrice =
      Number(price);

    const parsedStock =
      Number(stock);

    if (
      !name.trim() ||
      !category.trim() ||
      Number.isNaN(parsedPrice) ||
      Number.isNaN(parsedStock)
    ) {
      return;
    }

    if (editingProduct) {
      setProducts((current) =>
        current.map((product) =>
          product.id ===
          editingProduct.id
            ? {
                ...product,
                name: name.trim(),
                category,
                price: parsedPrice,
                stock: parsedStock,
                image:
                  image.trim() ||
                  getKnownProductImage(
                    name.trim(),
                  ) ||
                  undefined,
                icon:
                  icon ||
                  getFallbackIcon(
                    category,
                  ),
              }
            : product,
        ),
      );
    } else {
      const newProduct: AdminProduct = {
        id: Date.now(),
        name: name.trim(),
        category,
        price: parsedPrice,
        stock: parsedStock,
        image:
          image.trim() ||
          getKnownProductImage(
            name.trim(),
          ) ||
          undefined,
        icon:
          icon ||
          getFallbackIcon(
            category,
          ),
      };

      setProducts((current) => [
        ...current,
        newProduct,
      ]);
    }

    resetForm();
  }

  function updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
            }
          : order,
      ),
    );
  }

  function saveSupportConversations(
    conversations:
      SupportConversation[],
  ) {
    setSupportConversations(
      conversations,
    );

    window.localStorage.setItem(
      SUPPORT_STORAGE_KEY,
      JSON.stringify(conversations),
    );
  }

  function handleSupportReply(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanReply =
      supportReply.trim();

    if (
      !selectedConversation ||
      !cleanReply
    ) {
      return;
    }

    const now =
      new Date().toISOString();

    const replyMessage: SupportMessage = {
      id: `MSG-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      sender: "admin",
      text: cleanReply,
      createdAt: now,
    };

    const updatedConversations =
      supportConversations.map(
        (conversation) =>
          conversation.id ===
          selectedConversation.id
            ? {
                ...conversation,
                status:
                  "Open" as const,
                updatedAt: now,
                messages: [
                  ...conversation.messages,
                  replyMessage,
                ],
              }
            : conversation,
      );

    saveSupportConversations(
      updatedConversations,
    );

    setSupportReply("");
  }

  function updateSupportStatus(
    conversationId: string,
    status: "Open" | "Closed",
  ) {
    const now =
      new Date().toISOString();

    const updatedConversations =
      supportConversations.map(
        (conversation) =>
          conversation.id ===
          conversationId
            ? {
                ...conversation,
                status,
                updatedAt: now,
              }
            : conversation,
      );

    saveSupportConversations(
      updatedConversations,
    );
  }

  function getSupportPreview(
    conversation:
      SupportConversation,
  ) {
    const lastMessage =
      conversation.messages[
        conversation.messages.length -
          1
      ];

    return (
      lastMessage?.text ||
      "No messages yet."
    );
  }

  function getStockStatus(
    stockAmount: number,
  ) {
    if (stockAmount === 0) {
      return {
        label: "Out of Stock",
        classes:
          "bg-red-100 text-red-700",
      };
    }

    if (stockAmount <= 8) {
      return {
        label: "Low Stock",
        classes:
          "bg-amber-100 text-amber-700",
      };
    }

    return {
      label: "In Stock",
      classes:
        "bg-green-100 text-green-700",
    };
  }

  function getOrderStatusClasses(
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

  return (
    <main className="min-h-screen bg-[#f4f4f2] text-zinc-950">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-8">
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
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium transition hover:border-blue-600 hover:text-blue-600"
            >
              View Store
            </Link>

            <button
              onClick={openAddForm}
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              + Add Product
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* TITLE */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            NOVA Administration
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            E-Commerce Dashboard
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-zinc-500">
            Manage products, monitor
            inventory, review orders, support
            customers, and track store operations
            from one centralized dashboard.
          </p>
        </div>

        {/* PRODUCT FORM */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-10 rounded-[2rem] border border-blue-600/20 bg-white p-7 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                  Product Management
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {editingProduct
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-medium text-zinc-500 transition hover:text-black"
              >
                Cancel
              </button>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Product Name
                </label>

                <input
                  required
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Product name"
                  className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none focus:border-blue-600"
                >
                  <option>
                    Computers
                  </option>

                  <option>
                    Accessories
                  </option>

                  <option>
                    Audio
                  </option>

                  <option>
                    Displays
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price (SAR)
                </label>

                <input
                  required
                  min="0"
                  type="number"
                  value={price}
                  onChange={(event) =>
                    setPrice(
                      event.target.value,
                    )
                  }
                  placeholder="399"
                  className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Stock
                </label>

                <input
                  required
                  min="0"
                  type="number"
                  value={stock}
                  onChange={(event) =>
                    setStock(
                      event.target.value,
                    )
                  }
                  placeholder="20"
                  className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Product Image Path
                </label>

                <input
                  value={image}
                  onChange={(event) =>
                    setImage(
                      event.target.value,
                    )
                  }
                  placeholder="/products/product-name.png"
                  list="nova-product-images"
                  className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none focus:border-blue-600"
                />

                <datalist id="nova-product-images">
                  {Array.from(
                    new Set(
                      Object.values(
                        PRODUCT_IMAGE_BY_NAME,
                      ),
                    ),
                  ).map((path) => (
                    <option
                      key={path}
                      value={path}
                    />
                  ))}
                </datalist>

                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  Use an image stored inside
                  public/products, for example
                  /products/nova-headphones.png
                </p>
              </div>

              <div className="md:col-span-2 lg:col-span-2">
                <p className="mb-2 text-sm font-medium">
                  Image Preview
                </p>

                <div className="flex h-36 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-[#f7f7f5]">
                  {image ? (
                    <img
                      src={image}
                      alt="Product preview"
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-zinc-400">
                      Add an image path to preview the product
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 rounded-full bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              {editingProduct
                ? "Save Changes"
                : "Create Product"}
            </button>
          </form>
        )}

        {/* DASHBOARD CARDS */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Products
                </p>

                <p className="mt-3 text-4xl font-black">
                  {products.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[10px] font-black uppercase tracking-wider text-blue-600">
                CAT
              </div>
            </div>

            <p className="mt-6 text-sm text-zinc-400">
              Active catalog products
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Inventory Units
                </p>

                <p className="mt-3 text-4xl font-black">
                  {totalStock}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-[10px] font-black uppercase tracking-wider text-green-700">
                QTY
              </div>
            </div>

            <p className="mt-6 text-sm text-zinc-400">
              Total units currently in stock
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Low Stock
                </p>

                <p className="mt-3 text-4xl font-black">
                  {lowStockProducts}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[10px] font-black uppercase tracking-wider text-amber-700">
                LOW
              </div>
            </div>

            <p className="mt-6 text-sm text-zinc-400">
              Products requiring attention
            </p>
          </div>

          <div className="rounded-3xl bg-zinc-950 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  Inventory Value
                </p>

                <p className="mt-3 text-3xl font-black">
                  {inventoryValue.toLocaleString()}{" "}
                  SAR
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[10px] font-black uppercase tracking-wider text-zinc-200">
                SAR
              </div>
            </div>

            <p className="mt-6 text-sm text-zinc-500">
              Estimated stock value
            </p>
          </div>
        </div>

        {/* INVENTORY */}
        <section className="mt-10 rounded-[2rem] border border-black/10 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                Inventory
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Product Management
              </h2>
            </div>

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search products..."
              className="w-full rounded-full border border-black/10 bg-[#f7f7f5] px-5 py-3 text-sm outline-none focus:border-blue-600 sm:w-72"
            />
          </div>

          <div className="mt-7 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-zinc-400">
                  <th className="pb-4 font-medium">
                    Product
                  </th>

                  <th className="pb-4 font-medium">
                    Category
                  </th>

                  <th className="pb-4 font-medium">
                    Price
                  </th>

                  <th className="pb-4 font-medium">
                    Stock
                  </th>

                  <th className="pb-4 font-medium">
                    Status
                  </th>

                  <th className="pb-4 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(
                  (product) => {
                    const stockStatus =
                      getStockStatus(
                        product.stock,
                      );

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-black/5 last:border-none"
                      >
                        <td className="py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-zinc-100">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-contain p-1.5"
                                />
                              ) : (
                                <span className="text-[10px] font-black text-zinc-400">
                                  NOVA
                                </span>
                              )}
                            </div>

                            <div>
                              <p className="font-semibold">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-zinc-400">
                                ID:{" "}
                                {product.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 text-sm text-zinc-500">
                          {product.category}
                        </td>

                        <td className="py-5 font-semibold">
                          {product.price} SAR
                        </td>

                        <td className="py-5 font-semibold">
                          {product.stock}
                        </td>

                        <td className="py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${stockStatus.classes}`}
                          >
                            {stockStatus.label}
                          </span>
                        </td>

                        <td className="py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                handleEdit(
                                  product,
                                )
                              }
                              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition hover:border-blue-600 hover:text-blue-600"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  product.id,
                                )
                              }
                              className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>

            {filteredProducts.length ===
              0 && (
              <div className="py-16 text-center text-zinc-500">
                No products found.
              </div>
            )}
          </div>
        </section>

        {/* ORDERS */}
        <section className="mt-10 rounded-[2rem] border border-black/10 bg-white p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                  Orders
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Order Management
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Search orders, filter by fulfillment status,
                  open customer details, and update order progress.
                </p>
              </div>

              <div className="w-full sm:w-80">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Search Orders
                </label>

                <input
                  value={orderSearch}
                  onChange={(event) =>
                    setOrderSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Order ID or customer..."
                  className="w-full rounded-full border border-black/10 bg-[#f7f7f5] px-5 py-3 text-sm outline-none transition focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(
                [
                  "All",
                  "Processing",
                  "Shipped",
                  "Delivered",
                ] as OrderFilter[]
              ).map((filter) => {
                const active =
                  orderFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() =>
                      setOrderFilter(filter)
                    }
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-black/10 bg-white text-zinc-600 hover:border-blue-600 hover:text-blue-600"
                    }`}
                  >
                    {filter}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {orderCounts[filter]}
                    </span>
                  </button>
                );
              })}

              {(orderFilter !== "All" ||
                orderSearch.trim()) && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderFilter("All");
                    setOrderSearch("");
                  }}
                  className="ml-auto text-sm font-semibold text-zinc-400 transition hover:text-black"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f7f7f5] px-4 py-3 text-sm">
              <p className="text-zinc-500">
                Showing{" "}
                <span className="font-semibold text-zinc-950">
                  {filteredOrders.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-zinc-950">
                  {orders.length}
                </span>{" "}
                orders
              </p>

              <p className="text-zinc-400">
                Filter:{" "}
                <span className="font-semibold text-zinc-700">
                  {orderFilter}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-7 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-zinc-400">
                  <th className="pb-4 font-medium">
                    Order
                  </th>

                  <th className="pb-4 font-medium">
                    Customer
                  </th>

                  <th className="pb-4 font-medium">
                    Total
                  </th>

                  <th className="pb-4 font-medium">
                    Status
                  </th>

                  <th className="pb-4 text-right font-medium">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => (
                    <tr
                      key={order.id}
                      className="border-b border-black/5 last:border-none"
                    >
                      <td className="py-5">
                        <Link
                          href={`/admin/orders/${encodeURIComponent(
                            order.id,
                          )}`}
                          className="font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
                        >
                          {order.id}
                        </Link>
                      </td>

                      <td className="py-5">
                        {order.customer}
                      </td>

                      <td className="py-5 font-semibold">
                        {order.total} SAR
                      </td>

                      <td className="py-5">
                        <select
                          value={order.status}
                          onChange={(
                            event,
                          ) =>
                            updateOrderStatus(
                              order.id,
                              event.target
                                .value as OrderStatus,
                            )
                          }
                          className={`rounded-full border px-4 py-2 text-sm font-semibold outline-none ${getOrderStatusClasses(
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
                      </td>

                      <td className="py-5 text-right">
                        <Link
                          href={`/admin/orders/${encodeURIComponent(
                            order.id,
                          )}`}
                          className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-semibold transition hover:border-blue-600 hover:text-blue-600"
                        >
                          View Order →
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-[10px] font-black text-white">
                  NOVA
                </div>

                <h3 className="mt-4 text-lg font-bold">
                  No matching orders
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  Try another customer name, order ID,
                  or fulfillment status.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setOrderFilter("All");
                    setOrderSearch("");
                  }}
                  className="mt-5 rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold transition hover:border-blue-600 hover:text-blue-600"
                >
                  Show All Orders
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CUSTOMER SUPPORT */}
        <section className="mt-10 rounded-[2rem] border border-black/10 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                Customer Support
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Support Inbox
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Review customer conversations,
                reply from the administration
                workspace, and close resolved
                support requests.
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 px-5 py-4">
              <p className="text-xs uppercase tracking-widest text-blue-600">
                Open Conversations
              </p>

              <p className="mt-2 text-3xl font-black text-blue-700">
                {supportCounts.Open}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              {(
                [
                  "All",
                  "Open",
                  "Closed",
                ] as SupportFilter[]
              ).map((filter) => {
                const active =
                  supportFilter ===
                  filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() =>
                      setSupportFilter(
                        filter,
                      )
                    }
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-black/10 bg-white text-zinc-600 hover:border-blue-600 hover:text-blue-600"
                    }`}
                  >
                    {filter}

                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {supportCounts[filter]}
                    </span>
                  </button>
                );
              })}
            </div>

            <input
              value={supportSearch}
              onChange={(event) =>
                setSupportSearch(
                  event.target.value,
                )
              }
              placeholder="Search customer, email, message..."
              className="w-full rounded-full border border-black/10 bg-[#f7f7f5] px-5 py-3 text-sm outline-none transition focus:border-blue-600 lg:w-96"
            />
          </div>

          {supportConversations.length ===
          0 ? (
            <div className="mt-7 rounded-[2rem] border border-dashed border-black/10 bg-[#f7f7f5] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-[10px] font-black uppercase tracking-wider text-white">
                SUP
              </div>

              <h3 className="mt-5 text-xl font-bold">
                No support conversations yet
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">
                Customer messages sent from the
                NOVA storefront will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-7 grid overflow-hidden rounded-[2rem] border border-black/10 lg:grid-cols-[340px_1fr]">
              {/* CONVERSATION LIST */}
              <div className="border-b border-black/10 bg-[#f7f7f5] lg:border-b-0 lg:border-r">
                <div className="border-b border-black/10 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Conversations
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    {
                      filteredSupportConversations.length
                    }{" "}
                    result
                    {filteredSupportConversations.length ===
                    1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <div className="max-h-[620px] overflow-y-auto">
                  {filteredSupportConversations.map(
                    (
                      conversation,
                    ) => {
                      const active =
                        selectedConversationId ===
                        conversation.id;

                      return (
                        <button
                          key={
                            conversation.id
                          }
                          type="button"
                          onClick={() =>
                            setSelectedConversationId(
                              conversation.id,
                            )
                          }
                          className={`w-full border-b border-black/5 p-5 text-left transition last:border-none ${
                            active
                              ? "bg-white"
                              : "hover:bg-white/70"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-bold">
                                {
                                  conversation.customerName
                                }
                              </p>

                              <p className="mt-1 truncate text-xs text-zinc-400">
                                {
                                  conversation.customerEmail ||
                                  "No email provided"
                                }
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                conversation.status ===
                                "Open"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-zinc-200 text-zinc-600"
                              }`}
                            >
                              {
                                conversation.status
                              }
                            </span>
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm leading-5 text-zinc-500">
                            {getSupportPreview(
                              conversation,
                            )}
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-3 text-[10px] uppercase tracking-wider text-zinc-400">
                            <span>
                              {
                                conversation.id
                              }
                            </span>

                            <span>
                              {new Date(
                                conversation.updatedAt,
                              ).toLocaleString(
                                [],
                                {
                                  month:
                                    "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute:
                                    "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    },
                  )}

                  {filteredSupportConversations.length ===
                    0 && (
                    <div className="px-5 py-12 text-center text-sm text-zinc-500">
                      No conversations match the
                      current filters.
                    </div>
                  )}
                </div>
              </div>

              {/* ACTIVE CONVERSATION */}
              <div className="flex min-h-[620px] flex-col bg-white">
                {selectedConversation ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 px-6 py-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                          {
                            selectedConversation.id
                          }
                        </p>

                        <h3 className="mt-2 text-xl font-bold">
                          {
                            selectedConversation.customerName
                          }
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                          {selectedConversation.customerEmail ||
                            "No email provided"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedConversation.status ===
                        "Open" ? (
                          <button
                            type="button"
                            onClick={() =>
                              updateSupportStatus(
                                selectedConversation.id,
                                "Closed",
                              )
                            }
                            className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold transition hover:border-zinc-500"
                          >
                            Close Conversation
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              updateSupportStatus(
                                selectedConversation.id,
                                "Open",
                              )
                            }
                            className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-600"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto bg-[#f7f7f5] p-6">
                      {selectedConversation.messages.map(
                        (message) => (
                          <div
                            key={
                              message.id
                            }
                            className={`flex ${
                              message.sender ===
                              "admin"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                message.sender ===
                                "admin"
                                  ? "bg-blue-600 text-white"
                                  : "border border-black/10 bg-white text-zinc-950"
                              }`}
                            >
                              <p className="text-sm leading-6">
                                {
                                  message.text
                                }
                              </p>

                              <p
                                className={`mt-2 text-[10px] ${
                                  message.sender ===
                                  "admin"
                                    ? "text-blue-100"
                                    : "text-zinc-400"
                                }`}
                              >
                                {message.sender ===
                                "admin"
                                  ? "NOVA Support"
                                  : selectedConversation.customerName}{" "}
                                •{" "}
                                {new Date(
                                  message.createdAt,
                                ).toLocaleString(
                                  [],
                                  {
                                    hour:
                                      "2-digit",
                                    minute:
                                      "2-digit",
                                    month:
                                      "short",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>

                    <form
                      onSubmit={
                        handleSupportReply
                      }
                      className="border-t border-black/10 p-5"
                    >
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                        Admin Reply
                      </label>

                      <div className="flex gap-3">
                        <textarea
                          value={
                            supportReply
                          }
                          onChange={(
                            event,
                          ) =>
                            setSupportReply(
                              event.target.value,
                            )
                          }
                          rows={2}
                          placeholder="Write a reply to the customer..."
                          className="min-h-14 flex-1 resize-none rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 py-3 text-sm outline-none transition focus:border-blue-600"
                        />

                        <button
                          type="submit"
                          disabled={
                            !supportReply.trim()
                          }
                          className="self-end rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Send Reply
                        </button>
                      </div>

                      <p className="mt-3 text-xs leading-5 text-zinc-400">
                        Replies are saved to the conversation
                        and sync with the customer support chat.
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center p-10 text-center">
                    <div>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-[10px] font-black uppercase tracking-wider text-white">
                        SUP
                      </div>

                      <h3 className="mt-5 text-xl font-bold">
                        Select a conversation
                      </h3>

                      <p className="mt-2 text-sm text-zinc-500">
                        Choose a customer message
                        from the support inbox.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ARCHITECTURE */}
        <section className="mt-10 rounded-[2rem] bg-zinc-950 p-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
            System Architecture
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            NOVA Administration Module
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
            NOVA Administration Module
            centralizes product management,
            inventory control, order operations,
            customer support, and store reporting
            in one workspace.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "Product Management",
              "Inventory Control",
              "Order Management",
              "Order Details",
              "Support Inbox",
              "Customer Chat",
              "Local Storage",
              "Next.js",
              "TypeScript",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}


