import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { serializePengguna } from "@/lib/pengguna";
import { jsonError, jsonOk } from "@/lib/api-response";
import { normalizeEmail } from "@/lib/validation";
import { loginRateLimiter } from "@/lib/ratelimit"; // 1. Impor rate limiter

export async function POST(request: NextRequest) {
  try {
    // 2. AMBIL IP ADDRESS USER
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    
    // 3. JALANKAN PENGECEKAN RATE LIMIT VIA UPSTASH REDIS
    const { success, limit, reset, remaining } = await loginRateLimiter.limit(ip);

    // 4. JIKA BATAS REQUEST HABIS (LEBIH DARI 5 KALI), BLOKIR LANGSUNG
    if (!success) {
      return jsonError(
        "Terlalu banyak percobaan login. Akses dikunci sementara, silakan coba beberapa menit lagi.",
        429
      );
    }

    // ==========================================
    // KODINGAN ASLI TIM KAMU DI BAWAH INI
    // ==========================================
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    if (!email?.trim() || !password) {
      return jsonError("Email dan password wajib diisi", 400);
    }

    const normalizedEmail = normalizeEmail(email);
    const pengguna = await prisma.pengguna.findUnique({
      where: { email: normalizedEmail },
    });

    if (!pengguna) {
      return jsonError("Email atau password salah", 401);
    }

    const valid = await verifyPassword(password, pengguna.password);
    if (!valid) {
      return jsonError("Email atau password salah", 401);
    }

    const updated = await prisma.pengguna.update({
      where: { uid: pengguna.uid },
      data: { lastLogin: new Date() },
    });

    return jsonOk(serializePengguna(updated) as Record<string, unknown>);
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return jsonError("Gagal masuk", 500);
  }
}