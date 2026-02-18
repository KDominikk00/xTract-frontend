"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleLogin = () => router.push("/login");
  const handleSignup = () => router.push("/signup");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/logout");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    console.log("Searching for:", query);
    // TODO: Replace with actual stock API search logic
    setSearchOpen(false);
  };

  return (
    <header className="bg-(--color-bg) text-(--color-fg) border-b border-gray-800 px-6 py-4 flex justify-between items-center relative">
      <Link href="/" className="text-4xl font-bold">
        <span className="text-blue-500">x</span>Tract
      </Link>

      <div className="flex items-center justify-center relative">
        {!searchOpen && (
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-16 rounded transition-colors mt-0.5"
          >
            <FiSearch className="text-blue-500 w-6 h-6" />
          </button>
        )}

        <AnimatePresence>
          {searchOpen && (
            <motion.form
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onSubmit={handleSearch}
              className="ml-10 flex items-center bg-[#0e111a] border border-blue-500 rounded-full overflow-hidden absolute left-1/2 -translate-x-1/2 shadow-md"
            >
              <input
                type="text"
                placeholder="Search stocks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="px-3 py-1.5 w-full bg-transparent text-white focus:outline-none text-sm"
              />
              <button
                type="submit"
                className="p-2 transition-colors"
              >
                <FiSearch className="hover:text-blue-500 w-5 h-5 text-white" />
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="px-3 text-gray-400 hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <div className="flex space-x-4">
        {!user ? (
          <>
            <button onClick={handleLogin} className="px-4 py-2 rounded transition">
              <span className="hover:text-blue-500 cursor-pointer transition">Login</span>
            </button>
            <button
              onClick={handleSignup}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded transition cursor-pointer"
            >
              Sign Up
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 py-2 hover:bg-red-700 text-white rounded transition-colors cursor-pointer shadow-sm"
          >
            Log Out
          </button>
        )}
      </div>
    </header>
  );
}