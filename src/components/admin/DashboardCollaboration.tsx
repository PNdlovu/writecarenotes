/**
 * @writecarenotes.com
 * @fileoverview Dashboard collaboration component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A real-time collaboration component that enables team interaction on
 * dashboard elements. Features include:
 * - Live user presence indicators
 * - Real-time commenting system
 * - Visual annotation tools
 * - Session tracking
 * - Collaborative editing
 * - User activity monitoring
 * - Animated transitions
 * - Role-based permissions
 */

import React from 'react';

// Authentication & Session
import { useSession } from 'next-auth/react';

// Animation
import { motion, AnimatePresence } from 'framer-motion';

// Services
import { dashboardCollaborationService } from '@/services/dashboard-collaboration';

// UI Components
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input';

// Types
interface CollaborationProps {
  targetId: string;
  targetType: 'metric' | 'chart' | 'alert' | 'report';
}

// Animation Variants
const panelVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const DashboardCollaboration: React.FC<CollaborationProps> = ({
  targetId,
  targetType
}) => {
  const { data: session } = useSession()
  const [showCollabPanel, setShowCollabPanel] = React.useState(false)
  const [activeUsers, setActiveUsers] = React.useState<any[]>([])
  const [comments, setComments] = React.useState<any[]>([])
  const [annotations, setAnnotations] = React.useState<any[]>([])
  const [newComment, setNewComment] = React.useState('')
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [selectedColor, setSelectedColor] = React.useState('#FF0000')
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (!session?.user) return

    const setupCollaboration = async () => {
      // Join dashboard
      await dashboardCollaborationService.joinDashboard({
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'viewer',
        avatar: session.user.image
      })

      // Load existing data
      setActiveUsers(dashboardCollaborationService.getActiveUsers())
      setComments(dashboardCollaborationService.getComments(targetId))
      setAnnotations(dashboardCollaborationService.getAnnotations(targetId))

      // Subscribe to real-time updates
      const unsubscribe = await dashboardCollaborationService.subscribeToEvents(
        (event) => {
          switch (event.type) {
            case 'USER_JOINED':
              setActiveUsers(prev => [...prev, event.payload])
              break
            case 'USER_LEFT':
              setActiveUsers(prev => 
                prev.filter(user => user.id !== event.payload.userId)
              )
              break
            case 'COMMENT_ADDED':
              if (event.payload.targetId === targetId) {
                setComments(prev => [...prev, event.payload])
              }
              break
            case 'ANNOTATION_ADDED':
              if (event.payload.targetId === targetId) {
                setAnnotations(prev => [...prev, event.payload])
              }
              break
          }
        }
      )

      return () => {
        unsubscribe()
        dashboardCollaborationService.leaveDashboard(session.user.id)
      }
    }

    setupCollaboration()
  }, [session, targetId])

  const handleAddComment = async () => {
    if (!newComment.trim() || !session?.user) return

    await dashboardCollaborationService.addComment({
      userId: session.user.id,
      userName: session.user.name || '',
      content: newComment,
      targetId,
      targetType
    })

    setNewComment('')
  }

  const handleStartDrawing = () => {
    setIsDrawing(true)
  }

  const handleStopDrawing = () => {
    setIsDrawing(false)
  }

  const handleDraw = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !session?.user) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    await dashboardCollaborationService.addAnnotation({
      userId: session.user.id,
      userName: session.user.name || '',
      content: '',
      targetId,
      targetType: 'chart',
      position: { x, y },
      color: selectedColor
    })
  }

  return (
    <div className="relative">
      {/* Collaboration Toggle Button */}
      <button
        onClick={() => setShowCollabPanel(!showCollabPanel)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      </button>

      {/* Collaboration Panel */}
      <AnimatePresence>
        {showCollabPanel && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-4 overflow-y-auto"
          >
            {/* Active Users */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Active Users</h3>
              <div className="flex flex-wrap gap-2">
                {activeUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                  >
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-sm">{user.name}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        user.status === 'online'
                          ? 'bg-green-500'
                          : user.status === 'away'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Comments</h3>
              <div className="space-y-4 mb-4">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{comment.userName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Annotation Tools */}
            {targetType === 'chart' && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Annotations</h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={e => setSelectedColor(e.target.value)}
                    className="w-8 h-8 rounded"
                  />
                  <button
                    onClick={() => setIsDrawing(!isDrawing)}
                    className={`px-4 py-2 rounded-lg ${
                      isDrawing
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isDrawing ? 'Stop Drawing' : 'Start Drawing'}
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleStartDrawing}
                  onMouseUp={handleStopDrawing}
                  onMouseMove={handleDraw}
                  className="w-full h-40 border rounded-lg"
                />
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setShowCollabPanel(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Annotation Layer */}
      {targetType === 'chart' && (
        <div className="absolute inset-0 pointer-events-none">
          {annotations.map(annotation => (
            <div
              key={annotation.id}
              style={{
                position: 'absolute',
                left: annotation.position.x,
                top: annotation.position.y,
                width: 8,
                height: 8,
                backgroundColor: annotation.color,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default DashboardCollaboration
