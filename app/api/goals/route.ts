import { NextRequest, NextResponse } from 'next/server';
import { getAllGoals, saveGoal } from '@/lib/fileSystem';
import { WritingGoal } from '@/lib/types';

export async function GET() {
  try {
    const goals = getAllGoals();
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error getting goals:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const goal: WritingGoal = await request.json();

    if (!goal.id) {
      goal.id = `goal-${Date.now()}`;
    }

    if (!goal.createdAt) {
      goal.createdAt = new Date().toISOString();
    }

    goal.updatedAt = new Date().toISOString();

    saveGoal(goal);

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error saving goal:', error);
    return NextResponse.json({ error: 'Failed to save goal' }, { status: 500 });
  }
}
