import { NextRequest, NextResponse } from 'next/server';
import { getChapter, saveChapter, saveChapterWithVersion, deleteChapter } from '@/lib/fileSystem';
import { Chapter } from '@/lib/types';

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

    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chapter' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if this is a structured request with version flag
    let chapter: Chapter;
    let createVersion = false;
    let versionNote: string | undefined;

    if (body.chapter) {
      // New format: { chapter, createVersion, versionNote }
      chapter = body.chapter;
      createVersion = body.createVersion || false;
      versionNote = body.versionNote;
    } else {
      // Legacy format: just the chapter object
      chapter = body;
    }

    if (chapter.id !== id) {
      return NextResponse.json({ error: 'ID mismatch' }, { status: 400 });
    }

    saveChapterWithVersion(chapter, createVersion, versionNote);
    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteChapter(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
