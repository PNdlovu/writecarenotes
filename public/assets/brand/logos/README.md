# Write Care Notes Logo Package

This package contains all official Write Care Notes logo variations with built-in dark mode support.

## Logo Variations

### Vector Formats (SVG)

#### Standard Logos
- `horizontal/light.svg` - Primary logo for light backgrounds
- `horizontal/dark.svg` - Primary logo for dark backgrounds
- `vertical/light.svg` - Stacked logo for light backgrounds
- `vertical/dark.svg` - Stacked logo for dark backgrounds
- `icon/light.svg` - Icon for light backgrounds
- `icon/dark.svg` - Icon for dark backgrounds

#### Special Purpose
- `monochrome/light.svg` - Black & white version for light backgrounds
- `monochrome/dark.svg` - White & black version for dark backgrounds
- `favicon/favicon.svg` - Optimized for browser favicons
- `social/social-cover.svg` - Social media cover image
- `animated/logo-animated.svg` - Animated version for web use

### Raster Formats (PNG)
Located in the `png` directory, organized by size:
- 64px - For favicons and small UI elements
- 128px - For medium-sized UI elements
- 256px - For high-resolution displays
- 512px - For large format displays

Each size includes all logo variations in both light and dark themes.

## Dark Mode Support
All vector logos include automatic dark mode support using CSS media queries:

### Standard Versions
When using light versions:
- Light mode: Blue icon (#2563EB) on white background with dark text
- Dark mode: Light blue icon (#3B82F6) on dark background (#1E293B) with light text

When using dark versions:
- Dark mode: Light blue icon (#3B82F6) on dark background (#1E293B) with light text
- Light mode: Blue icon (#2563EB) on white background with dark text

### Monochrome Versions
- Light version: Black on white, inverting to white on black in dark mode
- Dark version: White on black, inverting to black on white in light mode

## Usage Guidelines

### Choosing the Right Format

1. **Website Headers & Navigation**
   - Use `horizontal/light.svg` with dark mode support
   - Implement smooth transitions for theme changes

2. **Favicon Implementation**
```html
<!-- Modern browsers with SVG support -->
<link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg">

<!-- Fallback for older browsers -->
<link rel="icon" type="image/png" sizes="32x32" href="/png/32px/icon-light.png">
<link rel="icon" type="image/png" sizes="16x16" href="/png/16px/icon-light.png">
```

3. **Social Media**
   - Use `social/social-cover.svg` for social media headers
   - Use PNG versions at appropriate sizes for profile pictures
   - Maintain clear space around logos in social media contexts

4. **Animated Usage**
```html
<!-- Animated logo example -->
<object data="/animated/logo-animated.svg" type="image/svg+xml" class="animated-logo">
  <img src="/horizontal/light.svg" alt="Write Care Notes" /> <!-- Fallback -->
</object>

<style>
.animated-logo {
  width: 200px;
  height: auto;
}
</style>

### Choosing the Right Format
1. **SVG (Preferred)**
   - Websites and digital platforms
   - Responsive designs
   - High-resolution displays
   - Print materials

2. **PNG**
   - Social media platforms
   - Email signatures
   - Applications with SVG limitations
   - Specific size requirements

3. **Monochrome**
   - Watermarks
   - Fax documents
   - Single-color printing
   - Special design cases

### Spacing
- Maintain clear space around the logo equal to the height of the "N" in "Notes"
- Never compress or stretch the logo
- Use SVG format whenever possible for optimal scaling

### Minimum Sizes
- Horizontal logo: 120px wide
- Vertical logo: 80px wide
- Icon: 32px wide

### Color Variants
- Primary Blue: #2563EB (light mode)
- Light Blue: #3B82F6(dark mode)
- Dark Background: #1E293B
- Light Text: #FFFFFF
- Dark Text: #1E293B

### Do's
- Use the appropriate version for your background
- Maintain minimum clear space
- Keep the logo clearly visible
- Use vector formats (SVG) when possible

### Don'ts
- Don't modify the logo colors
- Don't rotate or distort the logo
- Don't add effects (shadows, gradients, etc.)
- Don't use the logo on busy backgrounds

## Technical Implementation

### HTML Example
```html
<!-- Standard logo with dark mode support -->
<img src="path/to/horizontal/light.svg" alt="Write Care Notes" class="logo" />

<!-- Monochrome version -->
<img src="path/to/monochrome/light.svg" alt="Write Care Notes" class="logo-mono" />
```

### CSS Example
```css
.logo {
  height: auto;
  width: 200px; /* Adjust as needed, maintaining aspect ratio */
}

/* Optional: Add smooth transition for dark mode */
.logo {
  transition: filter 0.3s ease-in-out;
}

/* Optional: Add hover effect */
.logo:hover {
  filter: brightness(1.05);
}

## Support
For questions about logo usage or to request special formats, contact support@writecarenotes.com
