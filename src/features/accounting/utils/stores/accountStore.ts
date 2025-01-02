/**
 * @fileoverview Account Store
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Zustand store for managing account state with offline support
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useOfflineSync } from '../hooks/useOfflineSync';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  category: string;
  description?: string;
  isActive: boolean;
  parentAccountId?: string;
  vatCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AccountFilters {
  search?: string;
  type?: string;
  category?: string;
  isActive?: boolean;
}

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  filters: AccountFilters;
  fetchAccounts: (organizationId: string, filters?: AccountFilters) => Promise<void>;
  createAccount: (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Account>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  setFilters: (filters: AccountFilters) => void;
}

export const useAccountStore = create<AccountState>()(
  devtools(
    (set, get) => ({
      accounts: [],
      isLoading: false,
      error: null,
      filters: {},

      fetchAccounts: async (organizationId: string, filters?: AccountFilters) => {
        try {
          set({ isLoading: true, error: null });

          const queryParams = new URLSearchParams({
            organizationId,
            ...(filters?.search && { search: filters.search }),
            ...(filters?.type && { type: filters.type }),
            ...(filters?.category && { category: filters.category }),
            ...(filters?.isActive !== undefined && {
              isActive: filters.isActive.toString(),
            }),
          });

          const response = await fetch(
            `/api/accounting/accounts?${queryParams.toString()}`
          );

          if (!response.ok) {
            throw new Error('Failed to fetch accounts');
          }

          const data = await response.json();
          set({ accounts: data.accounts });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        } finally {
          set({ isLoading: false });
        }
      },

      createAccount: async (data) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch('/api/accounting/accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to create account');
          }

          const account = await response.json();
          set((state) => ({
            accounts: [...state.accounts, account],
          }));

          return account;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateAccount: async (id: string, data: Partial<Account>) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch(`/api/accounting/accounts`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, ...data }),
          });

          if (!response.ok) {
            throw new Error('Failed to update account');
          }

          const updatedAccount = await response.json();
          set((state) => ({
            accounts: state.accounts.map((account) =>
              account.id === id ? updatedAccount : account
            ),
          }));

          return updatedAccount;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteAccount: async (id: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch(
            `/api/accounting/accounts?id=${id}`,
            {
              method: 'DELETE',
            }
          );

          if (!response.ok) {
            throw new Error('Failed to delete account');
          }

          set((state) => ({
            accounts: state.accounts.filter((account) => account.id !== id),
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      setFilters: (filters: AccountFilters) => {
        set({ filters });
      },
    }),
    {
      name: 'account-store',
    }
  )
); 