import { listDatabases } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databases = await listDatabases();
    return NextResponse.json({ success: true, data: databases });
  } catch (error) {
    console.error("Error in fetchDatabases:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch databases" }, { status: 500 });
  }
}
