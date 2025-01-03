/**
 * @writecarenotes.com
 * @fileoverview Medication stock hook
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * React hook for managing medication stock with caching
 * and real-time updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/UseToast';
import { StockService } from '../services/stockService';
import type {
  MedicationStock,
  StockTransaction,
  StockCreateInput,
  StockUpdateInput,
  StockTransactionCreateInput,
  StockLevel,
  StockAlert,
} from '../types/stock';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';

const stockService = new StockService();

export function useStock() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  const { user } = useAuth();

  // Get stock by medication ID
  const useStockByMedication = (medicationId: string) => {
    return useQuery({
      queryKey: ['stock', 'medication', medicationId],
      queryFn: () => stockService.getStockByMedicationId(medicationId),
      enabled: !!medicationId,
    });
  };

  // Create stock
  const {
    mutateAsync: createStock,
    isLoading: isCreatingStock,
  } = useMutation({
    mutationFn: (data: StockCreateInput) =>
      stockService.createStock(organizationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['stock', 'medication', variables.medicationId]);
      toast({
        title: 'Stock created',
        description: 'The stock has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating stock',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update stock
  const {
    mutateAsync: updateStock,
    isLoading: isUpdatingStock,
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StockUpdateInput }) =>
      stockService.updateStock(id, data),
    onSuccess: (stock) => {
      queryClient.invalidateQueries(['stock', 'medication', stock.medicationId]);
      toast({
        title: 'Stock updated',
        description: 'The stock has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating stock',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete stock
  const {
    mutateAsync: deleteStock,
    isLoading: isDeletingStock,
  } = useMutation({
    mutationFn: (id: string) => stockService.deleteStock(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['stock']);
      toast({
        title: 'Stock deleted',
        description: 'The stock has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting stock',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get stock transactions
  const useStockTransactions = (stockId: string, limit?: number) => {
    return useQuery({
      queryKey: ['stock', 'transactions', stockId],
      queryFn: () => stockService.getStockTransactions(stockId, limit),
      enabled: !!stockId,
    });
  };

  // Create stock transaction
  const {
    mutateAsync: createStockTransaction,
    isLoading: isCreatingTransaction,
  } = useMutation({
    mutationFn: (data: StockTransactionCreateInput) =>
      stockService.createStockTransaction(organizationId, user.id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['stock', 'transactions', variables.stockId]);
      queryClient.invalidateQueries(['stock']);
      toast({
        title: 'Transaction recorded',
        description: 'The stock transaction has been recorded successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error recording transaction',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get expiring stock
  const {
    data: expiringStock,
    isLoading: isLoadingExpiringStock,
    error: expiringStockError,
  } = useQuery({
    queryKey: ['stock', 'expiring', organizationId],
    queryFn: () => stockService.getExpiringStock(organizationId),
    enabled: !!organizationId,
  });

  // Get low stock
  const {
    data: lowStock,
    isLoading: isLoadingLowStock,
    error: lowStockError,
  } = useQuery({
    queryKey: ['stock', 'low', organizationId],
    queryFn: () => stockService.getLowStock(organizationId),
    enabled: !!organizationId,
  });

  // Get critical stock
  const {
    data: criticalStock,
    isLoading: isLoadingCriticalStock,
    error: criticalStockError,
  } = useQuery({
    queryKey: ['stock', 'critical', organizationId],
    queryFn: () => stockService.getCriticalStock(organizationId),
    enabled: !!organizationId,
  });

  // Get stock level status
  const getStockLevelStatus = (stock: MedicationStock): StockLevel => {
    return stockService.getStockLevelStatus(stock);
  };

  // Get stock alerts
  const getStockAlerts = (stock: MedicationStock): StockAlert[] => {
    return stockService.getStockAlerts(stock);
  };

  return {
    // Queries
    useStockByMedication,
    useStockTransactions,

    // Data
    expiringStock: expiringStock || [],
    lowStock: lowStock || [],
    criticalStock: criticalStock || [],

    // Loading states
    isCreatingStock,
    isUpdatingStock,
    isDeletingStock,
    isCreatingTransaction,
    isLoadingExpiringStock,
    isLoadingLowStock,
    isLoadingCriticalStock,

    // Error states
    expiringStockError,
    lowStockError,
    criticalStockError,

    // Mutations
    createStock,
    updateStock,
    deleteStock,
    createStockTransaction,

    // Utilities
    getStockLevelStatus,
    getStockAlerts,
  };
} 