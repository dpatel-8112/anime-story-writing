'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Users } from 'lucide-react';
import { Character } from '@/lib/types';

export default function CharactersPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      const data = await response.json();
      setCharacters(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load characters:', error);
      setLoading(false);
    }
  };

  const createNewCharacter = () => {
    const newId = `char-${Date.now()}`;
    router.push(`/characters/${newId}?new=true`);
  };

  const filteredCharacters = characters.filter(character => {
    const matchesSearch =
      character.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    const matchesRole = roleFilter === 'all' || character.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'Protagonist':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'Antagonist':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'Supporting':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Minor':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
    }
  };

  const uniqueRoles = Array.from(new Set(characters.map(c => c.role).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading characters...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Characters
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {characters.length} character{characters.length !== 1 ? 's' : ''} in your story
          </p>
        </div>
        <button
          onClick={createNewCharacter}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          New Character
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
              placeholder="Search characters..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
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

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push('/characters/relationships')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Users size={18} />
          Relationship Graph
        </button>
      </div>

      {/* Characters Grid/List */}
      {filteredCharacters.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery || roleFilter !== 'all' ? 'No characters found' : 'No characters yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || roleFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start building your cast by creating your first character'}
          </p>
          {!searchQuery && roleFilter === 'all' && (
            <button
              onClick={createNewCharacter}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Create First Character
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharacters.map((character) => (
            <button
              key={character.id}
              onClick={() => router.push(`/characters/${character.id}`)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {character.name}
                  </h3>
                  {character.aliases && character.aliases.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      aka {character.aliases.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {character.role && (
                <div className="mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(character.role)}`}>
                    {character.role}
                  </span>
                </div>
              )}

              {character.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                  {character.description}
                </p>
              )}

              <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                <div>
                  <span className="font-semibold">{character.relationships?.length || 0}</span> relationships
                </div>
                <div>
                  <span className="font-semibold">{character.appearances?.length || 0}</span> appearances
                </div>
              </div>

              {character.tags && character.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {character.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {character.tags.length > 3 && (
                    <span className="text-xs px-2 py-0.5 text-gray-500">
                      +{character.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCharacters.map((character) => (
            <button
              key={character.id}
              onClick={() => router.push(`/characters/${character.id}`)}
              className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {character.name}
                    </h3>
                    {character.role && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(character.role)}`}>
                        {character.role}
                      </span>
                    )}
                  </div>
                  {character.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                      {character.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400 ml-4">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {character.relationships?.length || 0}
                    </div>
                    <div className="text-xs">relationships</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {character.appearances?.length || 0}
                    </div>
                    <div className="text-xs">appearances</div>
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
