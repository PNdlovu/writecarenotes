/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base category tree
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Hierarchical category tree component for the knowledge base with
 * drag-and-drop support and inline editing.
 */

import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { useCategory } from '../hooks/useCategory'
import { type Category } from '../types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Icons } from '@/components/icons'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface CategoryTreeProps {
  selectedId?: string
  onSelect?: (id: string) => void
  editable?: boolean
}

interface CategoryNodeProps {
  category: Category
  level: number
  selectedId?: string
  onSelect?: (id: string) => void
  editable?: boolean
}

function CategoryNode({ category, level, selectedId, onSelect, editable }: CategoryNodeProps) {
  const { t } = useTranslation()
  const { updateCategory, deleteCategory, moveCategory } = useCategory()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(category.name)

  // Drag and drop setup
  const [{ isDragging }, drag] = useDrag({
    type: 'CATEGORY',
    item: { id: category.id, parentId: category.parentId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const [{ isOver }, drop] = useDrop({
    accept: 'CATEGORY',
    drop: (item: { id: string, parentId: string }) => {
      if (item.id !== category.id && item.parentId !== category.id) {
        moveCategory(item.id, category.id)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  })

  const handleSave = async () => {
    await updateCategory(category.id, { name })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    await deleteCategory(category.id)
  }

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={cn(
        'py-2 pl-4',
        isDragging && 'opacity-50',
        isOver && 'bg-accent'
      )}
      style={{ marginLeft: `${level * 1.5}rem` }}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
            ) : (
              <Button
                variant={selectedId === category.id ? 'secondary' : 'ghost'}
                className="justify-start w-full"
                onClick={() => onSelect?.(category.id)}
              >
                <Icons.folder className="w-4 h-4 mr-2" />
                {category.name}
                <Badge variant="outline" className="ml-2">
                  {category.metadata.articleCount}
                </Badge>
              </Button>
            )}
          </div>
        </ContextMenuTrigger>
        {editable && (
          <ContextMenuContent>
            <ContextMenuItem onClick={() => setIsEditing(true)}>
              {t('kb.categories.edit')}
            </ContextMenuItem>
            <ContextMenuItem
              className="text-destructive"
              onClick={handleDelete}
            >
              {t('kb.categories.delete')}
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>
    </div>
  )
}

export function CategoryTree({ selectedId, onSelect, editable }: CategoryTreeProps) {
  const { t } = useTranslation()
  const { categories, createCategory } = useCategory()
  const [isCreating, setIsCreating] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    parentId: undefined as string | undefined
  })

  // Organize categories into a tree structure
  const buildCategoryTree = (categories: Category[], parentId?: string): Category[] => {
    return categories
      .filter(category => category.parentId === parentId)
      .sort((a, b) => a.order - b.order)
  }

  const renderCategories = (categories: Category[], level: number = 0) => {
    return categories.map(category => (
      <div key={category.id}>
        <CategoryNode
          category={category}
          level={level}
          selectedId={selectedId}
          onSelect={onSelect}
          editable={editable}
        />
        {renderCategories(buildCategoryTree(categories, category.id), level + 1)}
      </div>
    ))
  }

  const handleCreateCategory = async () => {
    await createCategory(newCategory)
    setIsCreating(false)
    setNewCategory({ name: '', parentId: undefined })
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="border rounded-lg">
        <ScrollArea className="h-[400px]">
          {renderCategories(buildCategoryTree(categories))}
        </ScrollArea>

        {editable && (
          <div className="p-4 border-t">
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Icons.plus className="w-4 h-4 mr-2" />
                  {t('kb.categories.create')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('kb.categories.createTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('kb.categories.createDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label>{t('kb.categories.name')}</label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label>{t('kb.categories.parent')}</label>
                    <select
                      value={newCategory.parentId || ''}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          parentId: e.target.value || undefined
                        })
                      }
                      className="w-full"
                    >
                      <option value="">{t('kb.categories.noParent')}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleCreateCategory}>
                    {t('common.create')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </DndProvider>
  )
}
