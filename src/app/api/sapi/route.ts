import { NextResponse } from "next/server";
import { buildSapiBundle, createCattle } from "@/lib/sapi-service";
import type { CattleInput } from "@/lib/sapi";

export async function GET() {
  try {
    const data = await buildSapiBundle();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/sapi]", error);
    return NextResponse.json(
      { error: "Gagal memuat data sapi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CattleInput;

    if (!body.name?.trim() || !body.breed?.trim()) {
      return NextResponse.json(
        { error: "Nama dan jenis sapi wajib diisi" },
        { status: 400 }
      );
    }

    const cattle = await createCattle(body);
    return NextResponse.json({ cattle }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/sapi]", error);
    const message =
      error instanceof Error ? error.message : "Gagal menambahkan sapi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
