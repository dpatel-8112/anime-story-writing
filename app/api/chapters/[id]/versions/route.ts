import { NextRequest, NextResponse } from 'next/server';
import { getChapter } from '@/lib/fileSystem';

// GET /api/chapters/[id]/versions - Get all versions for a chapter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapter = getChapter(id);

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    return NextResponse.json({ versions: chapter.versions || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }
}
