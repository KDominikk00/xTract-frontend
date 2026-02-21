"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { SiMinutemailer } from "react-icons/si";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your email...");

  useEffect(() => {
    let isActive = true;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    async function verifyEmail() {
      try {
        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");

        // Supabase email templates can return either code flow or token_hash flow.
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          });
          if (error) throw error;
        } else {
          let sessionAccessToken = accessToken;
          let sessionRefreshToken = refreshToken;

          // Some providers append tokens in the URL hash fragment instead of query params.
          if (!sessionAccessToken || !sessionRefreshToken) {
            const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
            sessionAccessToken = hashParams.get("access_token");
            sessionRefreshToken = hashParams.get("refresh_token");
          }

          if (!sessionAccessToken || !sessionRefreshToken) {
            throw new Error("No verification token found. Please open the latest email link.");
          }

          const { error } = await supabase.auth.setSession({
            access_token: sessionAccessToken,
            refresh_token: sessionRefreshToken,
          });
          if (error) throw error;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !data.session?.user) {
          throw new Error("Email verification succeeded, but no active session was created.");
        }

        if (!isActive) return;
        setStatus("success");
        setMessage("Email confirmed! Redirecting to home...");
        redirectTimer = setTimeout(() => router.push("/"), 3000);
      } catch (err) {
        if (!isActive) return;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Email verification failed.");
      }
    }

    void verifyEmail();

    return () => {
      isActive = false;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [searchParams, router]);

  return (
    <PageLayout>
      <section className="flex min-h-[60vh] items-center justify-center bg-(--color-bg) px-4 py-10 text-white sm:px-6 sm:py-14">
        <div className="w-full max-w-md rounded-xl border border-blue-500 bg-linear-to-br from-[#0e111a] to-[#1a1f2a] p-6 text-center shadow-md transition-shadow hover:shadow-lg sm:p-8">
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
      </section>
    </PageLayout>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
