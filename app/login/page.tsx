"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect =
    searchParams.get("redirect") || "/admin";

  const forceLogin =
    searchParams.get("force") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (forceLogin) {
      window.localStorage.removeItem(
        "nova-admin-auth",
      );
      return;
    }

    const isAuthenticated =
      window.localStorage.getItem("nova-admin-auth") ===
      "true";

    if (isAuthenticated) {
      router.replace("/admin");
    }
  }, [router, forceLogin]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const demoEmail = "admin@nova.com";
    const demoPassword = "Admin123!";

    window.setTimeout(() => {
      if (
        email.trim().toLowerCase() === demoEmail &&
        password === demoPassword
      ) {
        window.localStorage.setItem(
          "nova-admin-auth",
          "true",
        );

        router.replace(redirect);
        return;
      }

      setError(
        "Invalid email or password. Use the demo administrator credentials.",
      );

      setLoading(false);
    }, 500);
  }

  function fillDemoCredentials() {
    setEmail("admin@nova.com");
    setPassword("Admin123!");
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#f4f4f2] text-zinc-950">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            NOVA
            <span className="text-blue-600">.</span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium transition hover:text-blue-600"
          >
            ← Back to Store
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-6 py-14 lg:grid-cols-[1fr_480px]">
        {/* LEFT */}
        <div className="hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            NOVA Administration
          </p>

          <h1 className="mt-5 max-w-2xl text-6xl font-black leading-[1.05]">
            Manage the store from one
            centralized workspace.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-500">
            Secure access to product management,
            inventory monitoring, order workflows,
            and e-commerce operations.
          </p>

          <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            {[
              [
                "📦",
                "Product Management",
                "Create, edit and manage the product catalog.",
              ],
              [
                "📊",
                "Inventory Control",
                "Monitor stock levels and inventory value.",
              ],
              [
                "🧾",
                "Order Management",
                "Review orders and update fulfillment status.",
              ],
              [
                "🔐",
                "Admin Access",
                "Restricted administration workspace.",
              ],
            ].map(
              ([icon, title, description]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-black/10 bg-white p-5"
                >
                  <div className="text-2xl">
                    {icon}
                  </div>

                  <h2 className="mt-4 font-bold">
                    {title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {description}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="rounded-[2.5rem] border border-black/10 bg-white p-7 shadow-sm md:p-9">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-2xl text-white">
              🔐
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
              Admin Console
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Administrator Sign In
            </h2>

            <p className="mt-3 leading-7 text-zinc-500">
              Enter the demo administrator credentials
              to access the NOVA dashboard.
            </p>
          </div>

          {/* DEMO CREDENTIALS */}
          <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                  Demo Admin Access
                </p>

                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    <span className="text-zinc-500">
                      Email:
                    </span>{" "}
                    <strong>
                      admin@nova.com
                    </strong>
                  </p>

                  <p>
                    <span className="text-zinc-500">
                      Password:
                    </span>{" "}
                    <strong>
                      Admin123!
                    </strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fillDemoCredentials}
                className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                Use Demo
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-7"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <input
                required
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@nova.com"
                className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3.5 outline-none transition focus:border-blue-600"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <div className="relative">
                <input
                  required
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3.5 pr-20 outline-none transition focus:border-blue-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current,
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 hover:text-black"
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="mt-7 w-full rounded-full bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign In to Dashboard →"}
            </button>
          </form>

          <div className="mt-7 border-t border-black/10 pt-6">
            <p className="text-center text-xs leading-5 text-zinc-400">
              Portfolio authentication simulation.
              Demo credentials are intentionally
              visible for project reviewers.
            </p>

            <Link
              href="/account"
              className="mt-3 block text-center text-xs font-semibold text-zinc-500 transition hover:text-blue-600"
            >
              Customer Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f4f4f2]">
          <p className="text-sm text-zinc-500">
            Loading...
          </p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

