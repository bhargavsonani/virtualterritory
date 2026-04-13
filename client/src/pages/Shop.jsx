import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatNumber } from '../utils/formatters';

export default function Shop() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [message, setMessage] = useState(null);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/shop/items');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch shop items:', err);
    } finally {
      setLoading(false);
    }
  };

  const buyItem = async (itemId) => {
    try {
      setBuying(itemId);
      setMessage(null);
      const res = await api.post('/shop/buy', { itemId });
      setMessage({ type: 'success', text: res.data.message });
      refreshUser();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Purchase failed'
      });
    } finally {
      setBuying(null);
    }
  };

  const shields = items.filter(i => i.type === 'shield');
  const boosts = items.filter(i => i.type === 'boost');

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              🛒 Shop
            </h1>
            <p className="text-dark-400 mt-1">Spend your coins on boosts and protection</p>
          </div>
          <div className="glass-card px-5 py-3 flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <span className="text-xl font-bold text-neon-yellow">{formatNumber(user?.coins || 0)}</span>
          </div>
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

        {loading ? (
          <div className="glass-card p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Shields */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                🛡️ Shields
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shields.map(item => (
                  <ShopItemCard
                    key={item.id}
                    item={item}
                    onBuy={() => buyItem(item.id)}
                    buying={buying === item.id}
                    canAfford={(user?.coins || 0) >= item.price}
                  />
                ))}
              </div>
            </div>

            {/* Boosts */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                ⚡ Boosts
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {boosts.map(item => (
                  <ShopItemCard
                    key={item.id}
                    item={item}
                    onBuy={() => buyItem(item.id)}
                    buying={buying === item.id}
                    canAfford={(user?.coins || 0) >= item.price}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ShopItemCard({ item, onBuy, buying, canAfford }) {
  const formatDuration = (seconds) => {
    if (seconds >= 3600) return `${seconds / 3600}h`;
    return `${seconds / 60}m`;
  };

  return (
    <div className="glass-card-hover p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{item.icon}</span>
        <span className="text-xs text-dark-400 bg-dark-800/60 px-2 py-1 rounded-lg">
          {formatDuration(item.duration)}
        </span>
      </div>

      <h3 className="text-base font-bold text-white mb-1">{item.name}</h3>
      <p className="text-xs text-dark-400 mb-4 flex-1">{item.description}</p>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-neon-yellow font-bold">
          🪙 {item.price}
        </span>
        <button
          onClick={onBuy}
          disabled={buying || !canAfford}
          className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
            canAfford
              ? 'btn-primary py-2 px-5'
              : 'bg-dark-800 text-dark-500 cursor-not-allowed'
          }`}
        >
          {buying ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : canAfford ? 'Buy' : 'Not enough'}
        </button>
      </div>
    </div>
  );
}
