import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socketService from '../services/socket';
import { Navigation, Package, MapPin } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const pickupIcon = createCustomIcon('#10b981');
const dropIcon = createCustomIcon('#ef4444');
const driverIcon = createCustomIcon('#3b82f6');

// Component to update map view
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const MapTracker = ({ delivery, showControls = true }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default: India center
  const [mapZoom, setMapZoom] = useState(5);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!delivery) return;

    // Set initial map center based on delivery locations
    if (delivery.pickup_lat && delivery.pickup_lng) {
      setMapCenter([delivery.pickup_lat, delivery.pickup_lng]);
      setMapZoom(12);
    }

    // Join delivery tracking room
    socketService.joinDelivery(delivery.id);

    // Listen for location updates
    const handleLocationUpdate = (data) => {
      if (data.delivery_id === delivery.id) {
        const newLocation = {
          lat: data.current_lat,
          lng: data.current_lng,
          speed: data.speed,
          heading: data.heading,
          timestamp: data.timestamp,
        };
        setCurrentLocation(newLocation);
        setTrackingHistory((prev) => [...prev, newLocation]);
        setMapCenter([data.current_lat, data.current_lng]);
      }
    };

    socketService.onLocationUpdate(handleLocationUpdate);

    return () => {
      socketService.leaveDelivery(delivery.id);
      socketService.off('location-update', handleLocationUpdate);
    };
  }, [delivery]);

  if (!delivery) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">No delivery selected</p>
      </div>
    );
  }

  const pickupPosition = [delivery.pickup_lat, delivery.pickup_lng];
  const dropPosition = [delivery.drop_lat, delivery.drop_lng];
  const driverPosition = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : pickupPosition;

  // Create path for polyline
  const pathPositions = trackingHistory.length > 0
    ? trackingHistory.map((loc) => [loc.lat, loc.lng])
    : [pickupPosition, dropPosition];

  const centerOnDriver = () => {
    if (currentLocation) {
      setMapCenter([currentLocation.lat, currentLocation.lng]);
      setMapZoom(15);
    }
  };

  const centerOnRoute = () => {
    setMapCenter([
      (delivery.pickup_lat + delivery.drop_lat) / 2,
      (delivery.pickup_lng + delivery.drop_lng) / 2,
    ]);
    setMapZoom(12);
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={mapCenter} zoom={mapZoom} />

        {/* Pickup Marker */}
        <Marker position={pickupPosition} icon={pickupIcon}>
          <Popup>
            <div className="p-2">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-green-600" />
                <strong>Pickup Location</strong>
              </div>
              <p className="text-sm">{delivery.pickup_location}</p>
            </div>
          </Popup>
        </Marker>

        {/* Drop Marker */}
        <Marker position={dropPosition} icon={dropIcon}>
          <Popup>
            <div className="p-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <strong>Drop Location</strong>
              </div>
              <p className="text-sm">{delivery.drop_location}</p>
            </div>
          </Popup>
        </Marker>

        {/* Driver Current Location */}
        {currentLocation && (
          <Marker position={driverPosition} icon={driverIcon}>
            <Popup>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <strong>Driver Location</strong>
                </div>
                {delivery.driver_name && (
                  <p className="text-sm mb-1">Driver: {delivery.driver_name}</p>
                )}
                {currentLocation.speed && (
                  <p className="text-sm">Speed: {currentLocation.speed.toFixed(1)} km/h</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(currentLocation.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {trackingHistory.length > 0 && (
          <Polyline positions={pathPositions} color="#3b82f6" weight={3} opacity={0.7} />
        )}
        {trackingHistory.length === 0 && (
          <Polyline
            positions={[pickupPosition, dropPosition]}
            color="#94a3b8"
            weight={2}
            opacity={0.5}
            dashArray="10, 10"
          />
        )}
      </MapContainer>

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <button
            onClick={centerOnDriver}
            disabled={!currentLocation}
            className="bg-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <span className="text-sm font-medium">Center on Driver</span>
          </button>
          <button
            onClick={centerOnRoute}
            className="bg-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">View Full Route</span>
          </button>
        </div>
      )}

      {/* Status Info */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Pickup: {delivery.pickup_location}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Drop: {delivery.drop_location}</span>
          </div>
          {currentLocation && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm font-medium">Live Tracking Active</span>
            </div>
          )}
          <div className="pt-2 border-t">
            <span className="text-xs text-gray-500">
              Status: <span className="font-medium text-gray-700">{delivery.status}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTracker;
