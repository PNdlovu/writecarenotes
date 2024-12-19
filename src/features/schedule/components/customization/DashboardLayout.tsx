import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface Widget {
  id: string;
  type: string;
  name: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  settings: {
    refreshInterval?: number;
    dataSource?: string;
    visualization?: string;
    filters?: Record<string, any>;
  };
}

interface Layout {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  widgets: Widget[];
  gridConfig: {
    columns: number;
    rowHeight: number;
    padding: number;
    breakpoints: {
      lg: number;
      md: number;
      sm: number;
      xs: number;
    };
  };
}

interface WidgetTemplate {
  type: string;
  name: string;
  description: string;
  icon: string;
  availableSizes: ('small' | 'medium' | 'large')[];
  defaultSettings: Widget['settings'];
}

export const DashboardLayout: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

  const { data: layouts } = useQuery<Layout[]>(
    ['dashboard-layouts'],
    () => scheduleAPI.getDashboardLayouts()
  );

  const { data: widgetTemplates } = useQuery<WidgetTemplate[]>(
    ['widget-templates'],
    () => scheduleAPI.getWidgetTemplates()
  );

  const updateLayoutMutation = useMutation(
    (layout: Layout) => scheduleAPI.updateDashboardLayout(layout),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('dashboard-layouts');
      },
    }
  );

  const createLayoutMutation = useMutation(
    (layout: Partial<Layout>) => scheduleAPI.createDashboardLayout(layout),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('dashboard-layouts');
      },
    }
  );

  const setDefaultLayoutMutation = useMutation(
    (layoutId: string) => scheduleAPI.setDefaultDashboardLayout(layoutId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('dashboard-layouts');
      },
    }
  );

  const renderLayoutCard = (layout: Layout) => (
    <div
      key={layout.id}
      className={`
        p-6 rounded-lg border border-gray-200
        ${selectedLayout === layout.id ? 'ring-2 ring-blue-500' : ''}
        cursor-pointer hover:bg-gray-50 transition-all duration-200
      `}
      onClick={() => setSelectedLayout(layout.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium">{layout.name}</h3>
          <p className="text-sm text-gray-500">{layout.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {layout.isDefault && (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Default
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDefaultLayoutMutation.mutate(layout.id);
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Set as Default
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 bg-gray-100 p-4 rounded-lg">
        {layout.widgets.map((widget) => (
          <div
            key={widget.id}
            className="bg-white p-2 rounded shadow-sm text-xs"
            style={{
              gridColumn: `span ${widget.position.width}`,
              gridRow: `span ${widget.position.height}`,
            }}
          >
            {widget.name}
          </div>
        ))}
      </div>
    </div>
  );

  const renderWidgetLibrary = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Widget Library</h3>
          <button
            onClick={() => setShowWidgetLibrary(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {widgetTemplates?.map((template) => (
            <div
              key={template.type}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                if (selectedLayout && layouts) {
                  const layout = layouts.find((l) => l.id === selectedLayout);
                  if (layout) {
                    const newWidget: Widget = {
                      id: Math.random().toString(36).substr(2, 9),
                      type: template.type,
                      name: template.name,
                      description: template.description,
                      size: template.availableSizes[0],
                      position: {
                        x: 0,
                        y: 0,
                        width: 1,
                        height: 1,
                      },
                      settings: template.defaultSettings,
                    };
                    updateLayoutMutation.mutate({
                      ...layout,
                      widgets: [...layout.widgets, newWidget],
                    });
                    setShowWidgetLibrary(false);
                  }
                }
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={template.icon}
                  alt={template.name}
                  className="w-8 h-8"
                />
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {template.availableSizes.map((size) => (
                  <span
                    key={size}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLayoutEditor = (layout: Layout) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <input
            type="text"
            value={layout.name}
            onChange={(e) =>
              updateLayoutMutation.mutate({
                ...layout,
                name: e.target.value,
              })
            }
            className="text-xl font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 focus:ring-0"
          />
          <input
            type="text"
            value={layout.description}
            onChange={(e) =>
              updateLayoutMutation.mutate({
                ...layout,
                description: e.target.value,
              })
            }
            className="mt-1 block w-full text-sm text-gray-500 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:ring-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              editMode
                ? 'bg-blue-600 text-white'
                : 'text-blue-600 border border-blue-600'
            }`}
          >
            {editMode ? 'Save Layout' : 'Edit Layout'}
          </button>
          <button
            onClick={() => setShowWidgetLibrary(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Add Widget
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-4">Grid Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Columns</label>
              <input
                type="number"
                value={layout.gridConfig.columns}
                onChange={(e) =>
                  updateLayoutMutation.mutate({
                    ...layout,
                    gridConfig: {
                      ...layout.gridConfig,
                      columns: parseInt(e.target.value),
                    },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Row Height (px)</label>
              <input
                type="number"
                value={layout.gridConfig.rowHeight}
                onChange={(e) =>
                  updateLayoutMutation.mutate({
                    ...layout,
                    gridConfig: {
                      ...layout.gridConfig,
                      rowHeight: parseInt(e.target.value),
                    },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Widgets</h3>
          <div className="grid gap-4">
            {layout.widgets.map((widget) => (
              <div
                key={widget.id}
                className="p-4 border rounded-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <input
                      type="text"
                      value={widget.name}
                      onChange={(e) =>
                        updateLayoutMutation.mutate({
                          ...layout,
                          widgets: layout.widgets.map((w) =>
                            w.id === widget.id
                              ? { ...w, name: e.target.value }
                              : w
                          ),
                        })
                      }
                      className="font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 focus:ring-0"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {widget.type}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      updateLayoutMutation.mutate({
                        ...layout,
                        widgets: layout.widgets.filter((w) => w.id !== widget.id),
                      })
                    }
                    className="text-red-600 hover:text-red-700"
                  >
                    <span className="material-icons-outlined">delete</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Size</label>
                    <select
                      value={widget.size}
                      onChange={(e) =>
                        updateLayoutMutation.mutate({
                          ...layout,
                          widgets: layout.widgets.map((w) =>
                            w.id === widget.id
                              ? { ...w, size: e.target.value as Widget['size'] }
                              : w
                          ),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Refresh Interval</label>
                    <input
                      type="number"
                      value={widget.settings.refreshInterval || 0}
                      onChange={(e) =>
                        updateLayoutMutation.mutate({
                          ...layout,
                          widgets: layout.widgets.map((w) =>
                            w.id === widget.id
                              ? {
                                  ...w,
                                  settings: {
                                    ...w.settings,
                                    refreshInterval: parseInt(e.target.value),
                                  },
                                }
                              : w
                          ),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dashboard Layouts</h2>
        <button
          onClick={() =>
            createLayoutMutation.mutate({
              name: 'New Layout',
              description: 'Layout description',
              isDefault: false,
              widgets: [],
              gridConfig: {
                columns: 12,
                rowHeight: 100,
                padding: 10,
                breakpoints: {
                  lg: 1200,
                  md: 996,
                  sm: 768,
                  xs: 480,
                },
              },
            })
          }
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Create Layout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {layouts?.map(renderLayoutCard)}
      </div>

      {selectedLayout && layouts && (
        <div className="bg-white rounded-lg shadow p-6">
          {renderLayoutEditor(layouts.find((l) => l.id === selectedLayout)!)}
        </div>
      )}

      {showWidgetLibrary && renderWidgetLibrary()}
    </div>
  );
};
