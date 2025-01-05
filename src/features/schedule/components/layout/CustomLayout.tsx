import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Button,
  Card,
  Dialog,
  Icon,
  Input,
  Select,
  Switch,
} from '@/components/ui';

interface LayoutConfig {
  id: string;
  name: string;
  components: LayoutComponent[];
  grid: {
    columns: number;
    rows: number;
  };
  theme: 'light' | 'dark';
  compact: boolean;
}

interface LayoutComponent {
  id: string;
  type: string;
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: Record<string, any>;
}

interface CustomLayoutProps {
  layouts: LayoutConfig[];
  activeLayout: string;
  onLayoutChange: (layoutId: string) => void;
  onLayoutSave: (layout: LayoutConfig) => void;
  onLayoutDelete: (layoutId: string) => void;
}

export const CustomLayout: React.FC<CustomLayoutProps> = ({
  layouts,
  activeLayout,
  onLayoutChange,
  onLayoutSave,
  onLayoutDelete,
}) => {
  const [editingLayout, setEditingLayout] = useState<LayoutConfig | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination || !editingLayout) return;

    const components = Array.from(editingLayout.components);
    const [reorderedComponent] = components.splice(result.source.index, 1);
    components.splice(result.destination.index, 0, reorderedComponent);

    setEditingLayout({
      ...editingLayout,
      components,
    });
  };

  const addComponent = (type: string) => {
    if (!editingLayout) return;

    const newComponent: LayoutComponent = {
      id: crypto.randomUUID(),
      type,
      title: `New ${type}`,
      position: {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      },
      config: {},
    };

    setEditingLayout({
      ...editingLayout,
      components: [...editingLayout.components, newComponent],
    });
  };

  const updateComponent = (
    componentId: string,
    updates: Partial<LayoutComponent>
  ) => {
    if (!editingLayout) return;

    setEditingLayout({
      ...editingLayout,
      components: editingLayout.components.map((component) =>
        component.id === componentId
          ? { ...component, ...updates }
          : component
      ),
    });
  };

  const deleteComponent = (componentId: string) => {
    if (!editingLayout) return;

    setEditingLayout({
      ...editingLayout,
      components: editingLayout.components.filter(
        (component) => component.id !== componentId
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select
            value={activeLayout}
            onChange={(e) => onLayoutChange(e.target.value)}
            className="w-48"
          >
            {layouts.map((layout) => (
              <option key={layout.id} value={layout.id}>
                {layout.name}
              </option>
            ))}
          </Select>

          <Button
            variant="secondary"
            onClick={() => {
              setEditingLayout({
                id: crypto.randomUUID(),
                name: 'New Layout',
                components: [],
                grid: { columns: 12, rows: 12 },
                theme: 'light',
                compact: false,
              });
              setShowEditor(true);
            }}
          >
            <Icon name="plus" className="w-4 h-4 mr-2" />
            New Layout
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            onClick={() => {
              const layout = layouts.find((l) => l.id === activeLayout);
              if (layout) {
                setEditingLayout({ ...layout });
                setShowEditor(true);
              }
            }}
          >
            <Icon name="edit" className="w-4 h-4 mr-2" />
            Edit
          </Button>

          <Button
            variant="danger"
            onClick={() => onLayoutDelete(activeLayout)}
          >
            <Icon name="trash" className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Dialog
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        title={editingLayout?.id ? 'Edit Layout' : 'New Layout'}
        size="lg"
      >
        {editingLayout && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  value={editingLayout.name}
                  onChange={(e) =>
                    setEditingLayout({
                      ...editingLayout,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <Select
                  value={editingLayout.theme}
                  onChange={(e) =>
                    setEditingLayout({
                      ...editingLayout,
                      theme: e.target.value as 'light' | 'dark',
                    })
                  }
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grid Columns
                </label>
                <Input
                  type="number"
                  value={editingLayout.grid.columns}
                  onChange={(e) =>
                    setEditingLayout({
                      ...editingLayout,
                      grid: {
                        ...editingLayout.grid,
                        columns: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grid Rows
                </label>
                <Input
                  type="number"
                  value={editingLayout.grid.rows}
                  onChange={(e) =>
                    setEditingLayout({
                      ...editingLayout,
                      grid: {
                        ...editingLayout.grid,
                        rows: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Switch
                checked={editingLayout.compact}
                onChange={(checked) =>
                  setEditingLayout({
                    ...editingLayout,
                    compact: checked,
                  })
                }
                label="Compact Mode"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Components</h3>

              <div className="flex space-x-2 mb-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addComponent('TASKS')}
                >
                  Add Tasks
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addComponent('QUALITY')}
                >
                  Add Quality
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addComponent('DOCUMENTS')}
                >
                  Add Documents
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addComponent('NOTES')}
                >
                  Add Notes
                </Button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="components">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {editingLayout.components.map((component, index) => (
                        <Draggable
                          key={component.id}
                          draggableId={component.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <Icon
                                      name="grip-vertical"
                                      className="w-4 h-4 text-gray-400"
                                    />
                                    <Input
                                      value={component.title}
                                      onChange={(e) =>
                                        updateComponent(component.id, {
                                          title: e.target.value,
                                        })
                                      }
                                      className="w-48"
                                    />
                                    <Select
                                      value={component.type}
                                      onChange={(e) =>
                                        updateComponent(component.id, {
                                          type: e.target.value,
                                        })
                                      }
                                      className="w-32"
                                    >
                                      <option value="TASKS">Tasks</option>
                                      <option value="QUALITY">Quality</option>
                                      <option value="DOCUMENTS">Documents</option>
                                      <option value="NOTES">Notes</option>
                                    </Select>
                                  </div>

                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() =>
                                      deleteComponent(component.id)
                                    }
                                  >
                                    <Icon
                                      name="trash"
                                      className="w-4 h-4"
                                    />
                                  </Button>
                                </div>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => setShowEditor(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onLayoutSave(editingLayout);
                  setShowEditor(false);
                }}
              >
                Save Layout
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
