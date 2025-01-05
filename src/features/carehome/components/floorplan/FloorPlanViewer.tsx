// src/features/carehome/components/floorplan/FloorPlanViewer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { 
  ZoomInIcon, 
  ZoomOutIcon, 
  RotateClockwiseIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

interface FloorPlanViewerProps {
  careHomeId: string;
  onRoomSelect?: (roomId: string) => void;
}

interface Room {
  id: string;
  number: string;
  type: 'single' | 'double' | 'suite';
  status: 'occupied' | 'available' | 'maintenance';
  occupants?: string[];
}

interface Floor {
  id: string;
  name: string;
  level: number;
  rooms: Room[];
  layout: string; // SVG data
}

async function fetchFloorPlan(careHomeId: string, floorId: string) {
  const response = await fetch(`/api/care-homes/${careHomeId}/floors/${floorId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch floor plan');
  }
  return response.json();
}

export function FloorPlanViewer({ careHomeId, onRoomSelect }: FloorPlanViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const { data: floors, isLoading } = useQuery<Floor[]>({
    queryKey: ['floors', careHomeId],
    queryFn: () => fetch(`/api/care-homes/${careHomeId}/floors`).then(res => res.json()),
  });

  const { data: floorPlan } = useQuery<Floor>({
    queryKey: ['floorPlan', careHomeId, selectedFloor],
    queryFn: () => fetchFloorPlan(careHomeId, selectedFloor),
    enabled: !!selectedFloor,
  });

  useEffect(() => {
    if (floors?.length) {
      setSelectedFloor(floors[0].id);
    }
  }, [floors]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRoomClick = (roomId: string) => {
    if (onRoomSelect) {
      onRoomSelect(roomId);
    }
  };

  if (isLoading) {
    return <div>Loading floor plans...</div>;
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Select value={selectedFloor} onValueChange={setSelectedFloor}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select floor" />
            </SelectTrigger>
            <SelectContent>
              {floors?.map(floor => (
                <SelectItem key={floor.id} value={floor.id}>
                  {floor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            title="Zoom in"
          >
            <ZoomInIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            title="Zoom out"
          >
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRotate}
            title="Rotate"
          >
            <RotateClockwiseIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            title="Reset view"
          >
            <HomeIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative w-full h-[600px] overflow-hidden border rounded-lg">
        <div
          className="w-full h-full"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease',
          }}
        >
          {floorPlan && (
            <svg
              ref={svgRef}
              className="w-full h-full"
              viewBox="0 0 1000 1000"
              dangerouslySetInnerHTML={{ __html: floorPlan.layout }}
            />
          )}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Room Status</h3>
        <div className="grid grid-cols-3 gap-4">
          {floorPlan?.rooms.map(room => (
            <div
              key={room.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                room.status === 'occupied'
                  ? 'bg-red-50 hover:bg-red-100'
                  : room.status === 'available'
                  ? 'bg-green-50 hover:bg-green-100'
                  : 'bg-yellow-50 hover:bg-yellow-100'
              }`}
              onClick={() => handleRoomClick(room.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Room {room.number}</p>
                  <p className="text-sm text-gray-600 capitalize">{room.type}</p>
                </div>
                <span className="text-xs font-medium capitalize px-2 py-1 rounded-full bg-white">
                  {room.status}
                </span>
              </div>
              {room.occupants && room.occupants.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {room.occupants.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}


