import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TODO: replace with your DB query
    const vendors = [
      {
        id: "1",
        name: "Vendor One",
        logo: "/placeholder.jpg",
      },
      {
        id: "2",
        name: "Vendor Two",
        logo: "/placeholder.jpg",
      },
    ];

    return NextResponse.json(vendors);
  } catch (err) {
    console.error("VENDOR API ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
