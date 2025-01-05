/**
 * @fileoverview Accounting Store
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Global state management for the accounting module using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Account, CostCenter, JournalEntry } from '../types/accounting';

interface AccountingState {
  // Accounts
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (accountId: string) => void;

  // Cost Centers
  costCenters: CostCenter[];
  setCostCenters: (costCenters: CostCenter[]) => void;
  addCostCenter: (costCenter: CostCenter) => void;
  updateCostCenter: (costCenter: CostCenter) => void;
  deleteCostCenter: (costCenterId: string) => void;

  // Journal Entries
  journalEntries: JournalEntry[];
  setJournalEntries: (entries: JournalEntry[]) => void;
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (entry: JournalEntry) => void;
  deleteJournalEntry: (entryId: string) => void;

  // Filters and Sorting
  filters: {
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
    accountIds: string[];
    costCenterIds: string[];
    status: string[];
  };
  setFilters: (filters: AccountingState['filters']) => void;

  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  };
  setSorting: (sorting: AccountingState['sorting']) => void;

  // Loading States
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  // Error State
  error: string | null;
  setError: (error: string | null) => void;

  // Cache Management
  clearCache: () => void;
  refreshData: () => Promise<void>;
}

export const useAccountingStore = create<AccountingState>()(
  persist(
    (set, get) => ({
      // Accounts
      accounts: [],
      setAccounts: (accounts) => set({ accounts }),
      addAccount: (account) => set((state) => ({
        accounts: [...state.accounts, account]
      })),
      updateAccount: (account) => set((state) => ({
        accounts: state.accounts.map((a) =>
          a.id === account.id ? account : a
        )
      })),
      deleteAccount: (accountId) => set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== accountId)
      })),

      // Cost Centers
      costCenters: [],
      setCostCenters: (costCenters) => set({ costCenters }),
      addCostCenter: (costCenter) => set((state) => ({
        costCenters: [...state.costCenters, costCenter]
      })),
      updateCostCenter: (costCenter) => set((state) => ({
        costCenters: state.costCenters.map((c) =>
          c.id === costCenter.id ? costCenter : c
        )
      })),
      deleteCostCenter: (costCenterId) => set((state) => ({
        costCenters: state.costCenters.filter((c) => c.id !== costCenterId)
      })),

      // Journal Entries
      journalEntries: [],
      setJournalEntries: (entries) => set({ journalEntries: entries }),
      addJournalEntry: (entry) => set((state) => ({
        journalEntries: [...state.journalEntries, entry]
      })),
      updateJournalEntry: (entry) => set((state) => ({
        journalEntries: state.journalEntries.map((e) =>
          e.id === entry.id ? entry : e
        )
      })),
      deleteJournalEntry: (entryId) => set((state) => ({
        journalEntries: state.journalEntries.filter((e) => e.id !== entryId)
      })),

      // Filters
      filters: {
        dateRange: {
          start: null,
          end: null
        },
        accountIds: [],
        costCenterIds: [],
        status: []
      },
      setFilters: (filters) => set({ filters }),

      // Sorting
      sorting: {
        field: 'date',
        direction: 'desc'
      },
      setSorting: (sorting) => set({ sorting }),

      // Loading State
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),

      // Error State
      error: null,
      setError: (error) => set({ error }),

      // Cache Management
      clearCache: () => {
        set({
          accounts: [],
          costCenters: [],
          journalEntries: [],
          filters: {
            dateRange: {
              start: null,
              end: null
            },
            accountIds: [],
            costCenterIds: [],
            status: []
          },
          sorting: {
            field: 'date',
            direction: 'desc'
          },
          error: null
        });
      },

      // Data Refresh
      refreshData: async () => {
        const state = get();
        state.setIsLoading(true);
        state.setError(null);

        try {
          // Fetch fresh data from API
          const [accounts, costCenters, journalEntries] = await Promise.all([
            fetch('/api/accounting/accounts').then(res => res.json()),
            fetch('/api/accounting/cost-centers').then(res => res.json()),
            fetch('/api/accounting/journal-entries').then(res => res.json())
          ]);

          // Update store
          state.setAccounts(accounts);
          state.setCostCenters(costCenters);
          state.setJournalEntries(journalEntries);
        } catch (error) {
          state.setError(error instanceof Error ? error.message : 'Failed to refresh data');
        } finally {
          state.setIsLoading(false);
        }
      }
    }),
    {
      name: 'accounting-store',
      partialize: (state) => ({
        accounts: state.accounts,
        costCenters: state.costCenters,
        filters: state.filters,
        sorting: state.sorting
      })
    }
  )
); 