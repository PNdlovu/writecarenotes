import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    warning: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: number;
      heading: number;
      subheading: number;
      small: number;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    unit: number;
    small: number;
    medium: number;
    large: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

interface ThemePreview {
  id: string;
  name: string;
  screenshot: string;
  description: string;
  tags: string[];
}

export const ThemeCustomizer: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'browse' | 'customize'>('browse');

  const { data: themes } = useQuery<Theme[]>(
    ['themes'],
    () => scheduleAPI.getThemes()
  );

  const { data: themePreviews } = useQuery<ThemePreview[]>(
    ['theme-previews'],
    () => scheduleAPI.getThemePreviews()
  );

  const updateThemeMutation = useMutation(
    (theme: Theme) => scheduleAPI.updateTheme(theme),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('themes');
      },
    }
  );

  const createThemeMutation = useMutation(
    (theme: Partial<Theme>) => scheduleAPI.createTheme(theme),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('themes');
      },
    }
  );

  const applyThemeMutation = useMutation(
    (themeId: string) => scheduleAPI.applyTheme(themeId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('themes');
      },
    }
  );

  const renderColorPicker = (
    label: string,
    value: string,
    onChange: (color: string) => void
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-md border-gray-300"
        />
      </div>
    </div>
  );

  const renderThemePreviewCard = (preview: ThemePreview) => (
    <div
      key={preview.id}
      className={`
        rounded-lg border border-gray-200 overflow-hidden
        ${selectedTheme === preview.id ? 'ring-2 ring-blue-500' : ''}
        cursor-pointer hover:shadow-md transition-all duration-200
      `}
      onClick={() => setSelectedTheme(preview.id)}
    >
      <img
        src={preview.screenshot}
        alt={preview.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-medium">{preview.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{preview.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {preview.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            applyThemeMutation.mutate(preview.id);
          }}
          className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Apply Theme
        </button>
      </div>
    </div>
  );

  const renderThemeEditor = (theme: Theme) => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <input
            type="text"
            value={theme.name}
            onChange={(e) =>
              updateThemeMutation.mutate({ ...theme, name: e.target.value })
            }
            className="text-xl font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 focus:ring-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => applyThemeMutation.mutate(theme.id)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Apply Theme
          </button>
          <button
            onClick={() => setSelectedTheme(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Colors</h3>
          <div className="space-y-4">
            {Object.entries(theme.colors).map(([key, value]) =>
              renderColorPicker(
                key.charAt(0).toUpperCase() + key.slice(1),
                value,
                (color) =>
                  updateThemeMutation.mutate({
                    ...theme,
                    colors: { ...theme.colors, [key]: color },
                  })
              )
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium">Typography</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Font Family</label>
              <select
                value={theme.typography.fontFamily}
                onChange={(e) =>
                  updateThemeMutation.mutate({
                    ...theme,
                    typography: {
                      ...theme.typography,
                      fontFamily: e.target.value,
                    },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300"
              >
                <option value="system-ui">System UI</option>
                <option value="arial">Arial</option>
                <option value="helvetica">Helvetica</option>
                <option value="georgia">Georgia</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(theme.typography.fontSize).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium">
                    {key.charAt(0).toUpperCase() + key.slice(1)} Size
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      updateThemeMutation.mutate({
                        ...theme,
                        typography: {
                          ...theme.typography,
                          fontSize: {
                            ...theme.typography.fontSize,
                            [key]: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Preview</h3>
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          <div
            style={{
              fontSize: theme.typography.fontSize.heading,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.primary,
            }}
          >
            Heading Example
          </div>
          <div
            style={{
              fontSize: theme.typography.fontSize.subheading,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.secondary,
              marginTop: theme.spacing.small,
            }}
          >
            Subheading Example
          </div>
          <div
            style={{
              fontSize: theme.typography.fontSize.base,
              marginTop: theme.spacing.medium,
            }}
          >
            This is an example of body text in your selected theme. It demonstrates
            the typography, colors, and spacing settings you've chosen.
          </div>
          <div className="flex gap-4 mt-4">
            <button
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.background,
                padding: `${theme.spacing.small}px ${theme.spacing.medium}px`,
                borderRadius: theme.borderRadius.medium,
                boxShadow: theme.shadows.small,
              }}
            >
              Primary Button
            </button>
            <button
              style={{
                backgroundColor: theme.colors.secondary,
                color: theme.colors.background,
                padding: `${theme.spacing.small}px ${theme.spacing.medium}px`,
                borderRadius: theme.borderRadius.medium,
                boxShadow: theme.shadows.small,
              }}
            >
              Secondary Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'browse'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Browse Themes
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'customize'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Customize Theme
          </button>
        </div>

        {activeTab === 'browse' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode('grid')}
              className={`p-2 rounded-lg ${
                previewMode === 'grid'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-icons-outlined">grid_view</span>
            </button>
            <button
              onClick={() => setPreviewMode('list')}
              className={`p-2 rounded-lg ${
                previewMode === 'list'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-icons-outlined">view_list</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === 'browse' ? (
        <div
          className={
            previewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {themePreviews?.map(renderThemePreviewCard)}
        </div>
      ) : (
        selectedTheme && themes ? (
          renderThemeEditor(themes.find((t) => t.id === selectedTheme)!)
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Select a theme to customize</p>
          </div>
        )
      )}
    </div>
  );
};
