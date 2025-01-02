/**
 * @writecarenotes.com
 * @fileoverview Supplier list component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying and managing medication suppliers
 * with filtering and sorting capabilities.
 */

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Form/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSuppliers } from '../../hooks/useSuppliers';
import { 
  Plus,
  Search,
  MoreVertical,
  Phone,
  Mail,
  Globe,
  Trash2,
  Edit,
  AlertTriangle
} from 'lucide-react';
import type { MedicationSupplier } from '../../types';

export function SupplierList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<MedicationSupplier | null>(null);

  const {
    suppliers,
    isLoadingSuppliers,
    suppliersError,
    deleteSupplier,
    isDeletingSupplier,
    getMainContact,
    getOrderMethodLabel
  } = useSuppliers();

  const filteredSuppliers = suppliers?.filter(supplier => {
    const searchString = `
      ${supplier.name}
      ${supplier.accountNumber || ''}
      ${supplier.email}
      ${supplier.phone}
      ${supplier.contacts.map(c => `${c.name} ${c.role}`).join(' ')}
    `.toLowerCase();
    
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleDeleteClick = (supplier: MedicationSupplier) => {
    setSelectedSupplier(supplier);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSupplier) {
      await deleteSupplier(selectedSupplier.id);
      setDeleteConfirmOpen(false);
      setSelectedSupplier(null);
    }
  };

  if (isLoadingSuppliers) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">Loading suppliers...</p>
      </div>
    );
  }

  if (suppliersError) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <p>Error loading suppliers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Suppliers</h2>
          <p className="text-sm text-muted-foreground">
            Manage medication suppliers and their contact information
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Order Methods</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Main Contact</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No suppliers found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers?.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">
                    {supplier.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {supplier.phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {supplier.email}
                      </div>
                      {supplier.website && (
                        <div className="flex items-center gap-1 text-sm">
                          <Globe className="h-3 w-3" />
                          <a 
                            href={supplier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {supplier.orderMethods.map((method) => (
                        <Badge
                          key={method}
                          variant="secondary"
                          className="text-xs"
                        >
                          {getOrderMethodLabel(method)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {supplier.accountNumber || '-'}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const mainContact = getMainContact(supplier);
                      if (!mainContact) return '-';
                      return (
                        <div className="text-sm">
                          <div>{mainContact.name}</div>
                          <div className="text-muted-foreground">
                            {mainContact.role}
                          </div>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(supplier)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Supplier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedSupplier?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeletingSupplier}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeletingSupplier}
            >
              {isDeletingSupplier ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 