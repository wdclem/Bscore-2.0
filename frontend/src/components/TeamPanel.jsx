'use client';

import { useState, useEffect } from 'react';
import { getLeagueTeams } from '@/lib/apiClient';

export default function TeamPanel({ leagueCode, onTeamSelect, selectedTeam, isOpen, onClose }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        const data = await getLeagueTeams(leagueCode);
        setTeams(data);
      } catch (error) {
        console.error('Failed to load teams:', error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    if (leagueCode && isOpen) {
      loadTeams();
    }
  }, [leagueCode, isOpen]);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTeamSelect = (team) => {
    onTeamSelect(team);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Select Team</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* All Teams Option */}
          <button
            onClick={() => handleTeamSelect(null)}
            className={`w-full p-3 rounded-lg text-left mb-2 transition-colors ${
              !selectedTeam 
                ? 'bg-blue-100 text-blue-900 border-2 border-blue-300' 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                🏆
              </div>
              <span className="font-medium">All Teams</span>
            </div>
          </button>

          {/* Teams List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading teams...</div>
            ) : (
              filteredTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team.name)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedTeam === team.name
                      ? 'bg-blue-100 text-blue-900 border-2 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    {team.logoUrl ? (
                      <img 
                        src={team.logoUrl} 
                        alt={team.name}
                        className="w-8 h-8 object-contain mr-3"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        ⚽
                      </div>
                    )}
                    <span className="font-medium">{team.name}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {filteredTeams.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No teams found
            </div>
          )}
        </div>
      </div>
    </>
  );
}
