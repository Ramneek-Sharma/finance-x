import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { io } from 'socket.io-client';

const LiveLeaderboard = ({ isCompact = false }) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [selectedTab, setSelectedTab] = useState('city');
  const [loading, setLoading] = useState(true);      // for first load only
  const [tabLoading, setTabLoading] = useState(false); // for switching tabs
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const socketRef = useRef(null);
  const mountedRef = useRef(false);

  const mockLeaderboardData = [
    // ...your mock data here (same as before)
  ];
  const mockUserRank = { cityRank: 4, globalRank: 156, currentScore: 82, streak: 5 };

  const loadMockData = useCallback(() => {
    const sortedData = [...mockLeaderboardData].sort((a, b) => b.averageScore - a.averageScore);
    setLeaderboard(sortedData);
    setUserRank(mockUserRank);
    setLoading(false);
    setTabLoading(false);
  }, []);

  // Connect socket ONCE on first mount
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (!user?.profile) {
      loadMockData();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const socket = io('http://localhost:5001', {
        timeout: 5000,
        transports: ['websocket']
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsLive(true);
        // join initial room using current tab
        socket.emit('join-leaderboard', {
          city: user?.profile?.city || 'Bangalore',
          type: selectedTab
        });
      });

      socket.on('leaderboard-update', (data) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
          setTabLoading(false);
          return;
        }
        setLeaderboard(data);
        setLoading(false);
        setTabLoading(false);
        const userEntry = data.find(entry => entry.userId._id === user?.id);
        setUserRank(userEntry?.rank || mockUserRank);
      });

      socket.on('score-update', (data) => {
        if (data.userId === user?.id) {
          setUserRank(prev => ({ ...prev, currentScore: data.newScore }));
        }
      });

      socket.on('connect_error', () => {
        setIsLive(false);
        loadMockData();
      });

      return () => {
        socket.disconnect();
      };
    } catch (err) {
      setIsLive(false);
      loadMockData();
    }
  }, [user, selectedTab, loadMockData]);

  // On tab change just emit new join-leaderboard, don’t reconnect
  useEffect(() => {
    if (socketRef.current && isLive) {
      setTabLoading(true);
      socketRef.current.emit('join-leaderboard', {
        city: user?.profile?.city || 'Bangalore',
        type: selectedTab
      });
    }
  }, [selectedTab, isLive, user]);

  const getRankBadge = (rank) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  const getScoreColor = (s) => s >= 90 ? 'text-green-600' : s >= 80 ? 'text-blue-600' : s >= 70 ? 'text-yellow-600' : s >= 60 ? 'text-orange-600' : 'text-red-600';
  const formatStreak = (s) => s >= 14 ? `${s}🔥🔥` : s >= 7 ? `${s}🔥` : s >= 3 ? `${s}⚡` : `${s}`;
  const getAchievementIcon = (a) => (!a?.length) ? null : a.length >= 3 ? '🏆' : a.length >= 2 ? '🏅' : '⭐';

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md ${isCompact ? 'p-4' : 'p-6'}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${isCompact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`font-bold text-gray-900 ${isCompact ? 'text-lg' : 'text-2xl'}`}>🏆 Live Leaderboard</h2>
        {!isCompact && (
          <div className="flex space-x-2 items-center">
            <button onClick={() => setSelectedTab('city')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedTab === 'city' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              🏙️ City
            </button>
            <button onClick={() => setSelectedTab('global')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedTab === 'global' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              🌍 Global
            </button>
            {tabLoading && (
              <span className="ml-2 animate-spin inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full" />
            )}
          </div>
        )}
      </div>

      {/* Your Rank */}
      {userRank && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-blue-900 font-medium">Your Current Rank:</span>
              <div className="text-sm text-blue-700 mt-1">
                {user?.profile?.city || 'Bangalore'} • {user?.profile?.status || 'Student'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getRankBadge(userRank.cityRank)}</span>
              <div>
                <div className="text-xl font-bold text-blue-900">{userRank.currentScore}</div>
                <div className="text-xs text-blue-600">{formatStreak(userRank.streak)} streak</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600">{isLive ? 'Live Updates' : 'Demo Mode'}</span>
        </div>
        <div className="text-xs text-gray-500">{leaderboard.length} {isLive ? 'active users' : 'demo users'}</div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
          ⚠️ Using demo data. {error}
        </div>
      )}

      {/* Leaderboard list */}
      <div className={`space-y-3 overflow-y-auto ${isCompact ? 'max-h-64' : 'max-h-96'}`} style={{ willChange: 'transform' }}>
        {leaderboard.slice(0, isCompact ? 8 : 50).map((entry, index) => (
          <div key={entry._id}
            className={`flex items-center justify-between rounded-lg border transition-all hover:shadow-md ${isCompact ? 'p-2' : 'p-3'} ${entry.userId._id === user?.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <div className={`text-center ${isCompact ? 'w-8' : 'w-12'}`}>
                <span className={`font-bold ${index < 3 ? (isCompact ? 'text-lg' : 'text-2xl') : isCompact ? 'text-sm' : 'text-lg'}`}>
                  {getRankBadge(index + 1)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-gray-900 truncate ${isCompact ? 'text-sm' : 'text-base'}`}>
                  {entry.userId.profile.name}
                  {entry.userId._id === user?.id && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">You</span>
                  )}
                </div>
                <div className={`text-gray-500 flex items-center space-x-2 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  <span>{entry.userId.profile.city}</span><span>•</span>
                  <span className="capitalize">{entry.userId.profile.status}</span>
                  {entry.achievements?.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-600">{getAchievementIcon(entry.achievements)} {entry.achievements.length}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${getScoreColor(entry.averageScore)} ${isCompact ? 'text-sm' : 'text-lg'}`}>{entry.averageScore}</div>
              <div className="text-gray-500 flex items-center space-x-1 text-xs">
                <span>{formatStreak(entry.streaks?.currentStreak || 0)}</span>
                {entry.currentScore !== entry.averageScore && (
                  <>
                    <span>•</span>
                    <span className={entry.currentScore > entry.averageScore ? 'text-green-600' : 'text-red-600'}>
                      {entry.currentScore > entry.averageScore ? '+' : ''}{entry.currentScore - entry.averageScore}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveLeaderboard;
