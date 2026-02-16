'use client';

import { useEffect, useState } from 'react';
import { PlotPoint } from '@/lib/types';
import { Target, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export default function PlanningPage() {
  const [plotPoints, setPlotPoints] = useState<PlotPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PlotPoint | null>(null);

  useEffect(() => {
    loadPlotPoints();
  }, []);

  const loadPlotPoints = () => {
    const saved = localStorage.getItem('plotPoints');
    if (saved) {
      setPlotPoints(JSON.parse(saved));
    }
    setLoading(false);
  };

  const savePlotPoints = (points: PlotPoint[]) => {
    localStorage.setItem('plotPoints', JSON.stringify(points));
    setPlotPoints(points);
  };

  const addPlotPoint = () => {
    const newPoint: PlotPoint = {
      id: `plot-${Date.now()}`,
      title: '',
      description: '',
      type: 'setup',
      completed: false,
    };
    setEditingPoint(newPoint);
    setShowForm(true);
  };

  const editPlotPoint = (point: PlotPoint) => {
    setEditingPoint({ ...point });
    setShowForm(true);
  };

  const deletePlotPoint = (id: string) => {
    if (confirm('Are you sure you want to delete this plot point?')) {
      const updated = plotPoints.filter(p => p.id !== id);
      savePlotPoints(updated);
    }
  };

  const toggleComplete = (id: string) => {
    const updated = plotPoints.map(p =>
      p.id === id ? { ...p, completed: !p.completed } : p
    );
    savePlotPoints(updated);
  };

  const handleSave = () => {
    if (!editingPoint || !editingPoint.title.trim()) {
      alert('Please enter a title');
      return;
    }

    const existingIndex = plotPoints.findIndex(p => p.id === editingPoint.id);
    let updated: PlotPoint[];

    if (existingIndex >= 0) {
      updated = [...plotPoints];
      updated[existingIndex] = editingPoint;
    } else {
      updated = [...plotPoints, editingPoint];
    }

    savePlotPoints(updated);
    setShowForm(false);
    setEditingPoint(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPoint(null);
  };

  const getTypeColor = (type: PlotPoint['type']) => {
    switch (type) {
      case 'setup': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'conflict': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'climax': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'resolution': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const pointsByType = {
    setup: plotPoints.filter(p => p.type === 'setup'),
    conflict: plotPoints.filter(p => p.type === 'conflict'),
    climax: plotPoints.filter(p => p.type === 'climax'),
    resolution: plotPoints.filter(p => p.type === 'resolution'),
  };

  const completedCount = plotPoints.filter(p => p.completed).length;
  const totalCount = plotPoints.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Target className="text-blue-600" />
            Story Planning
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Plan your story arc with plot points and key moments
          </p>
        </div>
        <button
          onClick={addPlotPoint}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Add Plot Point
        </button>
      </div>

      {/* Progress */}
      {totalCount > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">Progress</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {completedCount} / {totalCount} completed
            </span>
          </div>
        </div>
      )}

      {/* Plot Point Form */}
      {showForm && editingPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              {plotPoints.find(p => p.id === editingPoint.id) ? 'Edit' : 'New'} Plot Point
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={editingPoint.title}
                  onChange={(e) => setEditingPoint({ ...editingPoint, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Plot point title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={editingPoint.type}
                  onChange={(e) => setEditingPoint({ ...editingPoint, type: e.target.value as PlotPoint['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="setup">Setup</option>
                  <option value="conflict">Conflict</option>
                  <option value="climax">Climax</option>
                  <option value="resolution">Resolution</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editingPoint.description}
                  onChange={(e) => setEditingPoint({ ...editingPoint, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  rows={5}
                  placeholder="Describe this plot point..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plot Points by Type */}
      {plotPoints.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <Target size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">No Plot Points Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start planning your story by adding plot points for key moments in your narrative.
          </p>
          <button
            onClick={addPlotPoint}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add First Plot Point
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(pointsByType).map(([type, points]) => (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 capitalize flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${getTypeColor(type as PlotPoint['type'])}`}>
                  {type}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">({points.length})</span>
              </h3>

              {points.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No {type} points yet
                </p>
              ) : (
                <div className="space-y-3">
                  {points.map((point) => (
                    <div
                      key={point.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1">
                          <button
                            onClick={() => toggleComplete(point.id)}
                            className="mt-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            {point.completed ? (
                              <CheckCircle2 size={20} className="text-green-600" />
                            ) : (
                              <Circle size={20} />
                            )}
                          </button>
                          <div className="flex-1">
                            <h4 className={`font-bold ${point.completed ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                              {point.title}
                            </h4>
                            {point.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {point.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => editPlotPoint(point)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deletePlotPoint(point.id)}
                          className="text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
