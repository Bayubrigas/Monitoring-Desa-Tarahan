import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// ─── UTILS ────────────────────────────────────────────────

function isValidJenisKelamin(value: unknown): value is "L" | "P" {
  return value === "L" || value === "P";
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return (
    !isNaN(date.getTime()) &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateString) && // strict YYYY-MM-DD
    date <= new Date()
  );
}

// ─── GET: Ambil data anak ─────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "ID anak diperlukan" }, { status: 400 });
    }

    const anak = await prisma.anak.findUnique({ where: { id } });

    if (!anak) {
      return NextResponse.json({ message: "Anak tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ anak });
  } catch (error) {
    console.error("GET Anak Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// ─── PUT: Update data anak (admin only) ───────────────────

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // === Otentikasi ===
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak: hanya admin" }, { status: 403 });
    }

    // === Ambil ID ===
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "ID anak diperlukan" }, { status: 400 });
    }

    // === Cek keberadaan ===
    const existing = await prisma.anak.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Anak tidak ditemukan" }, { status: 404 });
    }

    // === Parse body ===
    const body = await req.json();
    const { nama, tanggalLahir, jenisKelamin } = body;

    // === Validasi ===
    if (nama !== undefined && (typeof nama !== "string" || nama.trim() === "")) {
      return NextResponse.json({ message: "Nama harus berupa string tidak kosong" }, { status: 400 });
    }

    let tanggalLahirDate: Date | undefined;
    if (tanggalLahir !== undefined) {
      if (typeof tanggalLahir !== "string" || !isValidDate(tanggalLahir)) {
        return NextResponse.json(
          { message: "Format tanggal lahir tidak valid (harus YYYY-MM-DD dan tidak di masa depan)" },
          { status: 400 }
        );
      }
      tanggalLahirDate = new Date(tanggalLahir);
    }

    if (jenisKelamin !== undefined && !isValidJenisKelamin(jenisKelamin)) {
      return NextResponse.json({ message: "Jenis kelamin harus 'L' atau 'P'" }, { status: 400 });
    }

    // === Build update payload (Prisma accepts partial objects directly) ===
    const updateData = {
      ...(nama !== undefined ? { nama } : {}),
      ...(tanggalLahirDate !== undefined ? { tanggalLahir: tanggalLahirDate } : {}),
      ...(jenisKelamin !== undefined ? { jenisKelamin } : {}),
    };

    // === Update ===
    const updated = await prisma.anak.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Data anak berhasil diperbarui", anak: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT Anak Error:", error);
    return NextResponse.json({ message: "Gagal memperbarui data anak" }, { status: 500 });
  }
}

// ─── DELETE: Hapus anak (admin only) ──────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // === Otentikasi ===
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak: hanya admin" }, { status: 403 });
    }

    // === Ambil ID ===
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "ID anak diperlukan" }, { status: 400 });
    }

    // === Pastikan ada ===
    const existing = await prisma.anak.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Anak tidak ditemukan" }, { status: 404 });
    }

    // === Hapus ===
    await prisma.anak.delete({ where: { id } });

    return NextResponse.json({ message: "Data anak berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Anak Error:", error);
    return NextResponse.json({ message: "Gagal menghapus data anak" }, { status: 500 });
  }
}