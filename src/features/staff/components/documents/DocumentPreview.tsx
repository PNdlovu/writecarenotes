import React, { useEffect, useState } from 'react';
import { Document as PDFDocument, Page } from 'react-pdf';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';

interface DocumentPreviewProps {
  fileUrl: string;
  fileType: string;
  className?: string;
}

export function DocumentPreview({ fileUrl, fileType, className }: DocumentPreviewProps) {
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [fileUrl]);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handleLoadError = (error: Error) => {
    console.error('Error loading document:', error);
    setError('Failed to load document preview');
    setLoading(false);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, numPages)));
  };

  const handleZoom = (newScale: string) => {
    setScale(parseFloat(newScale));
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!fileType.startsWith('application/pdf')) {
    return (
      <div className="flex items-center justify-center p-4">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Open file in new tab
        </a>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded-lg">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= numPages}
          >
            Next
          </Button>
        </div>
        <Select
          value={scale.toString()}
          onValueChange={handleZoom}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Zoom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">50%</SelectItem>
            <SelectItem value="0.75">75%</SelectItem>
            <SelectItem value="1.0">100%</SelectItem>
            <SelectItem value="1.25">125%</SelectItem>
            <SelectItem value="1.5">150%</SelectItem>
            <SelectItem value="2.0">200%</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative w-full overflow-auto bg-white rounded-lg shadow">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
        <PDFDocument
          file={fileUrl}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </PDFDocument>
      </div>
    </div>
  );
}


