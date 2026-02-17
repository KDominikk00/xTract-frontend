"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const signOut = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setStatus("error");
        console.error("Logout error:", error.message);
      } else {
        setStatus("success");
        setTimeout(() => router.push("/"), 2000);
      }
    };

    signOut();
  }, [router]);

  return (
    <PageLayout>
      <main className="flex items-center pt-56 justify-center px-6 bg-(--color-bg) text-white">
        <div className="w-full max-w-md border border-blue-500 rounded-xl shadow-md p-8 bg-linear-to-br from-[#0e111a] to-[#1a1f2a] text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-500">Logging Out</h2>

          {status === "loading" && <p className="text-white">Signing you out...</p>}
          {status === "success" && <p className="text-white">You have been logged out. Redirecting to home...</p>}
          {status === "error" && (
            <>
              <p className="text-red-500">An error occurred during logout.</p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded transition-colors"
              >
                Go Home
              </button>
            </>
          )}
        </div>
      </main>
    </PageLayout>
  );
}