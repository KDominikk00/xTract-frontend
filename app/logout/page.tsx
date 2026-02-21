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
      <section className="flex min-h-[60vh] items-center justify-center bg-(--color-bg) px-4 py-10 text-white sm:px-6 sm:py-14">
        <div className="w-full max-w-md rounded-xl border border-blue-500 bg-linear-to-br from-[#0e111a] to-[#1a1f2a] p-6 text-center shadow-md sm:p-8">
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
      </section>
    </PageLayout>
  );
}
