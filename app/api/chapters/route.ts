import { NextRequest, NextResponse } from 'next/server';
import { getAllChapters, saveChapter } from '@/lib/fileSystem';
import { Chapter } from '@/lib/types';

export async function GET() {
  try {
    const chapters = getAllChapters();
    return NextResponse.json(chapters);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const chapter: Chapter = await request.json();
    saveChapter(chapter);
    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save chapter' }, { status: 500 });
  }
}
