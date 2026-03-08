import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Argument Analyzer API working",
    status: "ok"
  });
}
