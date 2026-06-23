import { NextRequest, NextResponse } from "next/server";
import {
  createMedicalRecord,
  listMedicalRecordsForCattle,
} from "@/lib/sapi-service";
import type { MedicalRecordInput } from "@/lib/sapi";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const records = await listMedicalRecordsForCattle(id);
    return NextResponse.json({ records });
  } catch (error) {
    console.error("[GET /api/sapi/[id]/medis]", error);
    return NextResponse.json(
      { error: "Gagal memuat riwayat medis" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = (await request.json()) as MedicalRecordInput;

    if (!body.jenisTindakan || !body.date) {
      return NextResponse.json(
        { error: "Jenis tindakan dan tanggal wajib diisi" },
        { status: 400 }
      );
    }

    const record = await createMedicalRecord(id, body);
    if (!record) {
      return NextResponse.json({ error: "Sapi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/sapi/[id]/medis]", error);
    return NextResponse.json(
      { error: "Gagal menambahkan riwayat medis" },
      { status: 500 }
    );
  }
}
