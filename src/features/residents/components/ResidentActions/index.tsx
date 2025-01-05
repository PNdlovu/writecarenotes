'use client';

/**
 * @writecarenotes.com
 * @fileoverview Resident actions component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying primary actions related to resident management
 * such as adding new residents, importing data, and generating reports.
 */

import React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Icons } from '@/components/ui/Icons';

export function ResidentActions() {
  return (
    <div className="flex items-center gap-4">
      <Button>
        <Icons.plus className="mr-2 h-4 w-4" />
        Add Resident
      </Button>
      
      <Button variant="outline">
        <Icons.import className="mr-2 h-4 w-4" />
        Import
      </Button>
      
      <Button variant="outline">
        <Icons.report className="mr-2 h-4 w-4" />
        Reports
      </Button>
    </div>
  );
} 