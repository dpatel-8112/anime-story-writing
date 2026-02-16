import { NextRequest, NextResponse } from 'next/server';
import { getGoal, saveGoal, deleteGoal } from '@/lib/fileSystem';
import { WritingGoal } from '@/lib/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const goal = getGoal(id);

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error getting goal:', error);
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const updates: Partial<WritingGoal> = await request.json();
    const existingGoal = getGoal(id);

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const updatedGoal: WritingGoal = {
      ...existingGoal,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    saveGoal(updatedGoal);

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    deleteGoal(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
