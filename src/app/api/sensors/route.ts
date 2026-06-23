// src/app/api/sensors/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  fetchDataSensorFromRtdbDetailed,
  mergeSensorsWithCattle,
  normalizeDataSensor,
} from "@/lib/firebase-rtdb";
import type { DashboardAlert } from "@/lib/dashboard";
import { sendTelegramNotification } from "@/lib/telegram";

export async function GET() {
  try {
    const sapiList = await prisma.sapi.findMany({
      orderBy: { idsapi: "asc" },
      select: { idsapi: true, nama_sapi: true, jenis_kelamin: true },
    });
    const cattleNames = new Map(
      sapiList.map((s) => [s.idsapi, s.nama_sapi])
    );

    const { data: raw, error: fetchError } = await fetchDataSensorFromRtdbDetailed();
    const { sensors: parsedSensors, tempHistory } = normalizeDataSensor(
      raw,
      cattleNames
    );

    const pendingMessage = fetchError ?? "Menunggu data Firebase";
    const { sensors, matchedCount } = mergeSensorsWithCattle(
      parsedSensors,
      sapiList,
      { pendingMessage }
    );

    const rtdbEmpty = matchedCount === 0;

    if (!rtdbEmpty) {
      sensors.forEach((sapi) => {
        if (sapi.offline) return;

        const batasSuhuDemam = 39.5;
        const batasSuhuKritisRendah = 36.0;
        const batasBateraiLemah = 25;

        if (sapi.temperature > batasSuhuDemam) {
          const pesanSuhuTinggi =
            `⚠️ *PERINGATAN T-COW°: SAPI DEMAM* ⚠️\n\n` +
            `🐮 *Nama Sapi:* ${sapi.cattleName}\n` +
            `🆔 *ID Eartag:* ${sapi.cattleId}\n` +
            `===== DATA KONDISI =====\n` +
            `🌡️ *Suhu Tubuh:* ${sapi.temperature}°C (⚠️ Demam Tinggi)\n` +
            `🔋 *Baterai Eartag:* ${sapi.battery}%\n` +
            `📍 *Lokasi:* ${sapi.location}\n` +
            `🕒 *Waktu Data:* ${sapi.lastUpdate}\n\n` +
            `_Mohon petugas lapangan segera mengecek kondisi kesehatan sapi._`;

          sendTelegramNotification(pesanSuhuTinggi);
        } else if (
          sapi.temperature > 0 &&
          sapi.temperature < batasSuhuKritisRendah
        ) {
          const pesanSuhuRendah =
            `⚠️ *PERINGATAN T-COW°: SUHU KRITIS/ABNORMAL* ⚠️\n\n` +
            `🐮 *Nama Sapi:* ${sapi.cattleName}\n` +
            `🆔 *ID Eartag:* ${sapi.cattleId}\n` +
            `===== DATA KONDISI =====\n` +
            `🌡️ *Suhu Tubuh:* ${sapi.temperature}°C (⚠️ Terlalu Rendah)\n` +
            `🔋 *Baterai Eartag:* ${sapi.battery}%\n` +
            `📍 *Lokasi:* ${sapi.location}\n` +
            `🕒 *Waktu Data:* ${sapi.lastUpdate}\n\n` +
            `_Deteksi suhu drop di bawah normal. Harap periksa apakah alat T-Cow° terlepas dari telinga sapi._`;

          sendTelegramNotification(pesanSuhuRendah);
        }

        if (sapi.battery <= batasBateraiLemah) {
          const pesanBaterai =
            `🔋 *PERINGATAN T-COW°: KONDISI BATERAI* ⚠️\n\n` +
            `🐮 *Nama Sapi:* ${sapi.cattleName}\n` +
            `🆔 *ID Eartag:* ${sapi.cattleId}\n` +
            `===== DATA KONDISI =====\n` +
            `🔋 *Sisa Baterai:* ${sapi.battery}% (${sapi.battery === 0 ? "⚠️ ALAT OFF / BATTERY CRITICAL" : "⚠️ Segera Cas"})\n` +
            `🌡️ *Suhu Terakhir:* ${sapi.temperature}°C\n` +
            `🕒 *Waktu Data:* ${sapi.lastUpdate}\n\n` +
            `_Mohon tim teknis segera melakukan maintenance/penggantian baterai eartag._`;

          sendTelegramNotification(pesanBaterai);
        }
      });
    }

    const alerts: DashboardAlert[] = sensors
      .filter((s) => s.status !== "Aktif")
      .map((s) => ({
        id: `sensor-${s.id}`,
        type:
          s.status === "Error"
            ? ("danger" as const)
            : ("warning" as const),
        title: `Sensor ${s.cattleName}`,
        message: s.offline
          ? fetchError ?? "Menunggu data dari Firebase Realtime Database"
          : `${s.status} · Suhu ${s.temperature}°C · Baterai ${s.battery}%`,
        time: s.lastUpdate,
        read: false,
      }));

    return NextResponse.json({
      sensors,
      tempHistory,
      alerts,
      cowNames: Object.fromEntries(
        sapiList.map((s) => [
          `S${String(s.idsapi).padStart(3, "0")}`,
          s.nama_sapi,
        ])
      ),
      updatedAt: new Date().toISOString(),
      source: rtdbEmpty ? "mysql-fallback" : "firebase",
      matchedCount,
      fetchError,
    });
  } catch (error) {
    console.error("[GET /api/sensors]", error);
    return NextResponse.json(
      { error: "Gagal memuat data sensor" },
      { status: 500 }
    );
  }
}
