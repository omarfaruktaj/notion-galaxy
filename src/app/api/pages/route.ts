import { listPages } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pages = await listPages();
    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error("Error in fetchPages:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch pages" }, { status: 500 });
  }
}
