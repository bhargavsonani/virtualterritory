import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polyline, CircleMarker, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTerritory } from '../hooks/useTerritory';
import { territoriesToGeoJSON, pathToGeoJSON } from '../utils/geoUtils';
import { formatDistance, formatDuration, formatSpeed, getUserColor } from '../utils/formatters';
import api from '../api/axios';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths (not bundled correctly by Vite)
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Helper component: fly the map to a position when it changes
 */
function FlyToPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], map.getZoom(), { duration: 1 });
    }
  }, [position, map]);
  return null;
}

/**
 * Helper component: fires a callback when the user stops panning / zooming
 */
function MapMoveHandler({ onMoveEnd }) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const bounds = map.getBounds();
      onMoveEnd({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
  });
  return null;
}

/**
 * Helper component: locate the user when the map first loads
 */
function OnMapReady({ onReady }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

export default function MapView() {
  const { user, refreshUser } = useAuth();
  const { socket } = useSocket();
  const { position, path, tracking, error, stats, startTracking, stopTracking, getCurrentPosition } = useGeolocation();
  const { territories, fetchTerritories, claimTerritory, claiming } = useTerritory();
  const [center, setCenter] = useState([21.1702, 72.8777]); // [lat, lng]
  const [result, setResult] = useState(null);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Get initial position
  useEffect(() => {
    getCurrentPosition()
      .then((pos) => {
        setCenter([pos.lat, pos.lng]);
      })
      .catch(() => {
        console.log('Using default position');
      });
  }, []);

  // Initial fetch when map first loads
  const handleMapReady = useCallback(
    (map) => {
      mapRef.current = map;
      setMapReady(true);
      const bounds = map.getBounds();
      fetchTerritories({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
    [fetchTerritories]
  );

  // Fetch territories when map moves
  const handleMoveEnd = useCallback(
    (bounds) => {
      fetchTerritories(bounds);
    },
    [fetchTerritories]
  );

  // Send location updates via socket
  useEffect(() => {
    if (position && socket && tracking) {
      socket.emit('user:location', { location: position });
    }
  }, [position, socket, tracking]);

  // Handle stop tracking + claim territory
  const handleStopAndClaim = async () => {
    stopTracking();

    if (path.length < 2) {
      setResult({ type: 'error', message: 'Walk more to claim territory!' });
      return;
    }

    try {
      const claimResult = await claimTerritory(path);

      // Save activity
      await api.post('/activity/save', {
        path: { type: 'LineString', coordinates: path },
        duration: stats.duration,
        startedAt: new Date(Date.now() - stats.duration * 1000),
        endedAt: new Date(),
        territoriesClaimed: claimResult.newTiles,
      });

      // Emit socket event
      if (socket) {
        socket.emit('territory:claim', {
          geohashes: claimResult.newTiles,
          count: claimResult.claimed + claimResult.captured,
        });
      }

      setResult({
        type: 'success',
        message: `🏴 Claimed ${claimResult.claimed} tiles! ${claimResult.captured > 0 ? `⚔️ Captured ${claimResult.captured}!` : ''} (+${claimResult.xpEarned} XP)`,
      });

      refreshUser();

      // Refresh territories
      const map = mapRef.current;
      if (map) {
        const bounds = map.getBounds();
        fetchTerritories({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    } catch (err) {
      setResult({
        type: 'error',
        message: err.response?.data?.message || 'Failed to claim territory',
      });
    }
  };

  // ---------- Derived data ----------

  // GeoJSON for territories
  const territoriesGeoJSON = territoriesToGeoJSON(territories);

  const ownedTerritories = {
    type: 'FeatureCollection',
    features: territoriesGeoJSON.features.filter((f) => f.properties.ownerId === user?.id),
  };

  const otherTerritories = {
    type: 'FeatureCollection',
    features: territoriesGeoJSON.features.filter((f) => f.properties.ownerId !== user?.id),
  };

  // Path as array of [lat, lng] for Leaflet Polyline
  const pathLatLngs = path.length >= 2 ? path.map(([lng, lat]) => [lat, lng]) : [];

  // ---------- Leaflet style helpers ----------

  const ownedStyle = {
    color: '#00f5ff',
    weight: 1.5,
    opacity: 0.6,
    fillColor: '#00f5ff',
    fillOpacity: 0.25,
  };

  const othersStyle = {
    color: '#ff006e',
    weight: 1,
    opacity: 0.5,
    fillColor: '#ff006e',
    fillOpacity: 0.2,
  };

  return (
    <div className="h-screen w-full pt-16 relative">
      {/* Map */}
      <MapContainer
        center={center}
        zoom={15}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        {/* Dark tile layer (CartoDB dark_all – free, no API key needed) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <ZoomControl position="bottomright" />

        {/* Fly to user position when it changes while tracking */}
        {tracking && position && <FlyToPosition position={position} />}

        {/* Fire onMoveEnd for territory fetching */}
        <MapMoveHandler onMoveEnd={handleMoveEnd} />

        {/* Capture map ref on first render */}
        <OnMapReady onReady={handleMapReady} />

        {/* Owned territories (cyan) */}
        {ownedTerritories.features.length > 0 && (
          <GeoJSON key={`owned-${territories.length}`} data={ownedTerritories} style={() => ownedStyle} />
        )}

        {/* Other users' territories (pink) */}
        {otherTerritories.features.length > 0 && (
          <GeoJSON key={`others-${territories.length}`} data={otherTerritories} style={() => othersStyle} />
        )}

        {/* Current tracking path */}
        {pathLatLngs.length >= 2 && (
          <Polyline
            positions={pathLatLngs}
            pathOptions={{ color: '#39ff14', weight: 4, opacity: 0.8, lineCap: 'round', lineJoin: 'round' }}
          />
        )}

        {/* User position marker */}
        {position && (
          <CircleMarker
            center={[position.lat, position.lng]}
            radius={8}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: '#00f5ff',
              fillOpacity: 1,
            }}
          />
        )}
      </MapContainer>

      {/* Tracking Controls Panel */}
      <div className="absolute top-20 left-4 right-4 sm:right-auto sm:w-80 z-[1000]">
        <div className="glass-card p-4 space-y-4">
          {/* Status header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {tracking && <div className="pulse-dot" />}
              <span className={`text-sm font-semibold ${tracking ? 'text-accent-400' : 'text-dark-400'}`}>
                {tracking ? 'Tracking Active' : 'Ready to Track'}
              </span>
            </div>
            <span className="badge-primary">Lv. {user?.level || 1}</span>
          </div>

          {/* Live stats (visible during tracking) */}
          {tracking && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div className="bg-dark-800/60 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-neon-cyan">{formatDistance(stats.distance)}</p>
                <p className="text-[10px] text-dark-400 uppercase">Distance</p>
              </div>
              <div className="bg-dark-800/60 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-accent-400">{formatDuration(stats.duration)}</p>
                <p className="text-[10px] text-dark-400 uppercase">Duration</p>
              </div>
              <div className="bg-dark-800/60 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-neon-yellow">{formatSpeed(stats.currentSpeed)}</p>
                <p className="text-[10px] text-dark-400 uppercase">Speed</p>
              </div>
              <div className="bg-dark-800/60 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-neon-purple">{path.length}</p>
                <p className="text-[10px] text-dark-400 uppercase">Points</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {!tracking ? (
              <button onClick={startTracking} className="btn-accent w-full py-3 flex items-center justify-center gap-2" id="start-tracking">
                <span className="text-lg">🏃</span> Start Tracking
              </button>
            ) : (
              <button
                onClick={handleStopAndClaim}
                disabled={claiming}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                id="stop-tracking"
              >
                {claiming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <span className="text-lg">🏴</span> Stop & Claim
                  </>
                )}
              </button>
            )}
          </div>

          {/* GPS error */}
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">⚠️ {error}</div>
          )}

          {/* Result message */}
          {result && (
            <div
              className={`px-3 py-2 rounded-lg text-sm animate-slide-down ${
                result.type === 'success'
                  ? 'bg-accent-400/10 border border-accent-400/20 text-accent-300'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {result.message}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-[1000]">
        <div className="glass-card p-3 space-y-2">
          <p className="text-[10px] text-dark-400 uppercase font-semibold tracking-wider">Legend</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-neon-cyan/40 border border-neon-cyan/60" />
            <span className="text-xs text-dark-300">Your Territory</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-neon-pink/40 border border-neon-pink/60" />
            <span className="text-xs text-dark-300">Enemy Territory</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-neon-green/80" style={{ height: '2px' }} />
            <span className="text-xs text-dark-300">Your Path</span>
          </div>
        </div>
      </div>

      {/* Territory count */}
      <div className="absolute bottom-6 right-4 z-[1000]">
        <div className="glass-card p-3 text-center">
          <p className="text-xl font-bold text-gradient">{territories.length}</p>
          <p className="text-[10px] text-dark-400 uppercase">Tiles Visible</p>
        </div>
      </div>
    </div>
  );
}
