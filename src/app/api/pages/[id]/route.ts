import { getPage } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const page = await getPage(id);
    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error(`Error fetching page ${id}:`, error);
    return NextResponse.json({ success: false, error: "Failed to fetch page" }, { status: 500 });
  }
}
