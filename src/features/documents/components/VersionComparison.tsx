import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DocumentVersion } from '@prisma/client';
import { formatDiffForHTML, formatSideBySideDiff, formatWordDiff } from '@/lib/diff';
import { ChevronDown, ChevronRight } from 'lucide-react';

type DiffViewType = 'unified' | 'split' | 'word';

interface VersionComparisonProps {
  documentId: string;
  versions: DocumentVersion[];
  filename?: string;
}

interface CollapsibleSectionProps {
  section: {
    startLine: number;
    endLine: number;
    changeCount: number;
    type: 'modified' | 'unchanged';
  };
  children: React.ReactNode;
}

function CollapsibleSection({ section, children }: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(section.type === 'unchanged');
  const contentRef = React.useRef<HTMLDivElement>(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  React.useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = isCollapsed
        ? '0'
        : `${contentRef.current.scrollHeight}px`;
    }
  }, [isCollapsed]);

  return (
    <div className={`diff-section ${section.type}`}>
      <div className="diff-section-header" onClick={toggleCollapse}>
        <span>
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          Lines {section.startLine}-{section.endLine}
          {section.type === 'modified' && (
            <Badge variant="default" className="ml-2">
              {section.changeCount} changes
            </Badge>
          )}
        </span>
        <span className="text-sm text-gray-500">
          {isCollapsed ? 'Click to expand' : 'Click to collapse'}
        </span>
      </div>
      <div
        ref={contentRef}
        className={`diff-section-content ${isCollapsed ? 'collapsed' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}

export function VersionComparison({ documentId, versions, filename }: VersionComparisonProps) {
  const [versionA, setVersionA] = React.useState<string>('');
  const [versionB, setVersionB] = React.useState<string>('');
  const [viewType, setViewType] = React.useState<DiffViewType>('unified');

  const { data: diffResult, isLoading } = useQuery({
    queryKey: ['document-comparison', documentId, versionA, versionB],
    queryFn: async () => {
      if (!versionA || !versionB) return null;
      const response = await fetch(
        `/api/documents/${documentId}/compare?versionA=${versionA}&versionB=${versionB}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch comparison');
      }
      return response.json();
    },
    enabled: Boolean(versionA && versionB),
  });

  const renderDiffView = () => {
    if (!diffResult) return null;

    switch (viewType) {
      case 'split': {
        const { left, right } = formatSideBySideDiff(diffResult.changes, filename);
        return (
          <div className="diff-container">
            <div className="diff-pane">
              <div className="p-4">
                <h3 className="text-sm font-medium mb-2">Version {versionA}</h3>
                {diffResult.metadata.sections.map((section, index) => (
                  <CollapsibleSection key={index} section={section}>
                    <div
                      className="space-y-1"
                      dangerouslySetInnerHTML={{
                        __html: left.slice(section.startLine - 1, section.endLine).join(''),
                      }}
                    />
                  </CollapsibleSection>
                ))}
              </div>
            </div>
            <div className="diff-pane">
              <div className="p-4">
                <h3 className="text-sm font-medium mb-2">Version {versionB}</h3>
                {diffResult.metadata.sections.map((section, index) => (
                  <CollapsibleSection key={index} section={section}>
                    <div
                      className="space-y-1"
                      dangerouslySetInnerHTML={{
                        __html: right.slice(section.startLine - 1, section.endLine).join(''),
                      }}
                    />
                  </CollapsibleSection>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case 'word':
        return (
          <div
            className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg"
            dangerouslySetInnerHTML={{
              __html: formatWordDiff(diffResult.wordChanges || []),
            }}
          />
        );
      default:
        return diffResult.metadata.sections.map((section, index) => (
          <CollapsibleSection key={index} section={section}>
            <div
              className="font-mono text-sm whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: formatDiffForHTML(
                  diffResult.changes.slice(section.startLine - 1, section.endLine),
                  filename
                ),
              }}
            />
          </CollapsibleSection>
        ));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Version A</label>
          <Select value={versionA} onValueChange={setVersionA}>
            <SelectTrigger>
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version) => (
                <SelectItem key={version.version} value={version.version.toString()}>
                  Version {version.version} ({new Date(version.createdAt).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Version B</label>
          <Select value={versionB} onValueChange={setVersionB}>
            <SelectTrigger>
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version) => (
                <SelectItem key={version.version} value={version.version.toString()}>
                  Version {version.version} ({new Date(version.createdAt).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <div>Loading comparison...</div>}

      {diffResult && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparison Summary</CardTitle>
              <CardDescription>
                Changes between version {versionA} and {versionB}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default" className="bg-green-500">
                  +{diffResult.metadata.addedLines} lines added
                </Badge>
                <Badge variant="default" className="bg-red-500">
                  -{diffResult.metadata.removedLines} lines removed
                </Badge>
                <Badge variant="default" className="bg-gray-500">
                  {diffResult.metadata.unchangedLines} lines unchanged
                </Badge>
                <Badge variant="default" className="bg-blue-500">
                  {diffResult.metadata.addedWords} words added
                </Badge>
                <Badge variant="default" className="bg-orange-500">
                  {diffResult.metadata.removedWords} words removed
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="diff-controls">
            <RadioGroup
              value={viewType}
              onValueChange={(value) => setViewType(value as DiffViewType)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unified" id="unified" />
                <Label htmlFor="unified">Unified View</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="split" id="split" />
                <Label htmlFor="split">Side by Side</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="word" id="word" />
                <Label htmlFor="word">Word-level Changes</Label>
              </div>
            </RadioGroup>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Changes</CardTitle>
            </CardHeader>
            <CardContent>
              {renderDiffView()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


