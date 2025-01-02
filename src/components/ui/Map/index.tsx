/**
 * @writecarenotes.com
 * @fileoverview Map component for displaying staff and client locations
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A map component built with react-leaflet for displaying staff locations,
 * client locations, and territory boundaries. Supports interactive territory
 * management and route optimization.
 */

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface Location {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: Location;
  type: 'staff' | 'client';
}

export interface Territory {
  id: string;
  bounds: Location[];
}

export interface MapProps {
  center: Location;
  zoom: number;
  markers: MapMarker[];
  territories?: Territory[];
  onTerritoryUpdate?: (territory: Territory) => void;
}

// Update map view when center/zoom changes
function MapUpdater({ center, zoom }: { center: Location; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [map, center, zoom]);
  
  return null;
}

function Map({ center, zoom, markers, territories, onTerritoryUpdate }: MapProps) {
  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <MapUpdater center={center} zoom={zoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map(marker => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lng]}
            icon={L.divIcon({
              className: `map-marker ${marker.type}`,
              html: `<div class="w-8 h-8 rounded-full bg-${
                marker.type === 'staff' ? 'blue' : 'green'
              }-500 flex items-center justify-center text-white text-xs">
                ${marker.type === 'staff' ? '👤' : '📍'}
              </div>`,
            })}
          >
            <Popup>
              {marker.type === 'staff' ? 'Staff Member' : 'Client Location'}
            </Popup>
          </Marker>
        ))}

        {territories?.map(territory => (
          <div key={territory.id}>
            {/* Add territory polygon visualization here */}
          </div>
        ))}
      </MapContainer>
    </div>
  );
}

Map.displayName = 'Map';

export default Map; 