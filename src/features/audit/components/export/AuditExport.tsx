/**
 * @fileoverview Audit export component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { AuditExportProps } from '../../types/ui.types';

export function AuditExport({
  onExport,
  isExporting = false,
}: AuditExportProps) {
  const handleExport = async (format: 'CSV' | 'JSON' | 'PDF') => {
    try {
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isExporting}
          className="w-[140px]"
        >
          {isExporting ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Icons.download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[140px]">
        <DropdownMenuItem
          onClick={() => handleExport('CSV')}
          disabled={isExporting}
        >
          <Icons.fileText className="mr-2 h-4 w-4" />
          <span>CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('JSON')}
          disabled={isExporting}
        >
          <Icons.code className="mr-2 h-4 w-4" />
          <span>JSON</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('PDF')}
          disabled={isExporting}
        >
          <Icons.filePdf className="mr-2 h-4 w-4" />
          <span>PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 


