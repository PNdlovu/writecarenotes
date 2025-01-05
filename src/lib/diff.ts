import { diffLines, diffWords, Change } from 'diff';
import { DocumentVersion } from '@prisma/client';
import { detectLanguage, highlightDiff, highlightCode } from './syntax';

export interface DiffResult {
  changes: Change[];
  wordChanges?: Change[];
  metadata: {
    addedLines: number;
    removedLines: number;
    unchangedLines: number;
    addedWords: number;
    removedWords: number;
    unchangedWords: number;
    sections: Array<{
      startLine: number;
      endLine: number;
      changeCount: number;
      type: 'modified' | 'unchanged';
    }>;
  };
}

export function identifySections(changes: Change[]): Array<{
  startLine: number;
  endLine: number;
  changeCount: number;
  type: 'modified' | 'unchanged';
}> {
  const sections = [];
  let currentSection = {
    startLine: 1,
    endLine: 1,
    changeCount: 0,
    type: 'unchanged' as const,
  };
  let lineNumber = 1;

  changes.forEach((change) => {
    const lines = change.value.split('\n').filter(Boolean);
    const hasChange = change.added || change.removed;

    if (hasChange && currentSection.type === 'unchanged' && currentSection.changeCount === 0) {
      // Start new modified section
      if (currentSection.startLine !== lineNumber) {
        sections.push({
          ...currentSection,
          endLine: lineNumber - 1,
        });
      }
      currentSection = {
        startLine: lineNumber,
        endLine: lineNumber,
        changeCount: lines.length,
        type: 'modified',
      };
    } else if (!hasChange && currentSection.type === 'modified') {
      // Start new unchanged section
      sections.push({
        ...currentSection,
        endLine: lineNumber - 1,
      });
      currentSection = {
        startLine: lineNumber,
        endLine: lineNumber,
        changeCount: 0,
        type: 'unchanged',
      };
    } else {
      // Continue current section
      currentSection.endLine = lineNumber + lines.length - 1;
      if (hasChange) {
        currentSection.changeCount += lines.length;
      }
    }

    lineNumber += lines.length;
  });

  // Add final section
  sections.push(currentSection);

  return sections;
}

export function compareDocuments(oldContent: string, newContent: string): DiffResult {
  const changes = diffLines(oldContent, newContent);
  const wordChanges = diffWords(oldContent, newContent);
  
  const metadata = {
    addedLines: 0,
    removedLines: 0,
    unchangedLines: 0,
    addedWords: 0,
    removedWords: 0,
    unchangedWords: 0,
    sections: [] as Array<{
      startLine: number;
      endLine: number;
      changeCount: number;
      type: 'modified' | 'unchanged';
    }>,
  };

  // Calculate line-level changes
  changes.forEach((change) => {
    const lineCount = (change.value.match(/\n/g) || []).length + 1;
    if (change.added) {
      metadata.addedLines += lineCount;
    } else if (change.removed) {
      metadata.removedLines += lineCount;
    } else {
      metadata.unchangedLines += lineCount;
    }
  });

  // Calculate word-level changes
  wordChanges.forEach((change) => {
    const wordCount = change.value.trim().split(/\s+/).length;
    if (change.added) {
      metadata.addedWords += wordCount;
    } else if (change.removed) {
      metadata.removedWords += wordCount;
    } else {
      metadata.unchangedWords += wordCount;
    }
  });

  // Identify sections for collapsible regions
  metadata.sections = identifySections(changes);

  return { changes, wordChanges, metadata };
}

export function compareDocumentVersions(
  versions: DocumentVersion[],
  versionA: number,
  versionB: number
): DiffResult | null {
  const oldVersion = versions.find((v) => v.version === versionA);
  const newVersion = versions.find((v) => v.version === versionB);

  if (!oldVersion || !newVersion) {
    return null;
  }

  return compareDocuments(oldVersion.content, newVersion.content);
}

export function formatDiffForHTML(changes: Change[], filename?: string): string {
  const language = filename ? detectLanguage(filename) : 'plaintext';
  const html = changes
    .map((change) => {
      const lines = change.value.split('\n').filter(Boolean);
      if (change.added) {
        return lines
          .map((line) => `<div class="diff-line diff-added">+ ${line}</div>`)
          .join('');
      }
      if (change.removed) {
        return lines
          .map((line) => `<div class="diff-line diff-removed">- ${line}</div>`)
          .join('');
      }
      return lines
        .map((line) => `<div class="diff-line diff-unchanged">&nbsp; ${line}</div>`)
        .join('');
    })
    .join('');

  return highlightDiff(html, language);
}

export function formatSideBySideDiff(changes: Change[], filename?: string): { left: string[]; right: string[] } {
  const language = filename ? detectLanguage(filename) : 'plaintext';
  const left: string[] = [];
  const right: string[] = [];
  let leftLineNumber = 1;
  let rightLineNumber = 1;

  changes.forEach((change) => {
    const lines = change.value.split('\n').filter(Boolean);
    
    if (change.removed) {
      lines.forEach((line) => {
        const highlightedLine = highlightCode(line, language);
        left.push(`<div class="diff-line diff-removed" data-line="${leftLineNumber}">${highlightedLine}</div>`);
        right.push('<div class="diff-line diff-placeholder"></div>');
        leftLineNumber++;
      });
    } else if (change.added) {
      lines.forEach((line) => {
        const highlightedLine = highlightCode(line, language);
        left.push('<div class="diff-line diff-placeholder"></div>');
        right.push(`<div class="diff-line diff-added" data-line="${rightLineNumber}">${highlightedLine}</div>`);
        rightLineNumber++;
      });
    } else {
      lines.forEach((line) => {
        const highlightedLine = highlightCode(line, language);
        left.push(`<div class="diff-line" data-line="${leftLineNumber}">${highlightedLine}</div>`);
        right.push(`<div class="diff-line" data-line="${rightLineNumber}">${highlightedLine}</div>`);
        leftLineNumber++;
        rightLineNumber++;
      });
    }
  });

  return { left, right };
}

export function formatWordDiff(wordChanges: Change[]): string {
  return wordChanges
    .map((change) => {
      if (change.added) {
        return `<span class="word-diff-added">${change.value}</span>`;
      }
      if (change.removed) {
        return `<span class="word-diff-removed">${change.value}</span>`;
      }
      return change.value;
    })
    .join('');
}


