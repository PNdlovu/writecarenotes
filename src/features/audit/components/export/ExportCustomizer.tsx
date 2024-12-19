/**
 * @fileoverview Export customization component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { format } from 'date-fns';
import {
  ExportFormat,
  ExportOptions,
  ExportField,
  PDFOptions,
  CSVOptions,
} from '../../types/export.types';

interface ExportCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  format: ExportFormat;
}

const DEFAULT_FIELDS: ExportField[] = [
  { key: 'timestamp', label: 'Timestamp', include: true },
  { key: 'action', label: 'Action', include: true },
  { key: 'entityType', label: 'Entity Type', include: true },
  { key: 'entityId', label: 'Entity ID', include: true },
  { key: 'actorId', label: 'Actor ID', include: true },
  { key: 'actorType', label: 'Actor Type', include: true },
  { key: 'status', label: 'Status', include: true },
  { key: 'organizationId', label: 'Organization ID', include: true },
  { key: 'facilityId', label: 'Facility ID', include: true },
  { key: 'changes', label: 'Changes', include: false },
  { key: 'details', label: 'Details', include: false },
];

export function ExportCustomizer({
  isOpen,
  onClose,
  onExport,
  format,
}: ExportCustomizerProps) {
  const [title, setTitle] = useState('Audit Log Report');
  const [subtitle, setSubtitle] = useState(`Generated on ${format(new Date(), 'PPpp')}`);
  const [fields, setFields] = useState<ExportField[]>(DEFAULT_FIELDS);
  const [dateFormat, setDateFormat] = useState('PPpp');
  const [filename, setFilename] = useState(`audit-logs-${format(new Date(), 'yyyy-MM-dd')}`);

  // PDF specific options
  const [pdfOptions, setPdfOptions] = useState<PDFOptions>({
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    headerOnEveryPage: true,
    footerOnEveryPage: true,
  });

  // CSV specific options
  const [csvOptions, setCsvOptions] = useState<CSVOptions>({
    delimiter: ',',
    includeHeaders: true,
    quoteStrings: true,
    dateFormat: 'PPpp',
  });

  const handleFieldToggle = (key: keyof typeof fields[0]) => {
    setFields(prev =>
      prev.map(field =>
        field.key === key ? { ...field, include: !field.include } : field
      )
    );
  };

  const handleExport = async () => {
    const options: ExportOptions = {
      format,
      customization: {
        title,
        subtitle,
        fields: fields.filter(f => f.include),
        dateFormat,
      },
      pdfOptions: format === 'PDF' ? pdfOptions : undefined,
      csvOptions: format === 'CSV' ? csvOptions : undefined,
      filename: `${filename}.${format.toLowerCase()}`,
    };

    await onExport(options);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Customize Export</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            {format === 'PDF' && <TabsTrigger value="pdf">PDF Options</TabsTrigger>}
            {format === 'CSV' && <TabsTrigger value="csv">CSV Options</TabsTrigger>}
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filename">Filename</Label>
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={dateFormat}
                  onValueChange={setDateFormat}
                >
                  <option value="PPpp">Full (Mar 21, 2024, 12:00 PM)</option>
                  <option value="PP">Date Only (Mar 21, 2024)</option>
                  <option value="pp">Time Only (12:00 PM)</option>
                  <option value="yyyy-MM-dd">ISO Date (2024-03-21)</option>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={field.include}
                    onCheckedChange={() => handleFieldToggle(field.key)}
                  />
                  <Label htmlFor={field.key}>{field.label}</Label>
                </div>
              ))}
            </div>
          </TabsContent>

          {format === 'PDF' && (
            <TabsContent value="pdf" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pageSize">Page Size</Label>
                  <Select
                    value={pdfOptions.pageSize}
                    onValueChange={(value) =>
                      setPdfOptions(prev => ({ ...prev, pageSize: value as any }))
                    }
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="orientation">Orientation</Label>
                  <Select
                    value={pdfOptions.orientation}
                    onValueChange={(value) =>
                      setPdfOptions(prev => ({ ...prev, orientation: value as any }))
                    }
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </Select>
                </div>
                <div>
                  <Label>Headers & Footers</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="headerOnEveryPage"
                        checked={pdfOptions.headerOnEveryPage}
                        onCheckedChange={(checked) =>
                          setPdfOptions(prev => ({ ...prev, headerOnEveryPage: !!checked }))
                        }
                      />
                      <Label htmlFor="headerOnEveryPage">Header on every page</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="footerOnEveryPage"
                        checked={pdfOptions.footerOnEveryPage}
                        onCheckedChange={(checked) =>
                          setPdfOptions(prev => ({ ...prev, footerOnEveryPage: !!checked }))
                        }
                      />
                      <Label htmlFor="footerOnEveryPage">Footer on every page</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {format === 'CSV' && (
            <TabsContent value="csv" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delimiter">Delimiter</Label>
                  <Select
                    value={csvOptions.delimiter}
                    onValueChange={(value) =>
                      setCsvOptions(prev => ({ ...prev, delimiter: value as any }))
                    }
                  >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab</option>
                  </Select>
                </div>
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeHeaders"
                        checked={csvOptions.includeHeaders}
                        onCheckedChange={(checked) =>
                          setCsvOptions(prev => ({ ...prev, includeHeaders: !!checked }))
                        }
                      />
                      <Label htmlFor="includeHeaders">Include headers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="quoteStrings"
                        checked={csvOptions.quoteStrings}
                        onCheckedChange={(checked) =>
                          setCsvOptions(prev => ({ ...prev, quoteStrings: !!checked }))
                        }
                      />
                      <Label htmlFor="quoteStrings">Quote strings</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 


