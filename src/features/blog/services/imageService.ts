/**
 * @writecarenotes.com
 * @fileoverview Image service for blog post images
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for handling responsive images, generating picture elements,
 * and managing image optimization for blog posts.
 */

interface ImageSizes {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

interface PictureOptions {
  sizes: ImageSizes;
  webp: ImageSizes;
  dimensions: ImageDimensions;
  alt?: string;
  className?: string;
}

export class ImageService {
  private readonly breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  };

  /**
   * Generates HTML for a responsive picture element with WebP support
   */
  public generatePictureHtml(options: PictureOptions): string {
    const { sizes, webp, dimensions, alt = '', className = '' } = options;

    return `
      <picture>
        <!-- WebP sources -->
        <source
          media="(min-width: ${this.breakpoints.xl}px)"
          srcset="${webp.original}"
          type="image/webp"
        />
        <source
          media="(min-width: ${this.breakpoints.lg}px)"
          srcset="${webp.large}"
          type="image/webp"
        />
        <source
          media="(min-width: ${this.breakpoints.md}px)"
          srcset="${webp.medium}"
          type="image/webp"
        />
        <source
          media="(min-width: ${this.breakpoints.sm}px)"
          srcset="${webp.small}"
          type="image/webp"
        />
        <source
          srcset="${webp.thumbnail}"
          type="image/webp"
        />

        <!-- Fallback sources -->
        <source
          media="(min-width: ${this.breakpoints.xl}px)"
          srcset="${sizes.original}"
        />
        <source
          media="(min-width: ${this.breakpoints.lg}px)"
          srcset="${sizes.large}"
        />
        <source
          media="(min-width: ${this.breakpoints.md}px)"
          srcset="${sizes.medium}"
        />
        <source
          media="(min-width: ${this.breakpoints.sm}px)"
          srcset="${sizes.small}"
        />
        
        <!-- Fallback image -->
        <img
          src="${sizes.thumbnail}"
          alt="${this.escapeHtml(alt)}"
          width="${dimensions.width}"
          height="${dimensions.height}"
          class="${className}"
          loading="lazy"
        />
      </picture>
    `;
  }

  /**
   * Escapes HTML special characters to prevent XSS
   */
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Generates srcset string for responsive images
   */
  public generateSrcSet(sizes: ImageSizes): string {
    return Object.entries(sizes)
      .map(([size, url]) => `${url} ${this.getSizeWidth(size)}w`)
      .join(', ');
  }

  /**
   * Gets width in pixels for a given size
   */
  private getSizeWidth(size: string): number {
    switch (size) {
      case 'thumbnail':
        return 150;
      case 'small':
        return 300;
      case 'medium':
        return 600;
      case 'large':
        return 1200;
      case 'original':
        return 2400;
      default:
        return 600;
    }
  }
} 