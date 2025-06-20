import { getDatabase, getDatabaseEntries } from '@/lib/notion';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(req.url);
  const withEntries = url.searchParams.get('entries') === 'true';

  try {
    if (withEntries) {
      const entries = await getDatabaseEntries(id);
      return NextResponse.json({ success: true, data: entries });
    } else {
      const database = await getDatabase(id);
      return NextResponse.json({ success: true, data: database });
    }
  } catch (error) {
    console.error(`Error fetching database ${id}:`, error);
    return NextResponse.json({ success: false, error: "Failed to fetch database data" }, { status: 500 });
  }
}
