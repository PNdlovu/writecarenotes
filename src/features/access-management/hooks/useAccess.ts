import { useCallback, useContext, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AccessManagementService } from '../services/accessManagementService'
import { AuthContext } from '@/features/auth/contexts/AuthContext'
import { OrganizationContext } from '@/features/organizations/contexts/OrganizationContext'
import {
    AccessRequest,
    ResourceType,
    PermissionAction,
    Role,
    AccessDecision
} from '../types'

interface UseAccessProps {
    resourceType: ResourceType
    resourceId?: string
    action: PermissionAction
}

export function useAccess({ resourceType, resourceId, action }: UseAccessProps) {
    const { user } = useContext(AuthContext)
    const { organization, careHome } = useContext(OrganizationContext)
    const queryClient = useQueryClient()
    const accessService = AccessManagementService.getInstance()

    const accessRequest: AccessRequest = useMemo(() => ({
        userId: user?.id || '',
        userRoles: user?.roles || [],
        resourceType,
        resourceId: resourceId || '',
        action,
        context: {
            organizationId: organization?.id || '',
            careHomeId: careHome?.id,
            region: organization?.region || 'ENGLAND',
            timestamp: new Date(),
            deviceType: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
        }
    }), [user, resourceType, resourceId, action, organization, careHome])

    // Check access using React Query
    const { data: accessDecision, isLoading } = useQuery({
        queryKey: ['access', accessRequest],
        queryFn: () => accessService.checkAccess(accessRequest),
        enabled: !!user && !!organization
    })

    // Helper function to check specific roles
    const hasRole = useCallback((role: Role | Role[]) => {
        const roles = Array.isArray(role) ? role : [role]
        return user?.roles.some(r => roles.includes(r as Role)) || false
    }, [user])

    // Request emergency access
    const requestEmergencyAccess = useCallback(async (reason: string): Promise<void> => {
        if (!user || !resourceId) return

        try {
            await accessService.requestEmergencyAccess(
                user.id,
                resourceType,
                resourceId,
                reason
            )
            // Invalidate access queries to reflect emergency access
            queryClient.invalidateQueries({ queryKey: ['access'] })
        } catch (error) {
            console.error('Error requesting emergency access:', error)
            throw error
        }
    }, [user, resourceType, resourceId, queryClient])

    return {
        // Access control
        isAllowed: accessDecision?.granted || false,
        isLoading,
        accessDecision,
        
        // Role checking
        hasRole,
        roles: user?.roles || [],
        
        // Emergency access
        requestEmergencyAccess,
        
        // Raw access request (useful for debugging)
        accessRequest
    }
}

// Utility hook for checking multiple permissions at once
export function useMultiAccess(requests: UseAccessProps[]) {
    const results = requests.map(request => useAccess(request))
    
    return {
        isAllowed: results.every(r => r.isAllowed),
        isLoading: results.some(r => r.isLoading),
        individual: results
    }
}

// Higher-order component for access control
export function withAccess<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    accessProps: UseAccessProps
) {
    return function WithAccessWrapper(props: P) {
        const { isAllowed, isLoading } = useAccess(accessProps)

        if (isLoading) return null
        if (!isAllowed) return null

        return <WrappedComponent {...props} />
    }
}
