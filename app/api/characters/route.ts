import { NextRequest, NextResponse } from 'next/server';
import { getAllCharacters, saveCharacter } from '@/lib/fileSystem';
import { Character } from '@/lib/types';

export async function GET() {
  try {
    const characters = getAllCharacters();
    return NextResponse.json(characters);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const character: Character = await request.json();

    // Add timestamps if not present
    if (!character.createdAt) {
      character.createdAt = new Date().toISOString();
    }
    character.updatedAt = new Date().toISOString();

    saveCharacter(character);
    return NextResponse.json(character);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save character' }, { status: 500 });
  }
}
