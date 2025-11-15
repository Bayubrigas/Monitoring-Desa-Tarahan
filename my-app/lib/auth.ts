import jwt from "jsonwebtoken";

// Pastikan JWT_SECRET tersedia di environment
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables.");
}

const JWT_SECRET = process.env.JWT_SECRET;

// Tipe payload token yang valid
export interface TokenPayload {
  id: string;
  role: "admin" | "user"; // sesuaikan dengan kebutuhan Anda
  iat: number; // issued at (otomatis dari jwt)
  exp: number; // expiration (otomatis dari jwt)
}

export function signToken(payload: Omit<TokenPayload, "iat" | "exp">) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}