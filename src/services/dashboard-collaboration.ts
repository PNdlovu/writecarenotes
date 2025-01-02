import { WebPubSubClient, WebPubSubServiceClient } from '@azure/web-pubsub'
import { DefaultAzureCredential } from '@azure/identity'
import { v4 as uuidv4 } from 'uuid'

interface DashboardUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  status: 'online' | 'away' | 'offline'
  currentView?: string
  lastActive: Date
}

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date
  targetId: string
  targetType: 'metric' | 'chart' | 'alert' | 'report'
  replies?: Comment[]
  reactions?: {
    [key: string]: string[] // emoji -> userIds
  }
}

interface Annotation {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date
  targetId: string
  targetType: 'chart' | 'metric'
  position: {
    x: number
    y: number
  }
  color: string
}

interface SharedView {
  id: string
  name: string
  createdBy: string
  timestamp: Date
  filters: any
  layout: any
  widgets: any[]
  collaborators: string[]
  comments: Comment[]
  annotations: Annotation[]
}

type CollaborationEvent = 
  | { type: 'USER_JOINED'; payload: DashboardUser }
  | { type: 'USER_LEFT'; payload: { userId: string } }
  | { type: 'VIEW_CHANGED'; payload: { userId: string; view: string } }
  | { type: 'COMMENT_ADDED'; payload: Comment }
  | { type: 'ANNOTATION_ADDED'; payload: Annotation }
  | { type: 'VIEW_SHARED'; payload: SharedView }
  | { type: 'CURSOR_MOVED'; payload: { userId: string; position: { x: number; y: number } } }

export class DashboardCollaborationService {
  private static instance: DashboardCollaborationService
  private pubsubClient: WebPubSubClient
  private serviceClient: WebPubSubServiceClient
  private activeUsers: Map<string, DashboardUser>
  private sharedViews: Map<string, SharedView>
  private comments: Map<string, Comment[]>
  private annotations: Map<string, Annotation[]>
  private cursorPositions: Map<string, { x: number; y: number }>

  private constructor() {
    const credential = new DefaultAzureCredential()
    this.pubsubClient = new WebPubSubClient(
      process.env.AZURE_PUBSUB_CONNECTION_STRING!,
      'dashboard'
    )
    this.serviceClient = new WebPubSubServiceClient(
      process.env.AZURE_PUBSUB_CONNECTION_STRING!,
      'dashboard'
    )
    
    this.activeUsers = new Map()
    this.sharedViews = new Map()
    this.comments = new Map()
    this.annotations = new Map()
    this.cursorPositions = new Map()

    this.setupEventHandlers()
  }

  public static getInstance(): DashboardCollaborationService {
    if (!DashboardCollaborationService.instance) {
      DashboardCollaborationService.instance = new DashboardCollaborationService()
    }
    return DashboardCollaborationService.instance
  }

  private setupEventHandlers(): void {
    this.pubsubClient.on('connected', () => {
      console.log('Connected to collaboration service')
    })

    this.pubsubClient.on('disconnected', () => {
      console.log('Disconnected from collaboration service')
    })
  }

  public async joinDashboard(user: Omit<DashboardUser, 'status' | 'lastActive'>): Promise<string> {
    const userId = user.id
    const dashboardUser: DashboardUser = {
      ...user,
      status: 'online',
      lastActive: new Date()
    }

    this.activeUsers.set(userId, dashboardUser)
    
    await this.broadcastEvent({
      type: 'USER_JOINED',
      payload: dashboardUser
    })

    // Get connection credentials
    const token = await this.serviceClient.getClientAccessToken({
      userId,
      roles: ['dashboard-user']
    })

    return token.url
  }

  public async leaveDashboard(userId: string): Promise<void> {
    this.activeUsers.delete(userId)
    this.cursorPositions.delete(userId)

    await this.broadcastEvent({
      type: 'USER_LEFT',
      payload: { userId }
    })
  }

  public async updateUserStatus(
    userId: string,
    status: DashboardUser['status']
  ): Promise<void> {
    const user = this.activeUsers.get(userId)
    if (user) {
      user.status = status
      user.lastActive = new Date()
      this.activeUsers.set(userId, user)

      await this.broadcastEvent({
        type: 'USER_JOINED',
        payload: user
      })
    }
  }

  public async shareView(view: Omit<SharedView, 'id' | 'timestamp'>): Promise<string> {
    const viewId = uuidv4()
    const sharedView: SharedView = {
      ...view,
      id: viewId,
      timestamp: new Date()
    }

    this.sharedViews.set(viewId, sharedView)
    
    await this.broadcastEvent({
      type: 'VIEW_SHARED',
      payload: sharedView
    })

    return viewId
  }

  public async addComment(
    comment: Omit<Comment, 'id' | 'timestamp'>
  ): Promise<string> {
    const commentId = uuidv4()
    const newComment: Comment = {
      ...comment,
      id: commentId,
      timestamp: new Date()
    }

    const targetComments = this.comments.get(comment.targetId) || []
    targetComments.push(newComment)
    this.comments.set(comment.targetId, targetComments)

    await this.broadcastEvent({
      type: 'COMMENT_ADDED',
      payload: newComment
    })

    return commentId
  }

  public async addAnnotation(
    annotation: Omit<Annotation, 'id' | 'timestamp'>
  ): Promise<string> {
    const annotationId = uuidv4()
    const newAnnotation: Annotation = {
      ...annotation,
      id: annotationId,
      timestamp: new Date()
    }

    const targetAnnotations = this.annotations.get(annotation.targetId) || []
    targetAnnotations.push(newAnnotation)
    this.annotations.set(annotation.targetId, targetAnnotations)

    await this.broadcastEvent({
      type: 'ANNOTATION_ADDED',
      payload: newAnnotation
    })

    return annotationId
  }

  public async updateCursorPosition(
    userId: string,
    position: { x: number; y: number }
  ): Promise<void> {
    this.cursorPositions.set(userId, position)

    await this.broadcastEvent({
      type: 'CURSOR_MOVED',
      payload: { userId, position }
    })
  }

  public getActiveUsers(): DashboardUser[] {
    return Array.from(this.activeUsers.values())
  }

  public getSharedView(viewId: string): SharedView | undefined {
    return this.sharedViews.get(viewId)
  }

  public getComments(targetId: string): Comment[] {
    return this.comments.get(targetId) || []
  }

  public getAnnotations(targetId: string): Annotation[] {
    return this.annotations.get(targetId) || []
  }

  public getCursorPosition(userId: string): { x: number; y: number } | undefined {
    return this.cursorPositions.get(userId)
  }

  private async broadcastEvent(event: CollaborationEvent): Promise<void> {
    await this.pubsubClient.sendToAll(event)
  }

  public async subscribeToEvents(
    callback: (event: CollaborationEvent) => void
  ): Promise<() => void> {
    const handler = (event: CollaborationEvent) => {
      callback(event)
    }

    this.pubsubClient.on('message', handler)
    return () => {
      this.pubsubClient.off('message', handler)
    }
  }
}

export const dashboardCollaborationService = DashboardCollaborationService.getInstance()
