import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    // ⛔ Cek token (admin only)
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { nama, tanggalLahir, jenisKelamin } = await req.json();

    if (!nama || !tanggalLahir || !jenisKelamin) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const anak = await prisma.anak.create({
      data: {
        nama,
        tanggalLahir: new Date(tanggalLahir),
        jenisKelamin,
      },
    });

    return NextResponse.json(
      { message: "Anak berhasil ditambahkan", anak },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create anak error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
