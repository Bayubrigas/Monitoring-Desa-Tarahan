-- CreateEnum
CREATE TYPE "MetodePengukuran" AS ENUM ('Ditimbang', 'PerkiraanOrtu', 'TidakDiukur');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('L', 'P');

-- CreateTable
CREATE TABLE "Vitamin" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "Vitamin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PemberianVitamin" (
    "id" TEXT NOT NULL,
    "pemeriksaanId" TEXT NOT NULL,
    "vitaminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PemberianVitamin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anak" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pemeriksaan" (
    "id" TEXT NOT NULL,
    "anakId" TEXT NOT NULL,
    "beratBadan" DOUBLE PRECISION,
    "tinggiBadan" DOUBLE PRECISION,
    "lingkarKepala" DOUBLE PRECISION,
    "usiaBulan" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodeBerat" "MetodePengukuran" DEFAULT 'Ditimbang',
    "metodeTinggi" "MetodePengukuran" DEFAULT 'Ditimbang',
    "metodeLingkarKepala" "MetodePengukuran" DEFAULT 'Ditimbang',
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pemeriksaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vitamin_nama_key" ON "Vitamin"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "PemberianVitamin_pemeriksaanId_vitaminId_key" ON "PemberianVitamin"("pemeriksaanId", "vitaminId");

-- CreateIndex
CREATE INDEX "Anak_nama_idx" ON "Anak"("nama");

-- CreateIndex
CREATE INDEX "Anak_tanggalLahir_idx" ON "Anak"("tanggalLahir");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "PemberianVitamin" ADD CONSTRAINT "PemberianVitamin_pemeriksaanId_fkey" FOREIGN KEY ("pemeriksaanId") REFERENCES "Pemeriksaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PemberianVitamin" ADD CONSTRAINT "PemberianVitamin_vitaminId_fkey" FOREIGN KEY ("vitaminId") REFERENCES "Vitamin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pemeriksaan" ADD CONSTRAINT "Pemeriksaan_anakId_fkey" FOREIGN KEY ("anakId") REFERENCES "Anak"("id") ON DELETE CASCADE ON UPDATE CASCADE;
