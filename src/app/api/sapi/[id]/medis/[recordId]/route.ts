import { NextRequest, NextResponse } from "next/server";
import { deleteMedicalRecord, updateMedicalRecord } from "@/lib/sapi-service";
import type { MedicalRecordInput } from "@/lib/sapi";

type RouteParams = { params: Promise<{ id: string; recordId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id, recordId } = await params;

  try {
    const body = (await request.json()) as Partial<MedicalRecordInput>;
    const record = await updateMedicalRecord(id, recordId, body);

    if (!record) {
      return NextResponse.json(
        { error: "Riwayat medis tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("[PATCH /api/sapi/[id]/medis/[recordId]]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui riwayat medis" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id, recordId } = await params;

  try {
    const deleted = await deleteMedicalRecord(id, recordId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Riwayat medis tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/sapi/[id]/medis/[recordId]]", error);
    return NextResponse.json(
      { error: "Gagal menghapus riwayat medis" },
      { status: 500 }
    );
  }
}
