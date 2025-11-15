import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables.");
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface TokenPayload {
  id: string;
  role: "admin";
  iat: number;
  exp: number;
}

export function signToken(payload: Omit<TokenPayload, "iat" | "exp">) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}