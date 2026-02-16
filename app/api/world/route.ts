import { NextRequest, NextResponse } from 'next/server';
import { getAllWorldElements, saveWorldElement } from '@/lib/fileSystem';
import { WorldElement } from '@/lib/types';

export async function GET() {
  try {
    const elements = getAllWorldElements();
    return NextResponse.json(elements);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch world elements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const element: WorldElement = await request.json();

    // Add timestamps if not present
    if (!element.createdAt) {
      element.createdAt = new Date().toISOString();
    }
    element.updatedAt = new Date().toISOString();

    saveWorldElement(element);
    return NextResponse.json(element);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save world element' }, { status: 500 });
  }
}
