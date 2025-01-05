/**
 * @writecarenotes.com
 * @fileoverview Medication supplier hook
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * React hook for managing medication suppliers with caching
 * and real-time updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { SupplierService } from '../services/supplierService';
import type {
  MedicationSupplier,
  SupplierCreateInput,
  SupplierUpdateInput,
  OrderMethod,
} from '../types/supplier';
import { useOrganization } from '@/hooks/useOrganization';

const supplierService = new SupplierService();

export function useSuppliers() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();

  // Get all suppliers
  const {
    data: suppliersData,
    isLoading: isLoadingSuppliers,
    error: suppliersError,
  } = useQuery({
    queryKey: ['suppliers', organizationId],
    queryFn: () => supplierService.getSuppliers(organizationId),
    enabled: !!organizationId,
  });

  // Add supplier
  const {
    mutateAsync: addSupplier,
    isLoading: isAddingSupplier,
  } = useMutation({
    mutationFn: (data: SupplierCreateInput) =>
      supplierService.createSupplier(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers', organizationId]);
      toast({
        title: 'Supplier added',
        description: 'The supplier has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error adding supplier',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update supplier
  const {
    mutateAsync: updateSupplier,
    isLoading: isUpdatingSupplier,
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierUpdateInput }) =>
      supplierService.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers', organizationId]);
      toast({
        title: 'Supplier updated',
        description: 'The supplier has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating supplier',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete supplier
  const {
    mutateAsync: deleteSupplier,
    isLoading: isDeletingSupplier,
  } = useMutation({
    mutationFn: (id: string) => supplierService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers', organizationId]);
      toast({
        title: 'Supplier deleted',
        description: 'The supplier has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting supplier',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Search suppliers
  const {
    mutateAsync: searchSuppliers,
    isLoading: isSearchingSuppliers,
  } = useMutation({
    mutationFn: (searchTerm: string) =>
      supplierService.searchSuppliers(organizationId, searchTerm),
  });

  // Get suppliers by medication ID
  const useSuppliersByMedication = (medicationId: string) => {
    return useQuery({
      queryKey: ['suppliers', 'medication', medicationId],
      queryFn: () => supplierService.getSuppliersByMedicationId(medicationId),
      enabled: !!medicationId,
    });
  };

  // Link supplier to medication
  const {
    mutateAsync: linkSupplierToMedication,
    isLoading: isLinkingSupplier,
  } = useMutation({
    mutationFn: ({
      supplierId,
      medicationId,
    }: {
      supplierId: string;
      medicationId: string;
    }) => supplierService.linkSupplierToMedication(supplierId, medicationId),
    onSuccess: (_, { medicationId }) => {
      queryClient.invalidateQueries(['suppliers', 'medication', medicationId]);
      toast({
        title: 'Supplier linked',
        description: 'The supplier has been linked to the medication successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error linking supplier',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Unlink supplier from medication
  const {
    mutateAsync: unlinkSupplierFromMedication,
    isLoading: isUnlinkingSupplier,
  } = useMutation({
    mutationFn: ({
      supplierId,
      medicationId,
    }: {
      supplierId: string;
      medicationId: string;
    }) => supplierService.unlinkSupplierFromMedication(supplierId, medicationId),
    onSuccess: (_, { medicationId }) => {
      queryClient.invalidateQueries(['suppliers', 'medication', medicationId]);
      toast({
        title: 'Supplier unlinked',
        description: 'The supplier has been unlinked from the medication successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error unlinking supplier',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get main contact
  const getMainContact = (supplier: MedicationSupplier) => {
    return supplier.contacts.find(contact => contact.isMain);
  };

  // Get order method label
  const getOrderMethodLabel = (method: OrderMethod) => {
    return supplierService.getOrderMethodLabel(method);
  };

  return {
    // Data
    suppliers: suppliersData?.suppliers || [],
    total: suppliersData?.total || 0,

    // Loading states
    isLoadingSuppliers,
    isAddingSupplier,
    isUpdatingSupplier,
    isDeletingSupplier,
    isSearchingSuppliers,
    isLinkingSupplier,
    isUnlinkingSupplier,

    // Error states
    suppliersError,

    // Mutations
    addSupplier,
    updateSupplier,
    deleteSupplier,
    searchSuppliers,
    linkSupplierToMedication,
    unlinkSupplierFromMedication,

    // Hooks
    useSuppliersByMedication,

    // Utilities
    getMainContact,
    getOrderMethodLabel,
  };
} 