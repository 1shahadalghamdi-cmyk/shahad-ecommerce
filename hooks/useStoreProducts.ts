"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  defaultProducts,
  getStoredProducts,
  Product,
} from "@/lib/products";

export function useStoreProducts() {
  const [products, setProducts] =
    useState<Product[]>(
      defaultProducts,
    );

  useEffect(() => {
    function syncProducts() {
      setProducts(
        getStoredProducts(),
      );
    }

    syncProducts();

    window.addEventListener(
      "storage",
      syncProducts,
    );

    window.addEventListener(
      "focus",
      syncProducts,
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncProducts,
      );

      window.removeEventListener(
        "focus",
        syncProducts,
      );
    };
  }, []);

  return products;
}
