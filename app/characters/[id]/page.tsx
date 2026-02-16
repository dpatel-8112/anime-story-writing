'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Plus, X } from 'lucide-react';
import { Character, Relationship } from '@/lib/types';

type TabType = 'profile' | 'development' | 'relationships' | 'appearances';

export default function CharacterEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const [id, setId] = useState<string>('');
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [tagInput, setTagInput] = useState('');
  const [abilityInput, setAbilityInput] = useState('');
  const [aliasInput, setAliasInput] = useState('');

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      if (isNew) {
        // Initialize new character
        const newCharacter: Character = {
          id: p.id,
          name: '',
          description: '',
          appearance: '',
          personality: '',
          abilities: [],
          relationships: [],
          backstory: '',
          role: 'supporting',
          goals: '',
          conflicts: '',
          aliases: [],
          appearances: [],
          arc: [],
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCharacter(newCharacter);
        setLoading(false);
      } else {
        fetchCharacter(p.id);
      }
    });
  }, [isNew]);

  const fetchCharacter = async (characterId: string) => {
    try {
      const response = await fetch(`/api/characters/${characterId}`);
      if (response.ok) {
        const data = await response.json();
        setCharacter(data);
      } else {
        console.error('Character not found');
        router.push('/characters');
      }
    } catch (error) {
      console.error('Failed to load character:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!character || !character.name.trim()) {
      alert('Please enter a character name');
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? '/api/characters' : `/api/characters/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(character),
      });

      if (response.ok) {
        alert('Character saved successfully!');
        if (isNew) {
          router.push('/characters');
        }
      } else {
        alert('Failed to save character');
      }
    } catch (error) {
      console.error('Failed to save character:', error);
      alert('Failed to save character');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/characters');
      } else {
        alert('Failed to delete character');
      }
    } catch (error) {
      console.error('Failed to delete character:', error);
      alert('Failed to delete character');
    }
  };

  const addTag = () => {
    if (!character || !tagInput.trim()) return;
    const tags = character.tags || [];
    if (!tags.includes(tagInput.trim())) {
      setCharacter({ ...character, tags: [...tags, tagInput.trim()] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    if (!character) return;
    setCharacter({ ...character, tags: (character.tags || []).filter(t => t !== tag) });
  };

  const addAbility = () => {
    if (!character || !abilityInput.trim()) return;
    if (!character.abilities.includes(abilityInput.trim())) {
      setCharacter({ ...character, abilities: [...character.abilities, abilityInput.trim()] });
    }
    setAbilityInput('');
  };

  const removeAbility = (ability: string) => {
    if (!character) return;
    setCharacter({ ...character, abilities: character.abilities.filter(a => a !== ability) });
  };

  const addAlias = () => {
    if (!character || !aliasInput.trim()) return;
    const aliases = character.aliases || [];
    if (!aliases.includes(aliasInput.trim())) {
      setCharacter({ ...character, aliases: [...aliases, aliasInput.trim()] });
    }
    setAliasInput('');
  };

  const removeAlias = (alias: string) => {
    if (!character) return;
    setCharacter({ ...character, aliases: (character.aliases || []).filter(a => a !== alias) });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading character...</p>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Character Not Found
        </h1>
        <button
          onClick={() => router.push('/characters')}
          className="text-blue-600 hover:underline"
        >
          Back to Characters
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/characters')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {isNew ? 'New Character' : character.name || 'Unnamed Character'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isNew ? 'Create a new character' : 'Edit character details'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete character"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Character'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          {[
            { id: 'profile' as TabType, label: 'Profile' },
            { id: 'development' as TabType, label: 'Development' },
            { id: 'relationships' as TabType, label: 'Relationships' },
            { id: 'appearances' as TabType, label: 'Appearances' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={character.name}
                    onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Character name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={character.role}
                    onChange={(e) => setCharacter({ ...character, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="Protagonist">Protagonist</option>
                    <option value="Antagonist">Antagonist</option>
                    <option value="Supporting">Supporting</option>
                    <option value="Minor">Minor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={character.age || ''}
                    onChange={(e) => setCharacter({ ...character, age: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Power Level
                  </label>
                  <input
                    type="number"
                    value={character.powerLevel || ''}
                    onChange={(e) => setCharacter({ ...character, powerLevel: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Power level"
                  />
                </div>
              </div>

              {/* Aliases */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aliases
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlias())}
                    placeholder="Add an alias..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={addAlias}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(character.aliases || []).map((alias, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm flex items-center gap-2"
                    >
                      {alias}
                      <button
                        onClick={() => removeAlias(alias)}
                        className="hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={character.description}
                  onChange={(e) => setCharacter({ ...character, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  rows={3}
                  placeholder="Brief description of the character"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Appearance
                </label>
                <textarea
                  value={character.appearance}
                  onChange={(e) => setCharacter({ ...character, appearance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  rows={3}
                  placeholder="Physical appearance, clothing, distinctive features..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Personality
                </label>
                <textarea
                  value={character.personality}
                  onChange={(e) => setCharacter({ ...character, personality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  rows={3}
                  placeholder="Personality traits, quirks, mannerisms..."
                />
              </div>

              {/* Abilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Abilities
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={abilityInput}
                    onChange={(e) => setAbilityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAbility())}
                    placeholder="Add an ability..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={addAbility}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {character.abilities.map((ability, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm flex items-center gap-2"
                    >
                      {ability}
                      <button
                        onClick={() => removeAbility(ability)}
                        className="hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(character.tags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Development Tab */}
        {activeTab === 'development' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Character Development
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backstory
                </label>
                <textarea
                  value={character.backstory}
                  onChange={(e) => setCharacter({ ...character, backstory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  rows={5}
                  placeholder="Character's history, origins, and past events that shaped them..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goals & Motivations
                </label>
                <textarea
                  value={character.goals}
                  onChange={(e) => setCharacter({ ...character, goals: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  rows={4}
                  placeholder="What does this character want? What drives them?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Conflicts & Challenges
                </label>
                <textarea
                  value={character.conflicts}
                  onChange={(e) => setCharacter({ ...character, conflicts: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  rows={4}
                  placeholder="Internal and external conflicts, obstacles, fears..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Relationships Tab */}
        {activeTab === 'relationships' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Relationships
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {character.relationships.length === 0
                ? 'No relationships defined yet. This feature will be enhanced in future updates.'
                : `${character.relationships.length} relationship(s)`}
            </p>
            {character.relationships.length > 0 && (
              <div className="space-y-2">
                {character.relationships.map((rel, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="font-medium">Relationship #{idx + 1}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Type: {rel.type || 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appearances Tab */}
        {activeTab === 'appearances' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Chapter Appearances
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {character.appearances && character.appearances.length > 0
                ? `This character appears in ${character.appearances.length} chapter(s).`
                : 'This character hasn\'t appeared in any chapters yet. Mention them using @charactername in your chapters to track appearances.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
