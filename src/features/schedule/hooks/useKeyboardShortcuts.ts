import { useEffect, useCallback } from 'react';
import { useHandoverStore } from '../stores/handover-store';

type ShortcutAction =
  | 'SAVE'
  | 'NEW_TASK'
  | 'NEW_SESSION'
  | 'SEARCH'
  | 'REFRESH'
  | 'PRINT'
  | 'EXPORT'
  | 'UNDO'
  | 'REDO'
  | 'SELECT_ALL'
  | 'COPY'
  | 'PASTE'
  | 'DELETE';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: ShortcutAction;
}

const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  { key: 's', ctrlKey: true, description: 'Save changes', action: 'SAVE' },
  { key: 't', ctrlKey: true, description: 'New task', action: 'NEW_TASK' },
  { key: 'n', ctrlKey: true, description: 'New session', action: 'NEW_SESSION' },
  { key: 'f', ctrlKey: true, description: 'Search', action: 'SEARCH' },
  { key: 'r', ctrlKey: true, description: 'Refresh', action: 'REFRESH' },
  { key: 'p', ctrlKey: true, description: 'Print', action: 'PRINT' },
  { key: 'e', ctrlKey: true, description: 'Export', action: 'EXPORT' },
  { key: 'z', ctrlKey: true, description: 'Undo', action: 'UNDO' },
  {
    key: 'z',
    ctrlKey: true,
    shiftKey: true,
    description: 'Redo',
    action: 'REDO',
  },
  { key: 'a', ctrlKey: true, description: 'Select all', action: 'SELECT_ALL' },
  { key: 'c', ctrlKey: true, description: 'Copy', action: 'COPY' },
  { key: 'v', ctrlKey: true, description: 'Paste', action: 'PASTE' },
  { key: 'Delete', description: 'Delete selected', action: 'DELETE' },
];

export const useKeyboardShortcuts = (
  customShortcuts: ShortcutConfig[] = []
) => {
  const store = useHandoverStore();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const shortcuts = [...DEFAULT_SHORTCUTS, ...customShortcuts];
      const matchingShortcut = shortcuts.find(
        (shortcut) =>
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey
      );

      if (matchingShortcut) {
        event.preventDefault();
        executeAction(matchingShortcut.action, store);
      }
    },
    [customShortcuts, store]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getShortcutList = () => {
    return [...DEFAULT_SHORTCUTS, ...customShortcuts].map((shortcut) => ({
      ...shortcut,
      display: formatShortcutDisplay(shortcut),
    }));
  };

  return {
    shortcuts: getShortcutList(),
  };
};

function formatShortcutDisplay(shortcut: ShortcutConfig): string {
  const parts: string[] = [];
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
}

function executeAction(action: ShortcutAction, store: any) {
  switch (action) {
    case 'SAVE':
      store.saveCurrentSession();
      break;
    case 'NEW_TASK':
      store.createNewTask();
      break;
    case 'NEW_SESSION':
      store.createNewSession();
      break;
    case 'SEARCH':
      store.openSearch();
      break;
    case 'REFRESH':
      store.refreshCurrentSession();
      break;
    case 'PRINT':
      store.printCurrentSession();
      break;
    case 'EXPORT':
      store.exportCurrentSession();
      break;
    case 'UNDO':
      store.undo();
      break;
    case 'REDO':
      store.redo();
      break;
    case 'SELECT_ALL':
      store.selectAllItems();
      break;
    case 'COPY':
      store.copySelectedItems();
      break;
    case 'PASTE':
      store.pasteItems();
      break;
    case 'DELETE':
      store.deleteSelectedItems();
      break;
  }
}
