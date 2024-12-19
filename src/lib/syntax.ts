import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';

const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.md': 'markdown',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.css': 'css',
  '.scss': 'scss',
  '.sql': 'sql',
  '.sh': 'bash',
  '.bash': 'bash',
};

export function detectLanguage(filename: string): string {
  const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return LANGUAGE_MAP[extension] || 'plaintext';
}

export function highlightCode(code: string, language: string): string {
  try {
    const lang = languages[language] ? language : 'plaintext';
    return highlight(code, languages[lang], lang);
  } catch (error) {
    console.error('Syntax highlighting error:', error);
    return code;
  }
}

export function highlightDiff(html: string, language: string): string {
  const codeRegex = />([^<]+)</g;
  return html.replace(codeRegex, (match, code) => {
    try {
      const highlighted = highlightCode(code, language);
      return `>${highlighted}<`;
    } catch (error) {
      return match;
    }
  });
}


