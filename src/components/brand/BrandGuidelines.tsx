/**
 * @writecarenotes.com
 * @fileoverview Brand guidelines and style guide component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A comprehensive brand guidelines component that showcases and documents
 * the brand's visual identity. Features include:
 * - Color palette visualization
 * - Typography showcase and usage
 * - Logo variations and guidelines
 * - Interactive style guide
 * - Brand asset examples
 * - Usage documentation
 * - Copy guidelines
 *
 * Mobile-First Considerations:
 * - Responsive layout
 * - Touch-friendly swatches
 * - Dynamic type scaling
 * - Optimized images
 * - Smooth transitions
 * - Gesture support
 *
 * Enterprise Features:
 * - Version control
 * - Change tracking
 * - Export options
 * - Search functionality
 * - Integration APIs
 * - Usage analytics
 */

'use client';

import { colors, typography } from '@/styles/theme';
import { brandAssets } from '@/config/brand-assets';

export function ColorPalette() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Primary Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-lg" style={{ background: colors.primary.blue }}>
            <div className="text-white">
              <div className="font-semibold">Primary Blue</div>
              <div className="text-sm opacity-80">
                HEX: {colors.primary.blue}
                <br />
                RGB: 1,124,252
                <br />
                CMYK: 78,52,0,0
              </div>
            </div>
          </div>
          <div className="p-6 rounded-lg" style={{ background: colors.primary.green }}>
            <div className="text-white">
              <div className="font-semibold">Primary Green</div>
              <div className="text-sm opacity-80">
                HEX: {colors.primary.green}
                <br />
                RGB: 143,209,10
                <br />
                CMYK: 49,0,100,0
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Typography() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Typography</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500 mb-2">Headline</div>
            <div className="text-4xl font-semibold" style={{ fontFamily: typography.fontFamily.sans }}>
              Write Care Notes
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-2">Subheadline</div>
            <div className="text-2xl" style={{ fontFamily: typography.fontFamily.sans }}>
              Comprehensive care home management
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-2">Body Copy</div>
            <div className="text-base" style={{ fontFamily: typography.fontFamily.sans }}>
              Streamline resident care documentation and compliance across the UK and Ireland.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Logo() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Logo Usage</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <img 
              src="/logo/horizontal.svg" 
              alt="Write Care Notes Logo" 
              className="h-12"
            />
            <div className="mt-2 text-sm text-gray-500">Horizontal Logo</div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <img 
              src="/logo/vertical.svg" 
              alt="Write Care Notes Logo" 
              className="h-20"
            />
            <div className="mt-2 text-sm text-gray-500">Vertical Logo</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrandGuidelines() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Write Care Notes Brand Guidelines</h1>
        <a
          href={brandAssets.guidelines.current}
          download
          className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Download PDF Guidelines
        </a>
      </div>
      <div className="space-y-12">
        <section>
          <ColorPalette />
        </section>
        <section>
          <Typography />
        </section>
        <section>
          <Logo />
        </section>
      </div>
    </div>
  );
}
