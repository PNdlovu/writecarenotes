/**
 * @fileoverview Tests for watermark service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { WatermarkService } from '../services/watermarkService';
import PDFDocument from 'pdfkit';
import { WatermarkOptions, WatermarkPattern, BrandingOptions } from '../types/export.types';
import { readFileSync } from 'fs';
import QRCode from 'qrcode';

// Mock dependencies
jest.mock('pdfkit');
jest.mock('fs');
jest.mock('qrcode');

describe('WatermarkService', () => {
  let service: WatermarkService;
  let mockDoc: jest.Mocked<PDFKit.PDFDocument>;

  beforeEach(() => {
    service = WatermarkService.getInstance();
    mockDoc = {
      page: {
        width: 595,
        height: 842
      },
      save: jest.fn().mockReturnThis(),
      restore: jest.fn().mockReturnThis(),
      fillColor: jest.fn().mockReturnThis(),
      fontSize: jest.fn().mockReturnThis(),
      opacity: jest.fn().mockReturnThis(),
      translate: jest.fn().mockReturnThis(),
      rotate: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      image: jest.fn().mockReturnThis(),
      font: jest.fn().mockReturnThis(),
      linearGradient: jest.fn().mockReturnThis(),
      radialGradient: jest.fn().mockReturnThis(),
      stops: jest.fn().mockReturnThis(),
      strokeColor: jest.fn().mockReturnThis(),
      lineWidth: jest.fn().mockReturnThis(),
      dash: jest.fn().mockReturnThis(),
      rect: jest.fn().mockReturnThis(),
      roundedRect: jest.fn().mockReturnThis(),
      stroke: jest.fn().mockReturnThis(),
      scale: jest.fn().mockReturnThis(),
      widthOfString: jest.fn().mockReturnValue(100),
      currentLineHeight: jest.fn().mockReturnValue(20),
    } as unknown as jest.Mocked<PDFKit.PDFDocument>;

    (readFileSync as jest.Mock).mockReturnValue(Buffer.from('mock-image'));
    (QRCode.toBuffer as jest.Mock).mockResolvedValue(Buffer.from('mock-qr'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addPDFWatermark', () => {
    it('should apply text watermark with default options', async () => {
      const options: WatermarkOptions = {
        text: 'CONFIDENTIAL'
      };

      await service.addPDFWatermark(mockDoc, options);

      expect(mockDoc.save).toHaveBeenCalled();
      expect(mockDoc.fillColor).toHaveBeenCalledWith('#E6E6E6');
      expect(mockDoc.fontSize).toHaveBeenCalledWith(60);
      expect(mockDoc.opacity).toHaveBeenCalledWith(0.3);
      expect(mockDoc.restore).toHaveBeenCalled();
    });

    it('should apply branding with logo', async () => {
      const options: WatermarkOptions = {
        branding: {
          logo: {
            path: '/path/to/logo.png',
            width: 100,
            height: 50,
            position: 'topRight'
          },
          colors: {
            primary: '#FF0000'
          }
        }
      };

      await service.addPDFWatermark(mockDoc, options);

      expect(readFileSync).toHaveBeenCalledWith('/path/to/logo.png');
      expect(mockDoc.image).toHaveBeenCalled();
      expect(mockDoc.fillColor).toHaveBeenCalledWith('#FF0000');
    });

    it('should apply logo pattern with repeat', async () => {
      const pattern: WatermarkPattern = {
        type: 'logo',
        content: '/path/to/pattern.png',
        repeat: true,
        spacing: 150,
        scale: 0.4
      };

      const options: WatermarkOptions = { pattern };

      await service.addPDFWatermark(mockDoc, options);

      expect(readFileSync).toHaveBeenCalledWith('/path/to/pattern.png');
      expect(mockDoc.image).toHaveBeenCalled();
      expect(mockDoc.scale).toHaveBeenCalledWith(0.4);
    });

    it('should apply QR code pattern', async () => {
      const pattern: WatermarkPattern = {
        type: 'qrCode',
        content: 'https://writecarenotes.com',
        scale: 0.3
      };

      const options: WatermarkOptions = { pattern };

      await service.addPDFWatermark(mockDoc, options);

      expect(QRCode.toBuffer).toHaveBeenCalledWith('https://writecarenotes.com');
      expect(mockDoc.image).toHaveBeenCalled();
    });

    it('should apply text pattern with effects', async () => {
      const options: WatermarkOptions = {
        pattern: {
          type: 'text',
          content: 'CONFIDENTIAL',
          repeat: true
        },
        effects: {
          gradient: {
            type: 'linear',
            colors: ['#FF0000', '#00FF00']
          },
          shadow: {
            color: '#000000',
            blur: 5,
            offset: { x: 2, y: 2 }
          }
        }
      };

      await service.addPDFWatermark(mockDoc, options);

      expect(mockDoc.linearGradient).toHaveBeenCalled();
      expect(mockDoc.stops).toHaveBeenCalled();
    });

    it('should apply border to text watermark', async () => {
      const options: WatermarkOptions = {
        text: 'CONFIDENTIAL',
        border: {
          show: true,
          style: 'dashed',
          width: 2,
          color: '#000000',
          radius: 5
        }
      };

      await service.addPDFWatermark(mockDoc, options);

      expect(mockDoc.strokeColor).toHaveBeenCalledWith('#000000');
      expect(mockDoc.lineWidth).toHaveBeenCalledWith(2);
      expect(mockDoc.dash).toHaveBeenCalledWith(5, { space: 5 });
      expect(mockDoc.roundedRect).toHaveBeenCalled();
    });

    it('should apply custom position', async () => {
      const options: WatermarkOptions = {
        text: 'CONFIDENTIAL',
        position: 'custom',
        customPosition: {
          x: 100,
          y: 200,
          repeat: {
            horizontal: 3,
            vertical: 2,
            offset: 50
          }
        }
      };

      await service.addPDFWatermark(mockDoc, options);

      expect(mockDoc.translate).toHaveBeenCalledWith(100, 200);
    });

    it('should handle responsive options', async () => {
      const options: WatermarkOptions = {
        text: 'CONFIDENTIAL',
        responsive: {
          minScale: 0.5,
          maxScale: 1.5,
          breakpoints: {
            768: {
              scale: 0.8,
              opacity: 0.4
            }
          }
        }
      };

      await service.addPDFWatermark(mockDoc, options);

      expect(mockDoc.scale).toHaveBeenCalled();
      expect(mockDoc.opacity).toHaveBeenCalled();
    });
  });

  describe('CSV Watermark', () => {
    const csvData = 'id,name\n1,John\n2,Jane';

    it('should add watermark as comments', () => {
      const options: WatermarkOptions = {
        text: 'CONFIDENTIAL',
      };

      const result = service.addCSVWatermark(csvData, options);

      expect(result).toContain('# CONFIDENTIAL');
      expect(result).toContain('# Generated:');
      expect(result).toContain(csvData);
    });

    it('should preserve original CSV data', () => {
      const options: WatermarkOptions = {
        text: 'CONFIDENTIAL',
      };

      const result = service.addCSVWatermark(csvData, options);
      const dataLines = result.split('\n').slice(2).join('\n');

      expect(dataLines).toBe(csvData);
    });
  });

  describe('JSON Watermark', () => {
    const jsonData = {
      users: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ],
    };

    it('should add watermark metadata', () => {
      const options: WatermarkOptions = {
        text: 'CONFIDENTIAL',
      };

      const result = service.addJSONWatermark(jsonData, options);

      expect(result._watermark).toBeDefined();
      expect(result._watermark.text).toBe('CONFIDENTIAL');
      expect(result._watermark.timestamp).toBeDefined();
    });

    it('should preserve original data', () => {
      const options: WatermarkOptions = {
        text: 'CONFIDENTIAL',
      };

      const result = service.addJSONWatermark(jsonData, options);

      expect(result.users).toEqual(jsonData.users);
    });
  });

  describe('Validation', () => {
    it('should validate required text', () => {
      const options: WatermarkOptions = {
        text: '',
      };

      expect(() => service.validateWatermarkOptions(options)).toThrow(
        'Watermark text is required'
      );
    });

    it('should validate opacity range', () => {
      const options: WatermarkOptions = {
        text: 'TEST',
        opacity: 1.5,
      };

      expect(() => service.validateWatermarkOptions(options)).toThrow(
        'Opacity must be between 0 and 1'
      );
    });

    it('should validate font size', () => {
      const options: WatermarkOptions = {
        text: 'TEST',
        fontSize: 0,
      };

      expect(() => service.validateWatermarkOptions(options)).toThrow(
        'Font size must be greater than 0'
      );
    });

    it('should validate rotation range', () => {
      const options: WatermarkOptions = {
        text: 'TEST',
        rotation: 200,
      };

      expect(() => service.validateWatermarkOptions(options)).toThrow(
        'Rotation must be between -180 and 180 degrees'
      );
    });
  });

  describe('Metadata', () => {
    it('should generate correct metadata', () => {
      const options: WatermarkOptions = {
        text: 'CONFIDENTIAL',
        position: 'diagonal',
      };

      const metadata = service.getWatermarkMetadata(options);

      expect(metadata.watermark.text).toBe('CONFIDENTIAL');
      expect(metadata.watermark.position).toBe('diagonal');
      expect(metadata.watermark.appliedAt).toBeDefined();
    });

    it('should handle minimal options', () => {
      const options: WatermarkOptions = {
        text: 'CONFIDENTIAL',
      };

      const metadata = service.getWatermarkMetadata(options);

      expect(metadata.watermark.text).toBe('CONFIDENTIAL');
      expect(metadata.watermark.appliedAt).toBeDefined();
    });
  });
}); 


