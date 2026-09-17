"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";

type CustomerUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

type CustomerSession = {
  id: string;
  name: string;
  email: string;
};

const USERS_KEY =
  "nova-customer-users";

const SESSION_KEY =
  "nova-customer-session";

const DEMO_CUSTOMER = {
  id: "CUS-DEMO",
  name: "Demo Customer",
  email: "customer@nova.com",
  password: "Customer123!",
};

function getUsers(): CustomerUser[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved =
    window.localStorage.getItem(
      USERS_KEY,
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

export default function CustomerAccountPage() {
  const [mode, setMode] =
    useState<"signin" | "register">(
      "signin",
    );

  const [session, setSession] =
    useState<CustomerSession | null>(
      null,
    );

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    const existingUsers =
      getUsers();

    const demoExists =
      existingUsers.some(
        (user) =>
          user.email.toLowerCase() ===
          DEMO_CUSTOMER.email,
      );

    if (!demoExists) {
      const demoUser: CustomerUser = {
        ...DEMO_CUSTOMER,
        createdAt:
          new Date().toISOString(),
      };

      window.localStorage.setItem(
        USERS_KEY,
        JSON.stringify([
          demoUser,
          ...existingUsers,
        ]),
      );
    }

    const saved =
      window.localStorage.getItem(
        SESSION_KEY,
      );

    if (!saved) {
      return;
    }

    try {
      setSession(
        JSON.parse(saved),
      );
    } catch {
      window.localStorage.removeItem(
        SESSION_KEY,
      );
    }
  }, []);

  function resetFeedback() {
    setMessage("");
    setError("");
  }

  function switchMode(
    nextMode: "signin" | "register",
  ) {
    setMode(nextMode);
    resetFeedback();
    setPassword("");
    setConfirmPassword("");
  }

  function fillDemoCredentials() {
    setMode("signin");
    setEmail(
      DEMO_CUSTOMER.email,
    );
    setPassword(
      DEMO_CUSTOMER.password,
    );
    setConfirmPassword("");
    setName("");
    resetFeedback();
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    resetFeedback();

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Please complete the required fields.",
      );
      return;
    }

    const users = getUsers();

    if (mode === "register") {
      const cleanName =
        name.trim();

      if (!cleanName) {
        setError(
          "Please enter your name.",
        );
        return;
      }

      if (password.length < 6) {
        setError(
          "Password must be at least 6 characters for this demo.",
        );
        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match.",
        );
        return;
      }

      const exists =
        users.some(
          (user) =>
            user.email.toLowerCase() ===
            cleanEmail,
        );

      if (exists) {
        setError(
          "An account with this email already exists.",
        );
        return;
      }

      const newUser: CustomerUser = {
        id: `CUS-${Date.now()
          .toString()
          .slice(-8)}`,
        name: cleanName,
        email: cleanEmail,
        password,
        createdAt:
          new Date().toISOString(),
      };

      const updatedUsers = [
        newUser,
        ...users,
      ];

      window.localStorage.setItem(
        USERS_KEY,
        JSON.stringify(
          updatedUsers,
        ),
      );

      const newSession:
        CustomerSession = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };

      window.localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(
          newSession,
        ),
      );

      setSession(newSession);
      setMessage(
        "Account created successfully.",
      );
      return;
    }

    const matchedUser =
      users.find(
        (user) =>
          user.email.toLowerCase() ===
            cleanEmail &&
          user.password === password,
      );

    if (!matchedUser) {
      setError(
        "Invalid email or password.",
      );
      return;
    }

    const newSession:
      CustomerSession = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
    };

    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(newSession),
    );

    setSession(newSession);
    setMessage(
      "Signed in successfully.",
    );
  }

  function signOut() {
    window.localStorage.removeItem(
      SESSION_KEY,
    );

    setSession(null);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMessage("");
    setError("");
  }

  if (session) {
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
              className="text-sm font-medium transition hover:text-blue-600"
            >
              ← Back to Store
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="rounded-[2.5rem] border border-black/10 bg-white p-8 shadow-sm md:p-12">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                  Customer Account
                </p>

                <h1 className="mt-4 text-4xl font-black">
                  Welcome,{" "}
                  {session.name}.
                </h1>

                <p className="mt-3 text-zinc-500">
                  Your NOVA customer session is active.
                </p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-black text-white">
                {session.name
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f7f7f5] p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-400">
                  Customer ID
                </p>

                <p className="mt-2 font-semibold">
                  {session.id}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f7f5] p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-400">
                  Email
                </p>

                <p className="mt-2 font-semibold">
                  {session.email}
                </p>
              </div>
            </div>

            {message && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
                ✓ {message}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-blue-600 px-7 py-3.5 font-semibold text-white transition hover:bg-blue-700"
              >
                Continue Shopping
              </Link>

              <Link
                href="/track-order"
                className="rounded-full border border-black/10 px-7 py-3.5 font-semibold transition hover:border-blue-600 hover:text-blue-600"
              >
                Track Order
              </Link>

              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-red-200 px-7 py-3.5 font-semibold text-red-600 transition hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm leading-6 text-amber-800">
                Portfolio authentication simulation.
                Customer accounts are currently stored
                only in this browser. Tomorrow, this can
                be migrated to Supabase Auth and SQL.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

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
            className="text-sm font-medium transition hover:text-blue-600"
          >
            ← Back to Store
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-6 py-14 lg:grid-cols-[1fr_480px]">
        <div className="hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            NOVA Customer Account
          </p>

          <h1 className="mt-5 max-w-2xl text-6xl font-black leading-[1.05]">
            Save your shopping journey in one place.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-500">
            Create a customer account to prepare
            for saved profiles, order history,
            wishlist sync, and personalized
            shopping experiences.
          </p>

          <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            {[
              [
                "❤️",
                "Wishlist",
                "Keep favorite products ready for later.",
              ],
              [
                "📦",
                "Order Tracking",
                "Follow processing, shipping, and delivery.",
              ],
              [
                "💬",
                "Customer Support",
                "Continue support conversations with NOVA.",
              ],
              [
                "🛒",
                "Shopping",
                "Prepare for customer-specific cart experiences.",
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

        <div className="rounded-[2.5rem] border border-black/10 bg-white p-7 shadow-sm md:p-9">
          <div className="flex rounded-full bg-zinc-100 p-1">
            <button
              type="button"
              onClick={() =>
                switchMode(
                  "signin",
                )
              }
              className={`flex-1 rounded-full px-5 py-3 text-sm font-semibold transition ${
                mode === "signin"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-500"
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() =>
                switchMode(
                  "register",
                )
              }
              className={`flex-1 rounded-full px-5 py-3 text-sm font-semibold transition ${
                mode === "register"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-500"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
              Customer Access
            </p>

            <h2 className="mt-3 text-3xl font-black">
              {mode === "signin"
                ? "Welcome back"
                : "Join NOVA"}
            </h2>

            <p className="mt-3 leading-7 text-zinc-500">
              {mode === "signin"
                ? "Sign in to your NOVA customer account."
                : "Create a customer account for this portfolio demo."}
            </p>
          </div>

          {mode === "signin" && (
            <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                    Demo Customer Access
                  </p>

                  <div className="mt-3 space-y-1 text-sm">
                    <p>
                      <span className="text-zinc-500">
                        Email:
                      </span>{" "}
                      <strong>
                        customer@nova.com
                      </strong>
                    </p>

                    <p>
                      <span className="text-zinc-500">
                        Password:
                      </span>{" "}
                      <strong>
                        Customer123!
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
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-7"
          >
            {mode === "register" && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full Name
                </label>

                <input
                  required
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Your name"
                  className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3.5 outline-none transition focus:border-blue-600"
                />
              </div>
            )}

            <div
              className={
                mode === "register"
                  ? "mt-5"
                  : ""
              }
            >
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <input
                required
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                placeholder="customer@example.com"
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
                      (current) =>
                        !current,
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

            {mode === "register" && (
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">
                  Confirm Password
                </label>

                <input
                  required
                  type="password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Repeat password"
                  className="w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 py-3.5 outline-none transition focus:border-blue-600"
                />
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                ✓ {message}
              </div>
            )}

            <button
              type="submit"
              className="mt-7 w-full rounded-full bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              {mode === "signin"
                ? "Sign In →"
                : "Create Account →"}
            </button>
          </form>

          <div className="mt-7 border-t border-black/10 pt-6">
            <p className="text-center text-xs leading-5 text-zinc-400">
              Customer account simulation.
              Admin access remains separate.
            </p>

            <Link
              href="/login?force=1"
              className="mt-3 block text-center text-xs font-semibold text-zinc-500 transition hover:text-blue-600"
            >
              Administrator Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

