'use client';

import { useState } from 'react';
import { brandAssets } from '@/config/brand-assets';

interface AssetDownloadProps {
  title: string;
  description: string;
  downloadUrl: string;
  type: 'pdf' | 'svg' | 'png';
}

function AssetDownload({ title, description, downloadUrl, type }: AssetDownloadProps) {
  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-lg">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <a
          href={downloadUrl}
          download
          className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Download {type.toUpperCase()}
        </a>
      </div>
    </div>
  );
}

export function BrandAssetsManager() {
  const [activeTab, setActiveTab] = useState<'guidelines' | 'logos' | 'images'>('guidelines');

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Brand Assets</h2>
        <div className="flex space-x-4 border-b">
          {(['guidelines', 'logos', 'images'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 ${
                activeTab === tab
                  ? 'border-b-2 border-primary-blue text-primary-blue'
                  : 'text-gray-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {activeTab === 'guidelines' && (
          <>
            {brandAssets.guidelines.versions.map((version) => (
              <AssetDownload
                key={version.version}
                title={`Brand Guidelines v${version.version}`}
                description={`Released ${version.releaseDate} - ${version.description}`}
                downloadUrl={version.path}
                type="pdf"
              />
            ))}
          </>
        )}

        {activeTab === 'logos' && (
          <>
            <AssetDownload
              title="Horizontal Logo (Light)"
              description="Primary horizontal logo for light backgrounds"
              downloadUrl={brandAssets.logos.primary.horizontal.light}
              type="svg"
            />
            <AssetDownload
              title="Horizontal Logo (Dark)"
              description="Primary horizontal logo for dark backgrounds"
              downloadUrl={brandAssets.logos.primary.horizontal.dark}
              type="svg"
            />
            <AssetDownload
              title="Vertical Logo (Light)"
              description="Primary vertical logo for light backgrounds"
              downloadUrl={brandAssets.logos.primary.vertical.light}
              type="svg"
            />
            <AssetDownload
              title="Vertical Logo (Dark)"
              description="Primary vertical logo for dark backgrounds"
              downloadUrl={brandAssets.logos.primary.vertical.dark}
              type="svg"
            />
            <AssetDownload
              title="Icon (Light)"
              description="Logo icon for light backgrounds"
              downloadUrl={brandAssets.logos.primary.icon.light}
              type="svg"
            />
            <AssetDownload
              title="Icon (Dark)"
              description="Logo icon for dark backgrounds"
              downloadUrl={brandAssets.logos.primary.icon.dark}
              type="svg"
            />
          </>
        )}

        {activeTab === 'images' && (
          <>
            <AssetDownload
              title="Brand Pattern (Light)"
              description="Decorative pattern for light backgrounds"
              downloadUrl={brandAssets.images.patterns.light}
              type="svg"
            />
            <AssetDownload
              title="Brand Pattern (Dark)"
              description="Decorative pattern for dark backgrounds"
              downloadUrl={brandAssets.images.patterns.dark}
              type="svg"
            />
          </>
        )}
      </div>
    </div>
  );
}


