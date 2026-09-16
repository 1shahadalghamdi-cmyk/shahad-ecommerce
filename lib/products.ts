export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  icon: string;
};

export const defaultProducts: Product[] = [
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

/*
  Keep this export so older parts of the project
  that import { products } continue to work.
*/
export const products = defaultProducts;

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") {
    return defaultProducts;
  }

  const savedProducts =
    window.localStorage.getItem(
      "nova-admin-products",
    );

  if (!savedProducts) {
    return defaultProducts;
  }

  try {
    const parsedProducts =
      JSON.parse(savedProducts);

    if (!Array.isArray(parsedProducts)) {
      return defaultProducts;
    }

    return parsedProducts;
  } catch {
    return defaultProducts;
  }
}
