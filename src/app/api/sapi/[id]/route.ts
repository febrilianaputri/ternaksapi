import { NextRequest, NextResponse } from "next/server";
import { deleteCattle, findCattleByParam, updateCattle } from "@/lib/sapi-service";
import { buildCattleSensorData, fetchDataSensorFromRtdb } from "@/lib/firebase-rtdb";
import type { CattleInput } from "@/lib/sapi";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const { cattle, bundle } = await findCattleByParam(id);
    if (!cattle) {
      return NextResponse.json({ error: "Sapi tidak ditemukan" }, { status: 404 });
    }

    const cattleId = cattle.id;
    
    // Fetch sensor data from Firebase
    let sensorData = null;
    try {
      const raw = await fetchDataSensorFromRtdb();
      sensorData = raw ? buildCattleSensorData(raw, cattle.idsapi) : null;
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      // Continue without sensor data
    }

    return NextResponse.json({
      cattle,
      medicalHistory: bundle.medicalHistory.filter(
        (m) => m.cattleId === cattleId
      ),
      vaccinationData: bundle.vaccinationData.filter(
        (v) => v.cattleId === cattleId
      ),
      cattleActivityLog: bundle.cattleActivityLog.filter(
        (a) => a.cattleId === cattleId
      ),
      sensorData,
    });
  } catch (error) {
    console.error("[GET /api/sapi/[id]]", error);
    return NextResponse.json(
      { error: "Gagal memuat detail sapi" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = (await request.json()) as Partial<CattleInput>;
    const cattle = await updateCattle(id, body);

    if (!cattle) {
      return NextResponse.json({ error: "Sapi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ cattle });
  } catch (error) {
    console.error("[PATCH /api/sapi/[id]]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data sapi" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const deleted = await deleteCattle(id);
    if (!deleted) {
      return NextResponse.json({ error: "Sapi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/sapi/[id]]", error);
    return NextResponse.json(
      { error: "Gagal menghapus data sapi" },
      { status: 500 }
    );
  }
}
