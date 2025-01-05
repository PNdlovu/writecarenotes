import React from 'react';
import { useAccessSettings } from './hooks';

export function AccessSettings() {
  const {
    settings,
    setHighContrast,
    setFontSize,
    setReduceMotion,
    setScreenReader,
    setKeyboardNavigation,
    setColorBlindMode,
    setTextToSpeech,
    setLanguage,
    resetSettings,
  } = useAccessSettings();

  // Rest of the component remains the same
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Access Settings</h2>
        
        <div className="space-y-4">
          {/* Display Settings */}
          <div>
            <h3 className="text-lg font-medium mb-2">Display</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  High Contrast
                </label>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Font Size
                </label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
                  className="mt-1 block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Color Blind Mode
                </label>
                <input
                  type="checkbox"
                  checked={settings.colorBlindMode}
                  onChange={(e) => setColorBlindMode(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Motion Settings */}
          <div>
            <h3 className="text-lg font-medium mb-2">Motion</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Reduce Motion
                </label>
                <input
                  type="checkbox"
                  checked={settings.reduceMotion}
                  onChange={(e) => setReduceMotion(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Assistive Technology */}
          <div>
            <h3 className="text-lg font-medium mb-2">Assistive Technology</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Screen Reader
                </label>
                <input
                  type="checkbox"
                  checked={settings.screenReader}
                  onChange={(e) => setScreenReader(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Keyboard Navigation
                </label>
                <input
                  type="checkbox"
                  checked={settings.keyboardNavigation}
                  onChange={(e) => setKeyboardNavigation(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Text to Speech
                </label>
                <input
                  type="checkbox"
                  checked={settings.textToSpeech}
                  onChange={(e) => setTextToSpeech(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div>
            <h3 className="text-lg font-medium mb-2">Language</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Interface Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="en">English</option>
                  <option value="cy">Welsh</option>
                  <option value="ga">Irish</option>
                  <option value="gd">Scottish Gaelic</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={resetSettings}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            aria-label="Reset all access settings to default values"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Preview</h2>
        <div 
          className={`p-4 border rounded-lg ${settings.highContrast ? 'bg-black text-white' : 'bg-white text-black'}`}
          style={{ fontSize: settings.fontSize === 'large' ? '1.25rem' : settings.fontSize === 'small' ? '0.875rem' : '1rem' }}
        >
          <p>This is a preview of how your content will look with the current settings.</p>
          <button
            className={`mt-2 px-4 py-2 rounded ${
              settings.highContrast 
                ? 'bg-white text-black' 
                : 'bg-blue-600 text-white'
            }`}
            {...(settings.keyboardNavigation ? { tabIndex: 0 } : {})}
          >
            Sample Button
          </button>
        </div>
      </div>
    </div>
  );
} 