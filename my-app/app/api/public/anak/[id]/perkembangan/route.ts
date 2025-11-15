import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ambil ID anak dari params (Next.js 15+)
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { message: "ID anak diperlukan" },
        { status: 400 }
      );
    }

    // Cek apakah anak ada
    const anak = await prisma.anak.findUnique({
      where: { id },
      select: { id: true, nama: true },
    });

    if (!anak) {
      return NextResponse.json(
        { message: "Anak tidak ditemukan" },
        { status: 404 }
      );
    }

    // Ambil semua pemeriksaan untuk anak ini
    const pemeriksaanList = await prisma.pemeriksaan.findMany({
      where: { anakId: id },
      select: {
        id: true,
        tanggal: true,
        usiaBulan: true,
        beratBadan: true,
        tinggiBadan: true,
        lingkarKepala: true,
        metodeBerat: true,
        metodeTinggi: true,
        metodeLingkarKepala: true,
        keterangan: true,
        createdAt: true,
      },
      orderBy: {
        tanggal: "desc", // terbaru dulu
      },
    });

    return NextResponse.json({
      message: "Riwayat pemeriksaan berhasil diambil",
      anak: {
        id: anak.id,
        nama: anak.nama,
      },
      total: pemeriksaanList.length,
      data: pemeriksaanList,
    });
  } catch (error) {
    console.error("Riwayat Pemeriksaan Error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil riwayat pemeriksaan" },
      { status: 500 }
    );
  }
}