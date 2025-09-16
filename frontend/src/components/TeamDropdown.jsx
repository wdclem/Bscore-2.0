'use client';

import { useState, useEffect } from 'react';
import { getLeagueTeams } from '@/lib/apiClient';

export default function TeamDropdown({ leagueCode, onTeamSelect, selectedTeam }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await getLeagueTeams(leagueCode);
        setTeams(data);
      } catch (error) {
        console.error('Failed to load teams:', error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    if (leagueCode) {
      loadTeams();
    }
  }, [leagueCode]);

  const handleTeamSelect = (team) => {
    onTeamSelect(team);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="text-gray-500">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-900 font-medium">
            {selectedTeam || 'All Teams'}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <button
              onClick={() => handleTeamSelect(null)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center justify-between transition-colors ${
                !selectedTeam ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
              }`}
            >
              <span>All Teams</span>
              {!selectedTeam && (
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team.name)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center justify-between transition-colors ${
                  selectedTeam === team.name ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {team.logoUrl && (
                    <img 
                      src={team.logoUrl} 
                      alt={team.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <span>{team.name}</span>
                </div>
                {selectedTeam === team.name && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

