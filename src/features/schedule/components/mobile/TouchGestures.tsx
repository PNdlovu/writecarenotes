import React, { useRef, useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface GestureConfig {
  id: string;
  type: 'swipe' | 'pinch' | 'rotate' | 'longpress';
  direction?: 'left' | 'right' | 'up' | 'down';
  action: string;
  enabled: boolean;
  settings?: {
    threshold?: number;
    duration?: number;
    distance?: number;
  };
}

interface TouchState {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  startTime: number;
  isMultiTouch: boolean;
  initialDistance?: number;
  initialAngle?: number;
}

export const TouchGestures: React.FC = () => {
  const touchRef = useRef<TouchState | null>(null);
  const [activeGesture, setActiveGesture] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const { data: gestureConfigs } = useQuery<GestureConfig[]>(
    ['gesture-configs'],
    () => scheduleAPI.getGestureConfigs()
  );

  const updateGestureMutation = useMutation(
    (config: GestureConfig) => scheduleAPI.updateGestureConfig(config)
  );

  const handleGestureAction = async (gesture: GestureConfig) => {
    try {
      await scheduleAPI.executeGestureAction(gesture.action);
      setActiveGesture(gesture.id);
      setTimeout(() => setActiveGesture(null), 1000);
    } catch (error) {
      console.error('Failed to execute gesture action:', error);
    }
  };

  const getDistance = (touches: TouchList) => {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAngle = (touches: TouchList) => {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
      startTime: Date.now(),
      isMultiTouch: e.touches.length > 1,
    };

    if (e.touches.length === 2) {
      touchRef.current.initialDistance = getDistance(e.touches);
      touchRef.current.initialAngle = getAngle(e.touches);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return;

    const touch = e.touches[0];
    touchRef.current.lastX = touch.clientX;
    touchRef.current.lastY = touch.clientY;

    if (e.touches.length === 2 && gestureConfigs) {
      const currentDistance = getDistance(e.touches);
      const currentAngle = getAngle(e.touches);

      if (touchRef.current.initialDistance && touchRef.current.initialAngle) {
        const pinchDelta = currentDistance - touchRef.current.initialDistance;
        const rotateDelta = currentAngle - touchRef.current.initialAngle;

        const pinchConfig = gestureConfigs.find(
          (g) => g.type === 'pinch' && g.enabled
        );
        const rotateConfig = gestureConfigs.find(
          (g) => g.type === 'rotate' && g.enabled
        );

        if (
          pinchConfig &&
          Math.abs(pinchDelta) > (pinchConfig.settings?.threshold || 50)
        ) {
          handleGestureAction(pinchConfig);
        }

        if (
          rotateConfig &&
          Math.abs(rotateDelta) > (rotateConfig.settings?.threshold || 45)
        ) {
          handleGestureAction(rotateConfig);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current || !gestureConfigs) return;

    const deltaX = touchRef.current.lastX - touchRef.current.startX;
    const deltaY = touchRef.current.lastY - touchRef.current.startY;
    const duration = Date.now() - touchRef.current.startTime;

    // Handle swipe gestures
    const swipeConfigs = gestureConfigs.filter(
      (g) => g.type === 'swipe' && g.enabled
    );

    for (const config of swipeConfigs) {
      const threshold = config.settings?.threshold || 50;
      const minDuration = config.settings?.duration || 300;

      if (duration <= minDuration) {
        if (
          config.direction === 'left' &&
          deltaX < -threshold &&
          Math.abs(deltaY) < threshold
        ) {
          handleGestureAction(config);
        } else if (
          config.direction === 'right' &&
          deltaX > threshold &&
          Math.abs(deltaY) < threshold
        ) {
          handleGestureAction(config);
        } else if (
          config.direction === 'up' &&
          deltaY < -threshold &&
          Math.abs(deltaX) < threshold
        ) {
          handleGestureAction(config);
        } else if (
          config.direction === 'down' &&
          deltaY > threshold &&
          Math.abs(deltaX) < threshold
        ) {
          handleGestureAction(config);
        }
      }
    }

    // Handle long press gestures
    const longPressConfig = gestureConfigs.find(
      (g) => g.type === 'longpress' && g.enabled
    );
    if (
      longPressConfig &&
      duration >= (longPressConfig.settings?.duration || 500) &&
      Math.abs(deltaX) < 10 &&
      Math.abs(deltaY) < 10
    ) {
      handleGestureAction(longPressConfig);
    }

    touchRef.current = null;
  };

  const renderGestureConfig = (config: GestureConfig) => (
    <div
      key={config.id}
      className={`
        p-6 rounded-lg border border-gray-200
        ${activeGesture === config.id ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium capitalize">
            {config.type} {config.direction && `(${config.direction})`}
          </h3>
          <p className="text-sm text-gray-500">{config.action}</p>
        </div>
        <div className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) =>
              updateGestureMutation.mutate({
                ...config,
                enabled: e.target.checked,
              })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
      </div>

      <div className="space-y-4">
        {config.settings?.threshold !== undefined && (
          <div>
            <label className="text-sm font-medium">
              Threshold ({config.type === 'rotate' ? 'degrees' : 'pixels'})
            </label>
            <input
              type="number"
              value={config.settings.threshold}
              onChange={(e) =>
                updateGestureMutation.mutate({
                  ...config,
                  settings: {
                    ...config.settings,
                    threshold: parseInt(e.target.value),
                  },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
        )}

        {config.settings?.duration !== undefined && (
          <div>
            <label className="text-sm font-medium">Duration (ms)</label>
            <input
              type="number"
              value={config.settings.duration}
              onChange={(e) =>
                updateGestureMutation.mutate({
                  ...config,
                  settings: {
                    ...config.settings,
                    duration: parseInt(e.target.value),
                  },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderTutorial = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Gesture Tutorial</h3>
          <button
            onClick={() => setShowTutorial(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Swipe Gestures</h4>
            <p className="text-sm text-gray-500">
              Quickly slide your finger across the screen in any direction to
              trigger swipe actions.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Pinch Gestures</h4>
            <p className="text-sm text-gray-500">
              Use two fingers to pinch in or out to zoom content or trigger
              specific actions.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Rotate Gestures</h4>
            <p className="text-sm text-gray-500">
              Place two fingers on the screen and rotate them clockwise or
              counterclockwise.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Long Press</h4>
            <p className="text-sm text-gray-500">
              Touch and hold your finger on an item for a specified duration to
              trigger contextual actions.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowTutorial(false)}
          className="mt-6 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Got it!
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="space-y-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Touch Gestures</h2>
        <button
          onClick={() => setShowTutorial(true)}
          className="text-blue-600 hover:text-blue-700"
        >
          View Tutorial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gestureConfigs?.map(renderGestureConfig)}
      </div>

      {showTutorial && renderTutorial()}
    </div>
  );
};
