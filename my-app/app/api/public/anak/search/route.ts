import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Ambil query parameter `nama`
    const { searchParams } = new URL(req.url);
    const nama = searchParams.get("nama");

    // Validasi: nama wajib
    if (!nama || typeof nama !== "string" || nama.trim() === "") {
      return NextResponse.json(
        { message: "Parameter 'nama' diperlukan" },
        { status: 400 }
      );
    }

    // Cari anak berdasarkan nama (case-insensitive, partial match)
    const anakList = await prisma.anak.findMany({
      where: {
        nama: {
          contains: nama.trim(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        nama: true,
        tanggalLahir: true,
        jenisKelamin: true,
        createdAt: true,
      },
      orderBy: {
        nama: "asc",
      },
      take: 50, // batasi hasil
    });

    return NextResponse.json({
      message: "Pencarian berhasil",
      total: anakList.length,
      data: anakList,
    });
  } catch (error) {
    console.error("Search Anak Error:", error);
    return NextResponse.json(
      { message: "Gagal melakukan pencarian" },
      { status: 500 }
    );
  }
}