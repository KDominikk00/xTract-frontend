"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { SiMinutemailer } from "react-icons/si";

export default function ConfirmEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your email...");

  useEffect(() => {
    const accessToken = searchParams.get("access_token");

    if (!accessToken) {
      setStatus("error");
      setMessage("No access token found. Please try logging in again.");
      return;
    }

    setStatus("success");
    setMessage("Email confirmed! Redirecting to home...");
    const timer = setTimeout(() => router.push("/"), 3000);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <PageLayout>
      <main className="flex items-center justify-center min-h-[calc(100vh-12rem)] sm:min-h-screen px-6 bg-(--color-bg) text-white">
        <div className="w-full max-w-md border border-blue-500 rounded-xl shadow-md p-8 bg-linear-to-br from-[#0e111a] to-[#1a1f2a] hover:shadow-lg transition-shadow text-center">
          <SiMinutemailer className="text-9xl mx-auto"></SiMinutemailer>
          <h2 className="text-3xl font-bold mb-6 text-blue-500">
            Confirm Email
          </h2>

          <p className="text-white text-sm">{message}</p>

          {status === "loading" && (
            <div className="mt-6 animate-pulse text-blue-500">Verifying...</div>
          )}
          {status === "error" && (
            <button
              onClick={() => router.push("/signup")}
              className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-colors"
            >
              Go Back to Sign Up
            </button>
          )}
        </div>
      </main>
    </PageLayout>
  );
}