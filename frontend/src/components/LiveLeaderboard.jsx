// frontend/src/components/LiveLeaderboard.jsx
import { useEffect, useRef, useState, useMemo } from 'react';
import { io } from 'socket.io-client';

export default function LiveLeaderboard({
  city = 'abc',
  currentUserId,        // optional
  currentUserEmail,     // optional
  variant = 'full',     // 'full' | 'compact'
  className = ''
}) {
  const socketRef = useRef(null);
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState('city'); // 'city' | 'global'
  const [switching, setSwitching] = useState(false);

  const isCurrentUser = useMemo(() => {
    return (e) => {
      if (currentUserId && e.userId) {
        try { return String(e.userId) === String(currentUserId); } catch { /* noop */ }
      }
      if (currentUserEmail && e.email) {
        try { return e.email?.toLowerCase() === currentUserEmail.toLowerCase(); } catch { /* noop */ }
      }
      return false;
    };
  }, [currentUserId, currentUserEmail]);

  // Create the socket once
  useEffect(() => {
    if (socketRef.current) return;

    const socket = io('http://localhost:5001', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      const joinedCity = tab === 'city' ? city : 'all';
      socket.emit('join-leaderboard', { city: joinedCity, type: tab });
    });

    socket.on('leaderboard-update', (payload) => {
      if (payload && Array.isArray(payload.entries) && payload.entries.length) {
        setEntries(payload.entries);
        setSwitching(false);

        requestAnimationFrame(() => {
          document.querySelectorAll('.leader-row').forEach((el) => {
            el.classList.remove('leader-row-updated');
            requestAnimationFrame(() => {
              el.classList.add('leader-row-updated');
              setTimeout(() => el.classList.remove('leader-row-updated'), 220);
            });
          });
        });
      }
    });

    socket.on('connect_error', () => {
      setSwitching(false);
    });
  }, [city, tab]);

  // Rejoin on tab/city change (no reconnect)
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !s.connected) return;
    setSwitching(true);
    const joinedCity = tab === 'city' ? city : 'all';
    s.emit('join-leaderboard', { city: joinedCity, type: tab });
  }, [tab, city]);

  const isCompact = variant === 'compact';

  return (
    <div className={`rounded-lg border border-gray-100 bg-white p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Live Leaderboard</div>

        {/* Segmented control */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded bg-gray-100 p-0.5">
            <button
              onClick={() => setTab('city')}
              className={`px-3 py-1 text-xs rounded ${tab === 'city' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
            >
              City
            </button>
            <button
              onClick={() => setTab('global')}
              className={`px-3 py-1 text-xs rounded ${tab === 'global' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
            >
              Global
            </button>
          </div>

          {switching && (
            <span className="ml-1.5 inline-block h-3 w-3 animate-spin border border-gray-300 border-t-transparent rounded-full" />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="mt-3 rounded-md border border-gray-100">
        {/* Header */}
        {isCompact ? (
          <div className="grid grid-cols-[80px_minmax(200px,1fr)] items-center gap-3 px-4 py-2 text-[11px] font-medium text-gray-500">
            <span>Rank</span>
            <span>Name</span>
          </div>
        ) : (
          <div className="grid grid-cols-[72px_minmax(160px,1fr)_minmax(110px,180px)_96px] items-center gap-3 px-4 py-2 text-[11px] font-medium text-gray-500">
            <span>Rank</span>
            <span>Name</span>
            <span className="text-right">City</span>
            <span className="text-right">Score</span>
          </div>
        )}

        {/* Rows */}
        {entries.length === 0 ? (
          <div className="p-3 text-xs text-gray-500">No leaderboard data yet. Using demo mode…</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {entries.map((e) => {
              const highlight = isCurrentUser(e);

              if (isCompact) {
                return (
                  <li
                    key={e.userId}
                    className={[
                      'leader-row grid grid-cols-[80px_minmax(200px,1fr)] items-center gap-3 px-4 py-2.5',
                      highlight ? 'bg-indigo-50/60' : ''
                    ].join(' ')}
                  >
                    <span className="text-gray-600 tabular-nums">#{e.rank}</span>
                    <span className={highlight ? 'truncate font-semibold text-indigo-700' : 'truncate font-medium text-gray-900'}>
                      {e.name || '—'}
                      {highlight && (
                        <span className="ml-2 inline-block rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 align-middle">
                          You
                        </span>
                      )}
                    </span>
                  </li>
                );
              }

              // Full variant
              return (
                <li
                  key={e.userId}
                  className={[
                    'leader-row grid grid-cols-[72px_minmax(160px,1fr)_minmax(110px,180px)_96px] items-center gap-3 px-4 py-2.5',
                    highlight ? 'bg-indigo-50/60' : ''
                  ].join(' ')}
                >
                  <span className="text-gray-600 tabular-nums">#{e.rank}</span>

                  <span className={highlight ? 'truncate font-semibold text-indigo-700' : 'truncate font-medium text-gray-900'}>
                    {e.name || '—'}
                    {highlight && (
                      <span className="ml-2 inline-block rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 align-middle">
                        You
                      </span>
                    )}
                  </span>

                  <span className={['text-right truncate', highlight ? 'text-indigo-600' : 'text-gray-500'].join(' ')}>
                    {e.city || '—'}
                  </span>

                  <span className={['text-right tabular-nums', highlight ? 'text-indigo-700' : 'text-gray-900'].join(' ')}>
                    {e.score === '' || e.score == null ? '—' : e.score}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
