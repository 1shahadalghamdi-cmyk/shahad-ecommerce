"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isAuthenticated =
      window.localStorage.getItem("nova-admin-auth") ===
      "true";

    if (!isAuthenticated) {
      setAuthorized(false);
      setChecking(false);

      router.replace(
        `/login?redirect=${encodeURIComponent(pathname)}`,
      );

      return;
    }

    setAuthorized(true);
    setChecking(false);
  }, [pathname, router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f4f2]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-zinc-500">
            Verifying admin access...
          </p>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
