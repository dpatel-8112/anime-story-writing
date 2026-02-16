import { NextRequest, NextResponse } from 'next/server';
import { restoreVersion } from '@/lib/fileSystem';

// POST /api/chapters/[id]/restore - Restore a version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { versionId } = await request.json();

    const chapter = restoreVersion(id, versionId);

    if (!chapter) {
      return NextResponse.json({ error: 'Failed to restore version' }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to restore version' }, { status: 500 });
  }
}
