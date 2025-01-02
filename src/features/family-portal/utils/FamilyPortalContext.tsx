import React, { createContext, useContext, useState, useCallback } from 'react';
import { FamilyMember } from '../types/family-member';
import { ResidentUpdate } from '../types/updates';
import { Visit } from '../types/visits';
import { Message } from '../types/communication';
import { useFamilyPortal } from '../hooks/useFamilyPortal';

interface FamilyPortalContextType {
  familyMember: FamilyMember | null;
  updates: ResidentUpdate[];
  visits: Visit[];
  messages: Message[];
  loading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  scheduleVisit: (visitData: Partial<Visit>) => Promise<void>;
  sendMessage: (messageData: Partial<Message>) => Promise<void>;
  startVideoCall: () => Promise<void>;
}

const FamilyPortalContext = createContext<FamilyPortalContextType | undefined>(undefined);

interface FamilyPortalProviderProps {
  children: React.ReactNode;
  residentId: string;
  familyMemberId: string;
}

export const FamilyPortalProvider: React.FC<FamilyPortalProviderProps> = ({
  children,
  residentId,
  familyMemberId,
}) => {
  const [familyMember, setFamilyMember] = useState<FamilyMember | null>(null);
  const [updates, setUpdates] = useState<ResidentUpdate[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const {
    loading,
    error,
    getFamilyMemberProfile,
    getUpdates,
    scheduleVisit,
    sendMessage,
    startVideoCall,
  } = useFamilyPortal({ residentId, familyMemberId });

  const refreshData = useCallback(async () => {
    try {
      // Fetch all data in parallel
      await Promise.all([
        getFamilyMemberProfile(),
        getUpdates(),
        // Add other data fetching calls here
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  }, [getFamilyMemberProfile, getUpdates]);

  // Initialize data when the provider mounts
  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const value = {
    familyMember,
    updates,
    visits,
    messages,
    loading,
    error,
    refreshData,
    scheduleVisit,
    sendMessage,
    startVideoCall,
  };

  return (
    <FamilyPortalContext.Provider value={value}>
      {children}
    </FamilyPortalContext.Provider>
  );
};

export const useFamilyPortalContext = () => {
  const context = useContext(FamilyPortalContext);
  if (context === undefined) {
    throw new Error('useFamilyPortalContext must be used within a FamilyPortalProvider');
  }
  return context;
};


