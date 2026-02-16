'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Target, Calendar, TrendingUp, Check, X } from 'lucide-react';
import { WritingGoal } from '@/lib/types';

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<WritingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<WritingGoal>>({
    type: 'word-count',
    period: 'daily',
    status: 'active',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      const data = await response.json();
      setGoals(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load goals:', error);
      setLoading(false);
    }
  };

  const createGoal = async () => {
    if (!newGoal.title || !newGoal.target) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newGoal,
          current: 0,
          startDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        await fetchGoals();
        setShowNewGoalForm(false);
        setNewGoal({
          type: 'word-count',
          period: 'daily',
          status: 'active',
        });
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create goal');
    }
  };

  const updateGoalProgress = async (goalId: string, current: number) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current }),
      });

      if (response.ok) {
        await fetchGoals();
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchGoals();
      }
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const completeGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.ok) {
        await fetchGoals();
      }
    } catch (error) {
      console.error('Failed to complete goal:', error);
    }
  };

  const getProgressPercentage = (goal: WritingGoal) => {
    if (!goal.target) return 0;
    return Math.min(Math.round((goal.current / goal.target) * 100), 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'word-count':
        return <Target size={24} />;
      case 'chapter-count':
        return <Calendar size={24} />;
      case 'custom':
        return <TrendingUp size={24} />;
      default:
        return <Target size={24} />;
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Writing Goals
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your progress and stay motivated
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNewGoalForm(!showNewGoalForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Goal
        </button>
      </div>

      {/* New Goal Form */}
      {showNewGoalForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Create New Goal</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Goal Title</label>
              <input
                type="text"
                value={newGoal.title || ''}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Write 1000 words daily"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as WritingGoal['type'] })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="word-count">Word Count</option>
                  <option value="chapter-count">Chapter Count</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Period</label>
                <select
                  value={newGoal.period}
                  onChange={(e) => setNewGoal({ ...newGoal, period: e.target.value as WritingGoal['period'] })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="one-time">One Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target</label>
                <input
                  type="number"
                  value={newGoal.target || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (optional)</label>
              <textarea
                value={newGoal.description || ''}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={2}
                placeholder="Additional details about this goal..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={createGoal}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check size={18} />
                Create Goal
              </button>
              <button
                onClick={() => setShowNewGoalForm(false)}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Active Goals</h2>
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const percentage = getProgressPercentage(goal);
              const progressColor = getProgressColor(percentage);

              return (
                <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        {getGoalIcon(goal.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                          {goal.title}
                        </h3>
                        {goal.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {goal.description}
                          </p>
                        )}
                        <div className="flex gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="capitalize">{goal.type.replace('-', ' ')}</span>
                          <span>•</span>
                          <span className="capitalize">{goal.period}</span>
                          <span>•</span>
                          <span>Started {new Date(goal.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => completeGoal(goal.id)}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                        title="Mark as complete"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                        title="Delete goal"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {goal.current} / {goal.target}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`${progressColor} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Update Progress */}
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      value={goal.current}
                      onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value) || 0)}
                      className="w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Current progress
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Completed Goals</h2>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-green-50 dark:bg-green-900/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg text-green-600 dark:text-green-400">
                    <Check size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{goal.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.current} / {goal.target} • Completed {new Date(goal.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <Target className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            No Goals Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create writing goals to track your progress and stay motivated.
          </p>
          <button
            onClick={() => setShowNewGoalForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
}
