import { NextRequest, NextResponse } from "next/server";
import { getUserTier } from "@/lib/aiPlan";
import { getUserFromRequest } from "@/lib/server/auth";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

type FollowedBody = {
  symbol?: unknown;
};

function normalizeSymbol(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const symbol = input.trim().toUpperCase();
  if (!symbol) return null;
  if (!/^[A-Z.\-]{1,12}$/.test(symbol)) return null;
  return symbol;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("followed_stocks")
      .select("symbol,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ followed: data ?? [] });
  } catch (err) {
    console.error("Followed list error:", err);
    return NextResponse.json({ error: "Unable to load followed stocks." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as FollowedBody;
    const symbol = normalizeSymbol(body.symbol);
    if (!symbol) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }

    const tier = getUserTier(user);
    const followLimit = tier === "pro" ? null : 3;

    if (followLimit !== null) {
      const { count, error: countError } = await supabaseAdmin
        .from("followed_stocks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (countError) {
        throw new Error(countError.message);
      }

      const { data: existing, error: existingError } = await supabaseAdmin
        .from("followed_stocks")
        .select("symbol")
        .eq("user_id", user.id)
        .eq("symbol", symbol)
        .maybeSingle();

      if (existingError) {
        throw new Error(existingError.message);
      }

      const alreadyFollowed = Boolean(existing?.symbol);
      if (!alreadyFollowed && (count ?? 0) >= followLimit) {
        return NextResponse.json(
          { error: "Follow limit reached for your current plan.", limit: followLimit },
          { status: 403 }
        );
      }
    }

    const { error } = await supabaseAdmin.from("followed_stocks").upsert(
      {
        user_id: user.id,
        symbol,
      },
      { onConflict: "user_id,symbol" }
    );

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, symbol });
  } catch (err) {
    console.error("Follow symbol error:", err);
    return NextResponse.json({ error: "Unable to follow symbol." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as FollowedBody;
    const symbol = normalizeSymbol(body.symbol);
    if (!symbol) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("followed_stocks")
      .delete()
      .eq("user_id", user.id)
      .eq("symbol", symbol);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, symbol });
  } catch (err) {
    console.error("Unfollow symbol error:", err);
    return NextResponse.json({ error: "Unable to unfollow symbol." }, { status: 500 });
  }
}
