// app/api/fingerprint/route.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const pem = fs.readFileSync(path.resolve("certs/server.pem"), "utf-8");
    // Remove the header and footer lines and decode the base64 content
  const der = Buffer.from(
    pem.replace(/-----(BEGIN|END)[\w\s]+-----/g, "").replace(/\s+/g, ""),
    "base64"
  );
  const fingerprint = crypto.createHash("sha256").update(der).digest("hex");
  return NextResponse.json({ fingerprint });
}