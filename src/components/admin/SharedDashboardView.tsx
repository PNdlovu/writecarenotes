/**
 * @writecarenotes.com
 * @fileoverview Shared dashboard view component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A collaborative dashboard component that enables real-time multi-user
 * interaction with shared dashboard views. Features include:
 * - Real-time layout synchronization
 * - Shared filter state management
 * - Live cursor position tracking
 * - Collaborative annotations
 * - User presence indicators
 * - View state persistence
 * - Role-based access control
 * - Smooth animations
 */

import React from 'react';

// Authentication & Session
import { useSession } from 'next-auth/react';

// Animation
import { motion } from 'framer-motion';

// Services
import { dashboardCollaborationService } from '@/services/dashboard-collaboration';

// Components
import { DashboardCollaboration } from './DashboardCollaboration';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input';

// Types
interface SharedViewProps {
  initialLayout?: any
  initialFilters?: any
}

export const SharedDashboardView: React.FC<SharedViewProps> = ({
  initialLayout,
  initialFilters
}) => {
  const { data: session } = useSession()
  const [viewId, setViewId] = React.useState<string>()
  const [layout, setLayout] = React.useState(initialLayout)
  const [filters, setFilters] = React.useState(initialFilters)
  const [collaborators, setCollaborators] = React.useState<any[]>([])
  const [cursorPositions, setCursorPositions] = React.useState<Map<string, any>>(
    new Map()
  )

  React.useEffect(() => {
    if (!session?.user) return

    const setupSharedView = async () => {
      // Create or join shared view
      const id = await dashboardCollaborationService.shareView({
        name: 'Dashboard Analysis',
        createdBy: session.user.id,
        filters,
        layout,
        widgets: [],
        collaborators: [session.user.id],
        comments: [],
        annotations: []
      })
      setViewId(id)

      // Subscribe to real-time updates
      const unsubscribe = await dashboardCollaborationService.subscribeToEvents(
        (event) => {
          switch (event.type) {
            case 'VIEW_CHANGED':
              if (event.payload.userId !== session.user.id) {
                setLayout(event.payload.view)
              }
              break
            case 'CURSOR_MOVED':
              setCursorPositions(prev => new Map(prev).set(
                event.payload.userId,
                event.payload.position
              ))
              break
          }
        }
      )

      // Track cursor position
      const trackCursor = (e: MouseEvent) => {
        if (!viewId) return
        
        const element = document.getElementById('shared-dashboard-view')
        if (!element) return

        const rect = element.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        dashboardCollaborationService.updateCursorPosition(
          session.user.id,
          { x, y }
        )
      }

      document.addEventListener('mousemove', trackCursor)

      return () => {
        unsubscribe()
        document.removeEventListener('mousemove', trackCursor)
      }
    }

    setupSharedView()
  }, [session, initialLayout, initialFilters])

  const handleLayoutChange = async (newLayout: any) => {
    if (!viewId || !session?.user) return

    setLayout(newLayout)
    await dashboardCollaborationService.broadcastEvent({
      type: 'VIEW_CHANGED',
      payload: {
        userId: session.user.id,
        view: newLayout
      }
    })
  }

  const handleFilterChange = async (newFilters: any) => {
    if (!viewId || !session?.user) return

    setFilters(newFilters)
    await dashboardCollaborationService.broadcastEvent({
      type: 'VIEW_CHANGED',
      payload: {
        userId: session.user.id,
        view: { ...layout, filters: newFilters }
      }
    })
  }

  return (
    <div
      id="shared-dashboard-view"
      className="relative min-h-screen bg-gray-50 p-6"
    >
      {/* Collaboration Header */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Collaborative Analysis</h2>
          <div className="flex items-center gap-4">
            {/* Active Collaborators */}
            <div className="flex -space-x-2">
              {collaborators.map(user => (
                <motion.div
                  key={user.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white">
                      {user.name[0]}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-white" />
                </motion.div>
              ))}
            </div>

            {/* Share Button */}
            <button
              onClick={() => {
                // Copy shared view URL to clipboard
                const url = `${window.location.origin}/dashboard/shared/${viewId}`
                navigator.clipboard.writeText(url)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share View
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex gap-4">
          <select
            onChange={e => handleFilterChange({
              ...filters,
              timeRange: e.target.value
            })}
            className="rounded-lg border-gray-300"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <select
            onChange={e => handleFilterChange({
              ...filters,
              metric: e.target.value
            })}
            className="rounded-lg border-gray-300"
          >
            <option value="costs">Costs</option>
            <option value="usage">Usage</option>
            <option value="performance">Performance</option>
          </select>

          <Input
            type="text"
            placeholder="Search metrics..."
            onChange={e => handleFilterChange({
              ...filters,
              search: e.target.value
            })}
            className="flex-1 rounded-lg border-gray-300"
          />
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {layout?.widgets?.map((widget: any) => (
          <motion.div
            key={widget.id}
            layoutId={widget.id}
            className="bg-white rounded-lg shadow-lg"
          >
            <div className="relative">
              {/* Widget Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
                {/* Render widget content based on type */}
                {widget.type === 'chart' && (
                  <div className="h-64">
                    {/* Chart component */}
                  </div>
                )}
                {widget.type === 'metric' && (
                  <div className="text-3xl font-bold">
                    {widget.value}
                  </div>
                )}
              </div>

              {/* Collaboration Features */}
              <DashboardCollaboration
                targetId={widget.id}
                targetType={widget.type}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cursor Indicators */}
      {Array.from(cursorPositions.entries()).map(([userId, position]) => {
        const user = collaborators.find(u => u.id === userId)
        if (!user || userId === session?.user.id) return null

        return (
          <motion.div
            key={userId}
            className="absolute pointer-events-none"
            animate={{
              left: `${position.x}%`,
              top: `${position.y}%`
            }}
            transition={{ duration: 0.1 }}
          >
            <div className="relative">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  transform: 'rotate(-45deg)',
                  fill: user.color || '#2563EB'
                }}
              >
                <path d="M1 1l7 14 2-6 6-2L1 1z" />
              </svg>
              <div
                className="absolute left-4 top-4 px-2 py-1 text-xs text-white rounded whitespace-nowrap"
                style={{ backgroundColor: user.color || '#2563EB' }}
              >
                {user.name}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default SharedDashboardView
