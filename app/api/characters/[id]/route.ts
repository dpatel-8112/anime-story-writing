import { NextRequest, NextResponse } from 'next/server';
import { getCharacter, saveCharacter, deleteCharacter } from '@/lib/fileSystem';
import { Character } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const character = getCharacter(id);

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    return NextResponse.json(character);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch character' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data: Partial<Character> = await request.json();
    const existing = getCharacter(id);

    if (!existing) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const updatedCharacter: Character = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    saveCharacter(updatedCharacter);
    return NextResponse.json(updatedCharacter);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = getCharacter(id);

    if (!existing) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    deleteCharacter(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}
