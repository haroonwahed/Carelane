# Carelane Logo System

The Carelane logo system comprises 6 variants optimized for different contexts and backgrounds.

## Logo Variants

### 1. Dark Primary Horizontal (`dark-primary-horizontal`)
- **Composition**: Gradient CL mark + white Carelane wordmark + white tagline
- **Background**: Dark navy
- **Use Cases**: 
  - Landing page hero artwork
  - Marketing banners
  - Pitch decks
  - Social headers
  - Brand presentations
- **Example**: `<DarkPrimaryLogo width={300} />`

### 2. Light Primary Horizontal (`light-primary-horizontal`)
- **Composition**: Dark navy CL mark + dark navy wordmark + dark navy tagline
- **Background**: White
- **Use Cases**:
  - Documents and PDFs
  - Proposals
  - Email signatures (when space permits)
  - White landing-page sections
  - Printable materials
- **Example**: `<LightPrimaryLogo width={300} />`

### 3. App Icon (`app-icon`)
- **Composition**: Gradient CL symbol in rounded dark container
- **Background**: Dark (integrated)
- **Dimensions**: Square/1:1 aspect ratio
- **Use Cases**:
  - App icon
  - PWA manifest
  - Mobile shortcut
  - Login card artwork
  - Large product favicon
  - Social avatar fallback
- **Example**: `<AppIconLogo width={128} />`

### 4. Monochrome White Horizontal (`monochrome-white-horizontal`)
- **Composition**: White CL mark + white wordmark + white tagline
- **Background**: None (for dark backgrounds)
- **Use Cases**:
  - Dark backgrounds (when gradients are unsuitable)
  - Footer overlays
  - Accessibility fallback
  - Presentation overlays
  - One-color print
  - Legal/compliance material
- **Example**: `<MonochromeWhiteLogo width={200} />`

### 5. Compact Dark Horizontal (`compact-dark-horizontal`)
- **Composition**: Gradient CL mark + white Carelane wordmark (NO tagline)
- **Background**: Dark navy (integrated)
- **Use Cases**: 
  - Desktop navbar/app navigation
  - Sidebar header
  - Login page header
  - Dashboard shell
  - Landing-page navigation
  - Footer (space-limited)
  - **Main application logo** — use by default in product UI
- **Example**: `<CompactDarkLogo width={200} />`

### 6. Standalone Gradient CL Mark (`gradient-mark-on-white`)
- **Composition**: Isolated gradient CL symbol on light background
- **Background**: White (integrated)
- **Dimensions**: Square/1:1 aspect ratio
- **Use Cases**:
  - Favicon source
  - Document cover decoration
  - Small brand stamps
  - Empty states
  - Presentation section dividers
  - Profile/organization avatar fallback
  - Light-mode favicon
- **Example**: `<GradientMarkLogo width={64} />`

## Component API

### Main Component: `CarelaneLogoImage`

```tsx
import { CarelaneLogoImage } from "@/components/logos/CarelaneLogos";

// By use case
<CarelaneLogoImage variant="navbar" width={40} />

// By specific variant
<CarelaneLogoImage variant="dark-primary-horizontal" width={300} />

// With additional props
<CarelaneLogoImage 
  variant="compact-dark-horizontal" 
  width={200}
  className="my-logo"
  loading="lazy"
/>
```

### Convenience Components

Each variant has a dedicated export for cleaner imports:

```tsx
import {
  DarkPrimaryLogo,           // Hero, marketing
  LightPrimaryLogo,          // Documents, PDFs
  AppIconLogo,               // App icon, favicon
  MonochromeWhiteLogo,       // Dark backgrounds, footer
  CompactDarkLogo,           // Navbar, sidebar, login (default app logo)
  GradientMarkLogo,          // Favicons, stamps, avatars
} from "@/components/logos/CarelaneLogos";

<CompactDarkLogo width={200} />
```

### Props

All logo components accept standard `<img>` props:

```tsx
interface CarelaneLogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  // Logo variant or use case
  variant?: LogoVariant | LogoUseCase;
  
  // Optional sizing
  width?: number | string;
  height?: number | string;
  
  // Any standard img props
  className?: string;
  loading?: "lazy" | "eager";
  // ... etc
}
```

## Implementation Checklist

- [x] Logo system component created with 6 variants
- [x] Logo assets copied to `/client/public/logos/`
- [x] Component exports for each variant
- [x] Usage documentation (this README)
- [ ] Landing page hero section: implement `DarkPrimaryLogo`
- [ ] Login page: implement `CompactDarkLogo` or `AppIconLogo`
- [ ] Dashboard/app shell: implement `CompactDarkLogo` (default)
- [ ] Document export: implement `LightPrimaryLogo`
- [ ] Footer: consider `MonochromeWhiteLogo` for dark background
- [ ] Favicon: generate from `AppIconLogo` or `GradientMarkLogo`
- [ ] PWA manifest: reference `AppIconLogo` for app-icon
- [ ] Email signatures: provide `LightPrimaryLogo` or `CompactDarkLogo` templates

## Notes

- **Navbar/Sidebar**: Currently uses `CarelaneMark` SVG component (vector, compact, space-efficient). This is appropriate for tight space constraints. Future updates to use `CompactDarkLogo` image can be done if design changes.
  
- **Aspect Ratios**: 
  - All horizontal logos maintain their original aspect ratio
  - App icon and gradient mark are 1:1 (square)
  - Width and height can be specified; the other scales automatically
  
- **Color Inheritance**: The `CarelaneMark` SVG uses `currentColor` for styling; logo images are pre-styled and should not need color adjustment.

- **Accessibility**: All logo images have `alt="Carelane"`. Wrap in links or labels as needed for context.

- **Performance**: Logo PNGs are optimized. Use `loading="lazy"` for off-screen logos.
