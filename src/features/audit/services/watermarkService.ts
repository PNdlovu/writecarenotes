/**
 * @fileoverview Watermark service for audit exports
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { WatermarkOptions, WatermarkPattern, BrandingOptions } from '../types/export.types';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { readFileSync } from 'fs';
import { join } from 'path';

export class WatermarkService {
  private static instance: WatermarkService;

  private constructor() {}

  public static getInstance(): WatermarkService {
    if (!WatermarkService.instance) {
      WatermarkService.instance = new WatermarkService();
    }
    return WatermarkService.instance;
  }

  /**
   * Adds a watermark to a PDF document
   */
  async addPDFWatermark(doc: PDFKit.PDFDocument, options: WatermarkOptions): Promise<void> {
    // Save the current graphics state
    doc.save();

    // Apply branding if specified
    if (options.branding) {
      await this.applyBranding(doc, options.branding);
    }

    // Apply pattern or text watermark
    if (options.pattern) {
      await this.applyPattern(doc, options.pattern, options);
    } else if (options.text) {
      await this.applyTextWatermark(doc, options);
    }

    // Restore the graphics state
    doc.restore();
  }

  private async applyBranding(doc: PDFKit.PDFDocument, branding: BrandingOptions): Promise<void> {
    // Apply logo if specified
    if (branding.logo) {
      const { path, width, height, opacity, position } = branding.logo;
      const logoBuffer = readFileSync(path);
      
      const x = this.getLogoX(doc, position, width);
      const y = this.getLogoY(doc, position, height);

      doc.save()
         .opacity(opacity || 1)
         .image(logoBuffer, x, y, { width, height })
         .restore();
    }

    // Apply brand colors
    if (branding.colors) {
      doc.fillColor(branding.colors.primary);
    }

    // Apply brand fonts
    if (branding.fonts) {
      const { family, weight, style } = branding.fonts;
      doc.font(family)
         .fontSize(12); // Default size
    }
  }

  private async applyPattern(
    doc: PDFKit.PDFDocument,
    pattern: WatermarkPattern,
    options: WatermarkOptions
  ): Promise<void> {
    switch (pattern.type) {
      case 'logo':
        await this.applyLogoPattern(doc, pattern, options);
        break;
      case 'qrCode':
        await this.applyQRCodePattern(doc, pattern, options);
        break;
      case 'custom':
        await this.applyCustomPattern(doc, pattern, options);
        break;
      default:
        await this.applyTextPattern(doc, pattern, options);
    }
  }

  private async applyLogoPattern(
    doc: PDFKit.PDFDocument,
    pattern: WatermarkPattern,
    options: WatermarkOptions
  ): Promise<void> {
    const logoBuffer = readFileSync(pattern.content);
    const scale = pattern.scale || 0.5;
    const spacing = pattern.spacing || 200;

    if (pattern.repeat) {
      for (let x = 0; x < doc.page.width; x += spacing) {
        for (let y = 0; y < doc.page.height; y += spacing) {
          doc.save()
             .translate(x, y)
             .scale(scale)
             .opacity(options.opacity || 0.3)
             .image(logoBuffer, 0, 0)
             .restore();
        }
      }
    } else {
      const x = (doc.page.width - spacing) / 2;
      const y = (doc.page.height - spacing) / 2;
      doc.save()
         .translate(x, y)
         .scale(scale)
         .opacity(options.opacity || 0.3)
         .image(logoBuffer, 0, 0)
         .restore();
    }
  }

  private async applyQRCodePattern(
    doc: PDFKit.PDFDocument,
    pattern: WatermarkPattern,
    options: WatermarkOptions
  ): Promise<void> {
    const qrBuffer = await QRCode.toBuffer(pattern.content);
    const scale = pattern.scale || 0.3;
    const spacing = pattern.spacing || 150;

    if (pattern.repeat) {
      for (let x = 0; x < doc.page.width; x += spacing) {
        for (let y = 0; y < doc.page.height; y += spacing) {
          doc.save()
             .translate(x, y)
             .scale(scale)
             .opacity(options.opacity || 0.3)
             .image(qrBuffer, 0, 0)
             .restore();
        }
      }
    } else {
      const x = (doc.page.width - spacing) / 2;
      const y = (doc.page.height - spacing) / 2;
      doc.save()
         .translate(x, y)
         .scale(scale)
         .opacity(options.opacity || 0.3)
         .image(qrBuffer, 0, 0)
         .restore();
    }
  }

  private async applyCustomPattern(
    doc: PDFKit.PDFDocument,
    pattern: WatermarkPattern,
    options: WatermarkOptions
  ): Promise<void> {
    // Custom pattern implementation (e.g., SVG or custom drawing)
    const customPath = pattern.content;
    // Implementation depends on the custom pattern format
  }

  private async applyTextPattern(
    doc: PDFKit.PDFDocument,
    pattern: WatermarkPattern,
    options: WatermarkOptions
  ): Promise<void> {
    const text = pattern.content;
    const scale = pattern.scale || 1;
    const spacing = pattern.spacing || 100;

    // Apply effects if specified
    if (options.effects) {
      this.applyEffects(doc, options.effects);
    }

    // Apply border if specified
    if (options.border?.show) {
      this.applyBorder(doc, text, options.border);
    }

    if (pattern.repeat) {
      for (let x = 0; x < doc.page.width; x += spacing) {
        for (let y = 0; y < doc.page.height; y += spacing) {
          doc.save()
             .translate(x, y)
             .scale(scale)
             .opacity(options.opacity || 0.3)
             .text(text, 0, 0)
             .restore();
        }
      }
    } else {
      const x = (doc.page.width - spacing) / 2;
      const y = (doc.page.height - spacing) / 2;
      doc.save()
         .translate(x, y)
         .scale(scale)
         .opacity(options.opacity || 0.3)
         .text(text, 0, 0)
         .restore();
    }
  }

  private async applyTextWatermark(
    doc: PDFKit.PDFDocument,
    options: WatermarkOptions
  ): Promise<void> {
    const {
      text = '',
      color = '#E6E6E6',
      opacity = 0.3,
      fontSize = 60,
      rotation = -45,
      position = 'diagonal',
    } = options;

    // Set basic styles
    doc.fillColor(color)
       .fontSize(fontSize)
       .opacity(opacity);

    // Apply effects if specified
    if (options.effects) {
      this.applyEffects(doc, options.effects);
    }

    // Apply border if specified
    if (options.border?.show) {
      this.applyBorder(doc, text, options.border);
    }

    // Position the watermark
    if (position === 'custom' && options.customPosition) {
      this.applyCustomPosition(doc, text, options.customPosition);
    } else {
      switch (position) {
        case 'center':
          this.applyCenterPosition(doc, text);
          break;
        case 'diagonal':
          this.applyDiagonalPosition(doc, text, rotation);
          break;
        case 'tile':
          this.applyTilePosition(doc, text, rotation);
          break;
      }
    }
  }

  private applyEffects(doc: PDFKit.PDFDocument, effects: NonNullable<WatermarkOptions['effects']>): void {
    if (effects.shadow) {
      // Implement shadow effect
      const { color, blur, offset } = effects.shadow;
      // PDF shadow implementation
    }

    if (effects.glow) {
      // Implement glow effect
      const { color, strength } = effects.glow;
      // PDF glow implementation
    }

    if (effects.gradient) {
      // Implement gradient effect
      const { type, colors, stops } = effects.gradient;
      if (type === 'linear') {
        doc.linearGradient(0, 0, doc.page.width, doc.page.height)
           .stops(colors.map((color, i) => [stops?.[i] || i / (colors.length - 1), color]));
      } else {
        doc.radialGradient(doc.page.width / 2, doc.page.height / 2, 0, doc.page.width / 2)
           .stops(colors.map((color, i) => [stops?.[i] || i / (colors.length - 1), color]));
      }
    }
  }

  private applyBorder(
    doc: PDFKit.PDFDocument,
    text: string,
    border: NonNullable<WatermarkOptions['border']>
  ): void {
    const {
      width = 1,
      style = 'solid',
      color = '#000000',
      radius = 0,
      padding = 10,
    } = border;

    const textWidth = doc.widthOfString(text);
    const textHeight = doc.currentLineHeight();

    doc.save()
       .strokeColor(color)
       .lineWidth(width);

    if (style === 'dashed') {
      doc.dash(5, { space: 5 });
    } else if (style === 'dotted') {
      doc.dash(1, { space: 3 });
    }

    if (radius > 0) {
      doc.roundedRect(
        -padding,
        -padding,
        textWidth + padding * 2,
        textHeight + padding * 2,
        radius
      ).stroke();
    } else {
      doc.rect(
        -padding,
        -padding,
        textWidth + padding * 2,
        textHeight + padding * 2
      ).stroke();
    }

    doc.restore();
  }

  private getLogoX(doc: PDFKit.PDFDocument, position?: string, width = 0): number {
    switch (position) {
      case 'topRight':
      case 'bottomRight':
        return doc.page.width - width - 50;
      case 'center':
        return (doc.page.width - width) / 2;
      default: // topLeft, bottomLeft
        return 50;
    }
  }

  private getLogoY(doc: PDFKit.PDFDocument, position?: string, height = 0): number {
    switch (position) {
      case 'bottomLeft':
      case 'bottomRight':
        return doc.page.height - height - 50;
      case 'center':
        return (doc.page.height - height) / 2;
      default: // topLeft, topRight
        return 50;
    }
  }

  /**
   * Adds a watermark to CSV data
   */
  addCSVWatermark(csvData: string, options: WatermarkOptions): string {
    const { text } = options;
    const watermarkLine = `# ${text}\n# Generated: ${new Date().toISOString()}\n`;
    return watermarkLine + csvData;
  }

  /**
   * Adds a watermark to JSON data
   */
  addJSONWatermark(jsonData: any, options: WatermarkOptions): any {
    const { text } = options;
    return {
      _watermark: {
        text,
        timestamp: new Date().toISOString(),
      },
      ...jsonData,
    };
  }

  /**
   * Validates watermark options
   */
  validateWatermarkOptions(options: WatermarkOptions): void {
    if (!options.text) {
      throw new Error('Watermark text is required');
    }

    if (options.opacity !== undefined && (options.opacity < 0 || options.opacity > 1)) {
      throw new Error('Opacity must be between 0 and 1');
    }

    if (options.fontSize !== undefined && options.fontSize <= 0) {
      throw new Error('Font size must be greater than 0');
    }

    if (options.rotation !== undefined && (options.rotation < -180 || options.rotation > 180)) {
      throw new Error('Rotation must be between -180 and 180 degrees');
    }
  }

  /**
   * Gets watermark metadata
   */
  getWatermarkMetadata(options: WatermarkOptions): Record<string, any> {
    return {
      watermark: {
        text: options.text,
        appliedAt: new Date().toISOString(),
        position: options.position,
      },
    };
  }
} 


