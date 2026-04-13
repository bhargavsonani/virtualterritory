import { useState, useCallback } from 'react';
import api from '../api/axios';

/**
 * Custom hook for territory operations
 */
export function useTerritory() {
  const [territories, setTerritories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Fetch territories in a bounding box
  const fetchTerritories = useCallback(async (bounds) => {
    try {
      setLoading(true);
      const res = await api.get('/territory/area', {
        params: {
          north: bounds.north,
          south: bounds.south,
          east: bounds.east,
          west: bounds.west
        }
      });
      setTerritories(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch territories:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Claim territory from path
  const claimTerritory = useCallback(async (coordinates) => {
    try {
      setClaiming(true);
      const res = await api.post('/territory/claim', { coordinates });
      return res.data;
    } catch (err) {
      console.error('Failed to claim territory:', err);
      throw err;
    } finally {
      setClaiming(false);
    }
  }, []);

  // Get user's territories
  const getUserTerritories = useCallback(async (userId) => {
    try {
      const res = await api.get(`/territory/user/${userId}`);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch user territories:', err);
      return { count: 0, totalArea: 0, territories: [] };
    }
  }, []);

  // Battle territory
  const battleTerritory = useCallback(async (geohash, timeSpent, speed) => {
    try {
      const res = await api.post('/territory/battle', { geohash, timeSpent, speed });
      return res.data;
    } catch (err) {
      console.error('Battle failed:', err);
      throw err;
    }
  }, []);

  return {
    territories,
    loading,
    claiming,
    fetchTerritories,
    claimTerritory,
    getUserTerritories,
    battleTerritory
  };
}
