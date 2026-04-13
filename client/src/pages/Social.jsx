import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatArea, formatNumber, timeAgo } from '../utils/formatters';

export default function Social() {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await api.get('/social/friends');
      setFriends(res.data.friends || []);
      setPendingRequests(res.data.pendingRequests || []);
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (searchQuery.length < 2) return;
    try {
      const res = await api.get(`/social/search?q=${searchQuery}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const sendRequest = async (userId) => {
    try {
      await api.post('/social/friend-request', { targetUserId: userId });
      setMessage({ type: 'success', text: 'Friend request sent!' });
      setSearchResults(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send request' });
    }
  };

  const acceptRequest = async (requesterId) => {
    try {
      await api.post('/social/friend-accept', { requesterId });
      setMessage({ type: 'success', text: 'Friend request accepted!' });
      fetchFriends();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to accept request' });
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await api.delete(`/social/friend/${friendId}`);
      setMessage({ type: 'success', text: 'Friend removed' });
      fetchFriends();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to remove friend' });
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            👥 Social
          </h1>
          <p className="text-dark-400 mt-1">Connect with other territory warriors</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm animate-slide-down ${
            message.type === 'success'
              ? 'bg-accent-400/10 border border-accent-400/20 text-accent-300'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Find Warriors</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
              placeholder="Search by username..."
              className="input-field flex-1"
            />
            <button onClick={searchUsers} className="btn-primary px-6">
              Search
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map(user => (
                <div key={user._id} className="flex items-center justify-between p-3 rounded-xl bg-dark-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.avatar || user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.username}</p>
                      <p className="text-xs text-dark-400">
                        Lv. {user.level} • {formatArea(user.stats?.totalLandOwned || 0)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendRequest(user._id)}
                    className="btn-neon py-1.5 px-4 text-xs"
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📬 Pending Requests
              <span className="badge-warning">{pendingRequests.length}</span>
            </h2>
            <div className="space-y-2">
              {pendingRequests.map(req => (
                <div key={req._id} className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold">
                      {req.avatar || req.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{req.username}</p>
                      <p className="text-xs text-dark-400">Lv. {req.level}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(req._id)}
                      className="btn-accent py-2 px-4 text-xs"
                    >
                      Accept
                    </button>
                    <button className="btn-ghost py-2 px-4 text-xs">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            🤝 Friends
            <span className="badge-primary">{friends.length}</span>
          </h2>

          {loading ? (
            <div className="glass-card p-12 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
            </div>
          ) : friends.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-4xl mb-3">👋</p>
              <p className="text-dark-400">No friends yet. Search for players above!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {friends.map(friend => (
                <div key={friend._id} className="glass-card-hover p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                    {friend.avatar || friend.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{friend.username}</p>
                    <p className="text-xs text-dark-400">
                      Lv. {friend.level} • {formatArea(friend.stats?.totalLandOwned || 0)}
                    </p>
                    {friend.city && (
                      <p className="text-[10px] text-dark-500">📍 {friend.city}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFriend(friend._id)}
                    className="text-dark-500 hover:text-red-400 text-xs transition-colors"
                    title="Remove friend"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
