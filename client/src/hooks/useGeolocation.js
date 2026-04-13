import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for GPS tracking using the Geolocation API
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [path, setPath] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    distance: 0,
    duration: 0,
    avgSpeed: 0,
    currentSpeed: 0
  });
  const watchIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  // Calculate distance between two points (Haversine)
  const haversine = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Start tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setError(null);
    setPath([]);
    setStats({ distance: 0, duration: 0, avgSpeed: 0, currentSpeed: 0 });
    startTimeRef.current = Date.now();

    // Timer for duration
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setStats(prev => ({
        ...prev,
        duration: elapsed,
        avgSpeed: elapsed > 0 ? prev.distance / elapsed : 0
      }));
    }, 1000);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, accuracy } = pos.coords;
        const newPos = { lat: latitude, lng: longitude, accuracy, speed: speed || 0 };
        setPosition(newPos);

        setPath(prev => {
          const newPath = [...prev, [longitude, latitude]];

          // Calculate distance
          if (prev.length > 0) {
            const lastPoint = prev[prev.length - 1];
            const dist = haversine(lastPoint[1], lastPoint[0], latitude, longitude);

            // Only add point if moved > 3m (filter noise)
            if (dist < 3) return prev;

            setStats(s => ({
              ...s,
              distance: s.distance + dist,
              currentSpeed: speed || 0
            }));
          }

          return newPath;
        });
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(err.message);
      },
      options
    );

    setTracking(true);
  }, [haversine]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTracking(false);
  }, []);

  // Get current position once
  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          };
          setPosition(newPos);
          resolve(newPos);
        },
        (err) => {
          setError(err.message);
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    position,
    path,
    tracking,
    error,
    stats,
    startTracking,
    stopTracking,
    getCurrentPosition
  };
}
