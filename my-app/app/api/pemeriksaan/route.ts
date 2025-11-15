import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function isValidMetode(value: unknown): value is "Ditimbang" | "PerkiraanOrtu" | "TidakDiukur" {
  return (
    value === "Ditimbang" ||
    value === "PerkiraanOrtu" ||
    value === "TidakDiukur"
  );
}

export async function POST(req: NextRequest) {
  try {
    // === Otentikasi: hanya admin ===
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak: hanya admin" }, { status: 403 });
    }

    // === Ambil data dari body ===
    const body = await req.json();
    const {
      anakId,
      usiaBulan,
      tanggal,
      beratBadan,
      tinggiBadan,
      lingkarKepala,
      metodeBerat,
      metodeTinggi,
      metodeLingkarKepala,
      keterangan,
    } = body;

    // === Validasi wajib ===
    if (!anakId || typeof anakId !== "string") {
      return NextResponse.json({ message: "anakId wajib diisi" }, { status: 400 });
    }

    if (!Number.isInteger(usiaBulan) || usiaBulan < 0) {
      return NextResponse.json({ message: "usiaBulan harus berupa angka bulat ≥ 0" }, { status: 400 });
    }

    // === Validasi opsional ===
    if (beratBadan !== undefined && (typeof beratBadan !== "number" || beratBadan <= 0)) {
      return NextResponse.json({ message: "beratBadan harus angka positif" }, { status: 400 });
    }

    if (tinggiBadan !== undefined && (typeof tinggiBadan !== "number" || tinggiBadan <= 0)) {
      return NextResponse.json({ message: "tinggiBadan harus angka positif" }, { status: 400 });
    }

    if (lingkarKepala !== undefined && (typeof lingkarKepala !== "number" || lingkarKepala <= 0)) {
      return NextResponse.json({ message: "lingkarKepala harus angka positif" }, { status: 400 });
    }

    if (metodeBerat !== undefined && !isValidMetode(metodeBerat)) {
      return NextResponse.json({ message: "metodeBerat tidak valid" }, { status: 400 });
    }

    if (metodeTinggi !== undefined && !isValidMetode(metodeTinggi)) {
      return NextResponse.json({ message: "metodeTinggi tidak valid" }, { status: 400 });
    }

    if (metodeLingkarKepala !== undefined && !isValidMetode(metodeLingkarKepala)) {
      return NextResponse.json({ message: "metodeLingkarKepala tidak valid" }, { status: 400 });
    }

    // === Pastikan anak ada ===
    const anak = await prisma.anak.findUnique({ where: { id: anakId } });
    if (!anak) {
      return NextResponse.json({ message: "Anak tidak ditemukan" }, { status: 404 });
    }

    // === Ambil adminId dari token ===
    const adminId = payload.id;

    // === Buat pemeriksaan baru ===
    const pemeriksaanBaru = await prisma.pemeriksaan.create({
      data: { // ✅ ini yang diperbaiki: tambahkan 'data:'
        anakId,
        adminId,
        usiaBulan,
        tanggal: tanggal ? new Date(tanggal) : undefined,
        beratBadan: beratBadan || null,
        tinggiBadan: tinggiBadan || null,
        lingkarKepala: lingkarKepala || null,
        metodeBerat: metodeBerat || "Ditimbang",
        metodeTinggi: metodeTinggi || "Ditimbang",
        metodeLingkarKepala: metodeLingkarKepala || "Ditimbang",
        keterangan: keterangan || null,
      },
    });

    return NextResponse.json(
      {
        message: "Data pemeriksaan berhasil ditambahkan",
        pemeriksaan: pemeriksaanBaru,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Pemeriksaan Error:", error);
    return NextResponse.json({ message: "Gagal menambahkan data pemeriksaan" }, { status: 500 });
  }
}