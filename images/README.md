# Image Assets Needed for IFRS16 Calculator

This directory should contain professional images to enhance user engagement and trust.

## Priority Images (Phase 1)

### 1. Hero Image
**Filename:** `hero-accounting.jpg`
**Size:** 1920×1080px (Full HD)
**Format:** JPG (optimized, <200KB) or WebP
**Content:** Professional accounting/finance imagery
- Options: Modern office with calculator, financial documents, professional working on laptop
- Style: Clean, professional, trust-building
- Color tone: Blues/navy (matches site palette)

### 2. Calculator Interface Screenshot
**Filename:** `calculator-preview.png`
**Size:** 1200×800px
**Format:** PNG or WebP
**Content:** Screenshot of the IFRS 16 calculator interface showing:
- Input fields filled with example data
- Generated amortization schedule
- Professional, clean capture

### 3. Team/About Page Image
**Filename:** `team-professional.jpg`
**Size:** 800×600px
**Format:** JPG
**Content:**
- Professional team photo OR
- Stock photo of diverse accounting professionals in office
- Should convey: expertise, trust, professionalism

## Blog Featured Images (Phase 2)

Each blog article should have a featured image (1200×630px for social sharing):

1. **common-mistakes-featured.jpg** - Infographic showing "Top IFRS 16 Mistakes"
2. **ibr-guide-featured.jpg** - Chart/graph showing interest rate selection
3. **retail-guide-featured.jpg** - Retail store/shopping imagery with accounting overlay
4. **timeline-featured.jpg** - Timeline infographic 2019-2025
5. **modifications-featured.jpg** - Document with "Amendment" or change concept
6. **deferred-tax-featured.jpg** - Tax forms or calculation imagery

## Infographics & Diagrams (Phase 3)

1. **ifrs-16-timeline.svg** - Visual timeline of IFRS 16 development
2. **rou-asset-diagram.svg** - Flowchart showing ROU asset calculation
3. **lease-liability-formula.svg** - Visual formula breakdown
4. **ifrs16-vs-asc842-comparison.svg** - Side-by-side comparison chart

## Image Optimization Guidelines

### Before Upload:
- Compress images (TinyPNG, ImageOptim)
- Target: 60-80% quality for JPG
- Use WebP format with JPG fallback where possible
- Add descriptive alt text in HTML

### Example HTML:
```html
<picture>
    <source srcset="images/hero-accounting.webp" type="image/webp">
    <img src="images/hero-accounting.jpg"
         alt="Professional accountant calculating IFRS 16 lease liability"
         width="1920"
         height="1080"
         loading="lazy">
</picture>
```

## Where to Find Images

### Free Stock Photo Sources:
- **Unsplash** (unsplash.com) - High-quality, free commercial use
- **Pexels** (pexels.com) - Free stock photos and videos
- **Pixabay** (pixabay.com) - Free images and vectors

### Search Terms:
- "accounting professional"
- "financial calculator"
- "office workspace modern"
- "business team meeting"
- "financial documents"
- "spreadsheet laptop"

### Paid Options (Higher Quality):
- **Shutterstock** - Premium stock photography
- **iStock** - Professional imagery
- **Adobe Stock** - High-quality business photos

## Custom Graphics

Consider creating custom infographics using:
- **Canva** (canva.com) - Easy drag-and-drop
- **Figma** (figma.com) - Professional design tool
- **Adobe Illustrator** - For SVG diagrams

## Implementation Checklist

- [ ] Create/source hero image (hero-accounting.jpg)
- [ ] Take calculator screenshot (calculator-preview.png)
- [ ] Get team/about photo (team-professional.jpg)
- [ ] Create 6 blog featured images
- [ ] Design IFRS 16 timeline infographic
- [ ] Create comparison chart SVG
- [ ] Optimize all images (<200KB each)
- [ ] Add alt text to all images in HTML
- [ ] Implement lazy loading
- [ ] Test on mobile devices

## Quick Start

To add the hero image:

1. Save `hero-accounting.jpg` to this directory
2. Optimize to <200KB
3. Update index.html hero section:
   ```html
   <header class="hero-section with-image">
   ```

That's it! The CSS is already configured.

## Current Status

- ✅ Images directory created
- ✅ Hero image CSS ready
- ✅ Lazy loading support in CSS
- ⏳ Actual images needed (see Priority Images above)
