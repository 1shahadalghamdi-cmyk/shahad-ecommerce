"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

import AdminGuard from "@/components/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  function handleLogout() {
    window.localStorage.removeItem("nova-admin-auth");

    router.replace("/login");
  }

  return (
    <AdminGuard>
      <div className="relative">
        {children}

        <button
          onClick={handleLogout}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </AdminGuard>
  );
}
