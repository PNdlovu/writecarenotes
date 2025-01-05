/**
 * @writecarenotes.com
 * @fileoverview Blog editor toolbar component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Toolbar component for the rich text editor with formatting controls
 * and image upload functionality. Supports common text formatting,
 * lists, tables, and media insertion.
 */

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toolbar } from '@/components/ui/Toolbar';
import { Separator } from '@/components/ui/Separator';
import { Tooltip } from '@/components/ui/Tooltip';
import { IconButton, Divider } from '@/components/ui';

interface EditorToolbarProps {
  editor: Editor | null;
  onImageUpload: (file: File) => Promise<void>;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onImageUpload,
}) => {
  if (!editor) {
    return null;
  }

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await onImageUpload(file);
      }
    };
    input.click();
  };

  const handleLinkClick = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleTableInsert = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
  };

  return (
    <Toolbar className="border-b p-2 flex flex-wrap gap-1 items-center">
      {/* Text Style Controls */}
      <div className="flex items-center space-x-1">
        <Tooltip title="Bold">
          <IconButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-200' : ''}
            size="small"
          >
            <Bold size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Italic">
          <IconButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-200' : ''}
            size="small"
          >
            <Italic size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Underline">
          <IconButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-gray-200' : ''}
            size="small"
          >
            <Underline size={18} />
          </IconButton>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* Heading Controls */}
      <div className="flex items-center space-x-1">
        <Tooltip title="Heading 1">
          <IconButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
            size="small"
          >
            <Heading1 size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Heading 2">
          <IconButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
            size="small"
          >
            <Heading2 size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Heading 3">
          <IconButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
            size="small"
          >
            <Heading3 size={18} />
          </IconButton>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* List Controls */}
      <div className="flex items-center space-x-1">
        <Tooltip title="Bullet List">
          <IconButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
            size="small"
          >
            <List size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Ordered List">
          <IconButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
            size="small"
          >
            <ListOrdered size={18} />
          </IconButton>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* Alignment Controls */}
      <div className="flex items-center space-x-1">
        <Tooltip title="Align Left">
          <IconButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
            size="small"
          >
            <AlignLeft size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Align Center">
          <IconButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
            size="small"
          >
            <AlignCenter size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Align Right">
          <IconButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
            size="small"
          >
            <AlignRight size={18} />
          </IconButton>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* Special Controls */}
      <div className="flex items-center space-x-1">
        <Tooltip title="Quote">
          <IconButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
            size="small"
          >
            <Quote size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Code Block">
          <IconButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'bg-gray-200' : ''}
            size="small"
          >
            <Code size={18} />
          </IconButton>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* Insert Controls */}
      <div className="flex items-center space-x-1">
        <Tooltip title="Insert Link">
          <IconButton
            onClick={handleLinkClick}
            className={editor.isActive('link') ? 'bg-gray-200' : ''}
            size="small"
          >
            <LinkIcon size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Insert Image">
          <IconButton
            onClick={handleImageClick}
            size="small"
          >
            <ImageIcon size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Insert Table">
          <IconButton
            onClick={handleTableInsert}
            size="small"
          >
            <TableIcon size={18} />
          </IconButton>
        </Tooltip>
      </div>
    </Toolbar>
  );
}; 