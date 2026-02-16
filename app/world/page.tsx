'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Map, Building2, Package, Lightbulb } from 'lucide-react';
import { WorldElement } from '@/lib/types';

type WorldType = 'all' | 'location' | 'organization' | 'item' | 'concept';

export default function WorldPage() {
  const router = useRouter();
  const [worldElements, setWorldElements] = useState<WorldElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<WorldType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchWorldElements();
  }, []);

  const fetchWorldElements = async () => {
    try {
      const response = await fetch('/api/world');
      const data = await response.json();
      setWorldElements(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load world elements:', error);
      setLoading(false);
    }
  };

  const createNewElement = () => {
    const newId = `world-${Date.now()}`;
    router.push(`/world/${newId}?new=true`);
  };

  const filteredElements = worldElements.filter(element => {
    const matchesSearch =
      element.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      element.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    const matchesType = typeFilter === 'all' || element.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'location':
        return <Map size={18} />;
      case 'organization':
        return <Building2 size={18} />;
      case 'item':
        return <Package size={18} />;
      case 'concept':
        return <Lightbulb size={18} />;
      default:
        return <Map size={18} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'location':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'organization':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'item':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'concept':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const groupedByType = {
    location: filteredElements.filter(e => e.type === 'location'),
    organization: filteredElements.filter(e => e.type === 'organization'),
    item: filteredElements.filter(e => e.type === 'item'),
    concept: filteredElements.filter(e => e.type === 'concept'),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading world elements...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            World Building
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {worldElements.length} element{worldElements.length !== 1 ? 's' : ''} in your world
          </p>
        </div>
        <button
          onClick={createNewElement}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          New Element
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search world elements..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as WorldType)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">All Types</option>
            <option value="location">Locations</option>
            <option value="organization">Organizations</option>
            <option value="item">Items</option>
            <option value="concept">Concepts</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Type Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { type: 'location', label: 'Locations', icon: Map, count: groupedByType.location.length },
          { type: 'organization', label: 'Organizations', icon: Building2, count: groupedByType.organization.length },
          { type: 'item', label: 'Items', icon: Package, count: groupedByType.item.length },
          { type: 'concept', label: 'Concepts', icon: Lightbulb, count: groupedByType.concept.length },
        ].map((stat) => (
          <button
            key={stat.type}
            onClick={() => setTypeFilter(stat.type as WorldType)}
            className={`p-4 rounded-lg transition-colors ${
              typeFilter === stat.type
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={20} />
              <span className="font-medium">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.count}</div>
          </button>
        ))}
      </div>

      {/* World Elements Grid/List */}
      {filteredElements.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <Map className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery || typeFilter !== 'all' ? 'No elements found' : 'No world elements yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || typeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start building your world by creating locations, organizations, items, and concepts'}
          </p>
          {!searchQuery && typeFilter === 'all' && (
            <button
              onClick={createNewElement}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Create First Element
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredElements.map((element) => (
            <button
              key={element.id}
              onClick={() => router.push(`/world/${element.id}`)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(element.type)}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {element.name}
                    </h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(element.type)}`}>
                    {element.type}
                  </span>
                </div>
              </div>

              {element.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                  {element.description}
                </p>
              )}

              {element.significance && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Significance: <span className="font-medium">{element.significance}</span>
                </div>
              )}

              <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                <div>
                  <span className="font-semibold">{element.relatedCharacters?.length || 0}</span> characters
                </div>
                <div>
                  <span className="font-semibold">{element.relatedChapters?.length || 0}</span> chapters
                </div>
              </div>

              {element.tags && element.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {element.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {element.tags.length > 3 && (
                    <span className="text-xs px-2 py-0.5 text-gray-500">
                      +{element.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredElements.map((element) => (
            <button
              key={element.id}
              onClick={() => router.push(`/world/${element.id}`)}
              className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(element.type)}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {element.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(element.type)}`}>
                      {element.type}
                    </span>
                  </div>
                  {element.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                      {element.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400 ml-4">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {element.relatedCharacters?.length || 0}
                    </div>
                    <div className="text-xs">characters</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {element.relatedChapters?.length || 0}
                    </div>
                    <div className="text-xs">chapters</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
