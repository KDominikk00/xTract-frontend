"use client";

import Link from "next/link";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { AITier } from "@/lib/aiPlan";
import { getAccessToken } from "@/lib/getAccessToken";

type PlanActionButtonProps = {
  plan: "free" | "plus" | "pro";
  currentTier: AITier;
  user: User | null;
};

export default function PlanActionButton({ plan, currentTier, user }: PlanActionButtonProps) {
  const [loading, setLoading] = useState(false);

  async function startCheckout(targetPlan: "plus" | "pro") {
    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) throw new Error("Please log in to subscribe.");

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: targetPlan }),
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Unable to start checkout.");
      window.location.assign(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to start checkout.");
    } finally {
      setLoading(false);
    }
  }

  async function openPortal() {
    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) throw new Error("Please log in.");

      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Unable to open billing portal.");
      window.location.assign(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to open billing portal.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <Link
        href="/signup"
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-500 py-2 font-semibold hover:bg-blue-600"
      >
        {plan === "free" ? "Get Started" : `Choose ${plan === "plus" ? "Plus" : "Pro"}`}
      </Link>
    );
  }

  if (plan === "free") {
    if (currentTier === "free") {
      return (
        <button
          className="mt-6 w-full cursor-not-allowed rounded-lg bg-zinc-700 py-2 font-semibold text-zinc-300"
          disabled
        >
          Free Plan
        </button>
      );
    }

    return (
      <button
        onClick={openPortal}
        className="mt-6 w-full rounded-lg bg-zinc-700 py-2 font-semibold hover:bg-zinc-600"
        disabled={loading}
      >
        {loading ? "Opening..." : "Manage Billing"}
      </button>
    );
  }

  if (currentTier === plan) {
    return (
      <button
        onClick={openPortal}
        className="mt-6 w-full rounded-lg bg-zinc-700 py-2 font-semibold hover:bg-zinc-600"
        disabled={loading}
      >
        {loading ? "Opening..." : "Manage Billing"}
      </button>
    );
  }

  if (currentTier === "pro" && plan === "plus") {
    return (
      <button
        onClick={openPortal}
        className="mt-6 w-full rounded-lg bg-zinc-700 py-2 font-semibold hover:bg-zinc-600"
        disabled={loading}
      >
        {loading ? "Opening..." : "Manage Billing"}
      </button>
    );
  }

  return (
    <button
      onClick={() => startCheckout(plan)}
      className="mt-6 w-full rounded-lg bg-blue-500 py-2 font-semibold transition-colors hover:bg-blue-600"
      disabled={loading}
    >
      {loading ? "Loading..." : `Upgrade to ${plan === "plus" ? "Plus" : "Pro"}`}
    </button>
  );
}
