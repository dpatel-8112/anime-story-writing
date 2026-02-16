import { NextRequest, NextResponse } from 'next/server';
import { getWorldElement, saveWorldElement, deleteWorldElement } from '@/lib/fileSystem';
import { WorldElement } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const element = getWorldElement(id);

    if (!element) {
      return NextResponse.json({ error: 'World element not found' }, { status: 404 });
    }

    return NextResponse.json(element);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch world element' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data: Partial<WorldElement> = await request.json();
    const existing = getWorldElement(id);

    if (!existing) {
      return NextResponse.json({ error: 'World element not found' }, { status: 404 });
    }

    const updatedElement: WorldElement = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    saveWorldElement(updatedElement);
    return NextResponse.json(updatedElement);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update world element' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = getWorldElement(id);

    if (!existing) {
      return NextResponse.json({ error: 'World element not found' }, { status: 404 });
    }

    deleteWorldElement(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete world element' }, { status: 500 });
  }
}
