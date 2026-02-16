'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Character } from '@/lib/types';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <p className="text-gray-600 dark:text-gray-400">Loading graph...</p>
    </div>
  ),
});

interface GraphNode {
  id: string;
  name: string;
  role: string;
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  strength: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export default function CharacterRelationshipsPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      const data = await response.json();
      setCharacters(data);
      buildGraphData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load characters:', error);
      setLoading(false);
    }
  };

  const buildGraphData = (chars: Character[]) => {
    const nodes: GraphNode[] = chars.map((char) => ({
      id: char.id,
      name: char.name,
      role: char.role || 'Supporting',
      val: (char.relationships?.length || 0) + 5, // Size based on connections
    }));

    const links: GraphLink[] = [];
    const addedLinks = new Set<string>();

    chars.forEach((char) => {
      char.relationships?.forEach((rel) => {
        // Create a unique key for this relationship
        const linkKey = [char.id, rel.characterId].sort().join('-');

        // Only add if we haven't added this relationship yet (avoid duplicates)
        if (!addedLinks.has(linkKey)) {
          links.push({
            source: char.id,
            target: rel.characterId,
            type: rel.type || 'other',
            strength: rel.strength || 5,
          });
          addedLinks.add(linkKey);
        }
      });
    });

    setGraphData({ nodes, links });
  };

  const getNodeColor = (role: string) => {
    switch (role) {
      case 'Protagonist':
        return '#3b82f6'; // blue
      case 'Antagonist':
        return '#ef4444'; // red
      case 'Supporting':
        return '#10b981'; // green
      case 'Minor':
        return '#6b7280'; // gray
      default:
        return '#8b5cf6'; // purple
    }
  };

  const getLinkColor = (type: string) => {
    switch (type) {
      case 'family':
        return '#f59e0b'; // amber
      case 'friend':
        return '#10b981'; // green
      case 'rival':
        return '#f97316'; // orange
      case 'enemy':
        return '#ef4444'; // red
      case 'romantic':
        return '#ec4899'; // pink
      case 'mentor':
        return '#8b5cf6'; // purple
      default:
        return '#6b7280'; // gray
    }
  };

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node as GraphNode);
  }, []);

  const handleNodeRightClick = useCallback((node: any) => {
    const character = characters.find(c => c.id === node.id);
    if (character) {
      router.push(`/characters/${character.id}`);
    }
  }, [characters, router]);

  const filteredGraphData = {
    nodes: graphData.nodes,
    links: filterType === 'all'
      ? graphData.links
      : graphData.links.filter(link => link.type === filterType),
  };

  const relationshipTypes = [
    { value: 'all', label: 'All Relationships', color: '#6b7280' },
    { value: 'family', label: 'Family', color: '#f59e0b' },
    { value: 'friend', label: 'Friends', color: '#10b981' },
    { value: 'rival', label: 'Rivals', color: '#f97316' },
    { value: 'enemy', label: 'Enemies', color: '#ef4444' },
    { value: 'romantic', label: 'Romantic', color: '#ec4899' },
    { value: 'mentor', label: 'Mentor', color: '#8b5cf6' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading relationships...</p>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/characters')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Character Relationships
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {graphData.nodes.length} characters, {graphData.links.length} relationships
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-2">
            {relationshipTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilterType(type.value)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filterType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Character Roles
          </h3>
          <div className="flex flex-wrap gap-4">
            {[
              { role: 'Protagonist', color: '#3b82f6' },
              { role: 'Antagonist', color: '#ef4444' },
              { role: 'Supporting', color: '#10b981' },
              { role: 'Minor', color: '#6b7280' },
            ].map((item) => (
              <div key={item.role} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.role}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Click a node to see details • Right-click to edit character • Drag nodes to reposition
          </p>
        </div>
      </div>

      {/* Graph Container */}
      {graphData.nodes.length === 0 ? (
        <div className="px-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              No Characters Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create some characters and define their relationships to see the visualization.
            </p>
            <button
              onClick={() => router.push('/characters')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Characters
            </button>
          </div>
        </div>
      ) : (
        <div className="px-6">
          <div className="flex gap-6">
            {/* Graph */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <ForceGraph2D
                graphData={filteredGraphData}
                nodeLabel="name"
                nodeColor={(node: any) => getNodeColor(node.role)}
                nodeVal={(node: any) => node.val}
                linkColor={(link: any) => getLinkColor(link.type)}
                linkWidth={(link: any) => link.strength / 2}
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={2}
                onNodeClick={handleNodeClick}
                onNodeRightClick={handleNodeRightClick}
                height={600}
                backgroundColor="transparent"
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                  const label = node.name;
                  const fontSize = 12 / globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  const textWidth = ctx.measureText(label).width;
                  const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                  // Draw node
                  ctx.fillStyle = getNodeColor(node.role);
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                  ctx.fill();

                  // Draw label background
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                  ctx.fillRect(
                    node.x - bckgDimensions[0] / 2,
                    node.y + node.val + 2,
                    bckgDimensions[0],
                    bckgDimensions[1]
                  );

                  // Draw label text
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = 'white';
                  ctx.fillText(label, node.x, node.y + node.val + 2 + fontSize * 0.5);
                }}
              />
            </div>

            {/* Selected Node Info */}
            {selectedNode && (
              <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {selectedNode.name}
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Role
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">{selectedNode.role}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Relationships
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {graphData.links.filter(
                        l => l.source === selectedNode.id || l.target === selectedNode.id
                      ).length}
                    </p>
                  </div>
                  {characters.find(c => c.id === selectedNode.id)?.relationships?.map((rel, idx) => {
                    const targetChar = characters.find(c => c.id === rel.characterId);
                    return targetChar ? (
                      <div key={idx} className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {targetChar.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                          {rel.type} • Strength: {rel.strength}/10
                        </p>
                        {rel.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {rel.description}
                          </p>
                        )}
                      </div>
                    ) : null;
                  })}
                  <button
                    onClick={() => router.push(`/characters/${selectedNode.id}`)}
                    className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Edit Character
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
