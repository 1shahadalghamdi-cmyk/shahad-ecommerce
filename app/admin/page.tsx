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
};

type OrderStatus =
  | "Processing"
  | "Shipped"
  | "Delivered";

type Order = {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
};

const initialProducts: AdminProduct[] = [
  {
    id: 1,
    name: "Nova Wireless Headphones",
    category: "Audio",
    price: 549,
    stock: 24,
    icon: "🎧",
  },
  {
    id: 2,
    name: "Arc Mechanical Keyboard",
    category: "Accessories",
    price: 399,
    stock: 18,
    icon: "⌨️",
  },
  {
    id: 3,
    name: "Flow Wireless Mouse",
    category: "Accessories",
    price: 249,
    stock: 8,
    icon: "🖱️",
  },
  {
    id: 4,
    name: "Vision 27” Monitor",
    category: "Displays",
    price: 1299,
    stock: 4,
    icon: "🖥️",
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

  const [showForm, setShowForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<AdminProduct | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] =
    useState("Accessories");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [icon, setIcon] = useState("📦");

  useEffect(() => {
    const savedProducts =
      window.localStorage.getItem(
        "nova-admin-products",
      );

    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
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

  function resetForm() {
    setName("");
    setCategory("Accessories");
    setPrice("");
    setStock("");
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
    setIcon(product.icon);
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
                icon,
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
        icon,
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
            inventory, review orders, and
            track store operations from one
            centralized dashboard.
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

            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
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

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Icon
                </label>

                <input
                  value={icon}
                  onChange={(event) =>
                    setIcon(
                      event.target.value,
                    )
                  }
                  placeholder="📦"
                  className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3 outline-none focus:border-blue-600"
                />
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

              <div className="rounded-2xl bg-blue-50 p-3 text-2xl">
                📦
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

              <div className="rounded-2xl bg-green-50 p-3 text-2xl">
                📊
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

              <div className="rounded-2xl bg-amber-50 p-3 text-2xl">
                ⚠️
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

              <div className="rounded-2xl bg-white/10 p-3 text-2xl">
                💰
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
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-2xl">
                              {product.icon}
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
              Orders
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Order Management
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Review orders, open customer
              details, and update fulfillment
              status.
            </p>
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
                {orders.map(
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
                          value={
                            order.status
                          }
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

            {orders.length === 0 && (
              <div className="py-16 text-center text-zinc-500">
                No orders yet.
              </div>
            )}
          </div>
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
            This administration dashboard
            demonstrates product catalog
            management, inventory monitoring,
            stock status controls, detailed
            order workflows, and operational
            reporting within the NOVA
            e-commerce platform.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "Product Management",
              "Inventory Control",
              "Order Management",
              "Order Details",
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
