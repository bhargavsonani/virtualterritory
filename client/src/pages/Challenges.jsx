import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshUser } = useAuth();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/challenges/active');
      setChallenges(res.data);
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (challengeId) => {
    try {
      await api.post('/challenges/claim', { challengeId });
      refreshUser();
      fetchChallenges();
    } catch (err) {
      console.error('Failed to claim reward:', err);
    }
  };

  const dailyChallenges = challenges.filter(c => c.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly');

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            🎯 Challenges
          </h1>
          <p className="text-dark-400 mt-1">Complete challenges to earn rewards</p>
        </div>

        {loading ? (
          <div className="glass-card p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Daily Challenges */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                🌅 Daily Challenges
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyChallenges.map(challenge => (
                  <ChallengeCard
                    key={challenge._id}
                    challenge={challenge}
                    onClaim={() => claimReward(challenge._id)}
                  />
                ))}
                {dailyChallenges.length === 0 && (
                  <div className="glass-card p-6 text-center col-span-full">
                    <p className="text-dark-400">No daily challenges available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Challenges */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                📅 Weekly Challenges
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyChallenges.map(challenge => (
                  <ChallengeCard
                    key={challenge._id}
                    challenge={challenge}
                    onClaim={() => claimReward(challenge._id)}
                  />
                ))}
                {weeklyChallenges.length === 0 && (
                  <div className="glass-card p-6 text-center col-span-full">
                    <p className="text-dark-400">No weekly challenges available</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, onClaim }) {
  const progressPercent = Math.min(challenge.progressPercent || 0, 100);

  return (
    <div className={`glass-card p-5 transition-all hover:bg-dark-800/40 ${
      challenge.completed ? 'border-accent-400/30' : ''
    }`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{challenge.icon}</span>
        {challenge.completed ? (
          <span className="badge-accent">✓ Done</span>
        ) : (
          <span className="badge-primary">{challenge.type}</span>
        )}
      </div>

      <h3 className="text-sm font-bold text-white mb-1">{challenge.title}</h3>
      <p className="text-xs text-dark-400 mb-4">{challenge.description}</p>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-dark-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              challenge.completed
                ? 'bg-gradient-to-r from-accent-400 to-accent-500'
                : 'bg-gradient-to-r from-primary-500 to-primary-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Rewards */}
      <div className="flex items-center gap-3 text-xs">
        {challenge.reward?.coins > 0 && (
          <span className="flex items-center gap-1 text-neon-yellow">
            🪙 {challenge.reward.coins}
          </span>
        )}
        {challenge.reward?.xp > 0 && (
          <span className="flex items-center gap-1 text-primary-300">
            ⭐ {challenge.reward.xp} XP
          </span>
        )}
      </div>

      {/* Claim button */}
      {challenge.completed && (
        <button
          onClick={onClaim}
          className="btn-accent w-full mt-4 py-2 text-xs"
        >
          Claim Reward
        </button>
      )}
    </div>
  );
}
