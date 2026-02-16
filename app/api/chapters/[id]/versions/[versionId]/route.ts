import { NextRequest, NextResponse } from 'next/server';
import { getChapterVersion } from '@/lib/fileSystem';

// GET /api/chapters/[id]/versions/[versionId] - Get specific version
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id, versionId } = await params;
    const version = getChapterVersion(id, versionId);

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    return NextResponse.json(version);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch version' }, { status: 500 });
  }
}
