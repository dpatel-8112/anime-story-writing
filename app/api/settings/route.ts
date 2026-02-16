import { NextRequest, NextResponse } from 'next/server';
import { getMetadata, saveMetadata } from '@/lib/fileSystem';
import { StoryMetadata } from '@/lib/types';

export async function GET() {
  try {
    const metadata = getMetadata();
    return NextResponse.json(metadata);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: Partial<StoryMetadata> = await request.json();
    const currentMetadata = getMetadata();

    // Merge with current metadata, preserving system fields
    const updatedMetadata: StoryMetadata = {
      ...currentMetadata,
      ...data,
      updatedAt: new Date().toISOString(),
      // Preserve these fields from automatic updates
      totalChapters: currentMetadata.totalChapters,
      totalWordCount: currentMetadata.totalWordCount,
    };

    saveMetadata(updatedMetadata);
    return NextResponse.json(updatedMetadata);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
