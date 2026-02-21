"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { useAuth } from "@/lib/AuthProvider";
import { getUserTier } from "@/lib/aiPlan";

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const userTier = getUserTier(user);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleLogin = () => router.push("/login");
  const handleSignup = () => router.push("/signup");

  const handleLogout = () => router.push("/logout");

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const symbol = query.trim().toUpperCase();
    if (!symbol) return;
    router.push(`/stocks/${symbol}`);
    setQuery("");
    setSearchOpen(false);
  };

  const renderSearchForm = (key: string, width: number | string) => (
    <motion.form
      key={key}
      initial={{ width: 0, opacity: 0 }}
      animate={{ width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onSubmit={handleSearch}
      className="flex max-w-full items-center overflow-hidden rounded-full border border-blue-500 bg-[#141c2f] shadow-md"
    >
      <input
        type="text"
        placeholder="Enter symbol (NVDA, AAPL)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="w-full bg-transparent px-3 py-1.5 text-sm text-white focus:outline-none"
      />
      <button type="submit" className="p-2 transition-colors">
        <FiSearch className="h-5 w-5 text-white hover:text-blue-500" />
      </button>
      <button
        type="button"
        onClick={() => setSearchOpen(false)}
        className="px-3 text-gray-400 transition-colors hover:text-red-400"
      >
        ✕
      </button>
    </motion.form>
  );

  return (
    <header className="border-b border-gray-800 bg-(--color-bg) px-4 py-4 text-white sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 lg:flex-nowrap lg:gap-6">
          <Link href="/" className="cursor-pointer text-2xl font-bold sm:text-4xl">
            <span className="text-blue-500">x</span>Tract
          </Link>

          <div className="hidden lg:flex lg:flex-1 lg:justify-center">
            {!searchOpen && (
              <button
                onClick={() => setSearchOpen(true)}
                className="rounded p-1 transition-colors hover:text-blue-400"
                aria-label="Open stock search"
              >
                <FiSearch className="h-6 w-6 text-blue-500" />
              </button>
            )}

            <AnimatePresence>
              {searchOpen && (
                renderSearchForm("search-form-desktop", 420)
              )}
            </AnimatePresence>
          </div>

          <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-3">
            {!user ? (
              <>
                <button
                  onClick={handleLogin}
                  className="cursor-pointer rounded px-2.5 py-2 text-sm transition hover:text-blue-500 sm:px-4 sm:text-base"
                >
                  Login
                </button>
                <button
                  onClick={handleSignup}
                  className="cursor-pointer rounded bg-blue-500 px-3 py-2 text-sm text-white transition hover:bg-blue-700 sm:px-4 sm:text-base"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <span className="hidden rounded-full border border-blue-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-300 sm:inline-flex">
                  {userTier}
                </span>
                <button
                  onClick={handleLogout}
                  className="cursor-pointer rounded bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700 sm:px-4 sm:text-base"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>

        <div className="relative mt-4 flex justify-center lg:hidden">
          {!searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded p-1 transition-colors hover:text-blue-400"
              aria-label="Open stock search"
            >
              <FiSearch className="h-6 w-6 text-blue-500" />
            </button>
          )}

          <AnimatePresence>
            {searchOpen && (
              renderSearchForm("search-form-mobile", "min(28rem, calc(100vw - 2rem))")
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
