/**
 * Carelane Logo System
 *
 * 6 logo variants for different contexts and backgrounds.
 * Each variant optimized for its specific use case.
 *
 * Guidelines:
 * - Dark primary (gradient mark + white wordmark + tagline): hero, marketing, pitch decks
 * - Light primary (navy mark + navy wordmark + tagline): documents, PDFs, proposals, email
 * - App icon (gradient mark in rounded container): app icon, PWA, favicon, avatar
 * - Monochrome white (all white): dark backgrounds, footer, compliance, one-color print
 * - Compact dark (gradient mark + white wordmark, no tagline): navbar, sidebar, login, app UI
 * - Standalone gradient mark on white: favicon source, decoration, avatars, small stamps
 */

import type { ImgHTMLAttributes } from "react";

type LogoVariant =
  | "dark-primary-horizontal"
  | "light-primary-horizontal"
  | "app-icon"
  | "monochrome-white-horizontal"
  | "compact-dark-horizontal"
  | "gradient-mark-on-white";

type LogoUseCase =
  | "navbar"           // compact-dark
  | "footer"           // compact-dark or monochrome-white
  | "hero"             // dark-primary
  | "marketing"        // dark-primary
  | "document"         // light-primary
  | "login"            // app-icon or compact-dark
  | "app-icon"         // app-icon
  | "favicon"          // gradient-mark-on-white or app-icon
  | "dark-background"  // monochrome-white
  | "default";         // compact-dark (fallback)

interface CarelaneLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  /** Logo variant or use case. Defaults to "compact-dark-horizontal" */
  variant?: LogoVariant | LogoUseCase;
  /** Optional width override. Height auto-scales. */
  width?: number | string;
  /** Optional height override. Width auto-scales. */
  height?: number | string;
}

const VARIANT_MAP: Record<LogoUseCase, LogoVariant> = {
  navbar: "compact-dark-horizontal",
  footer: "compact-dark-horizontal",
  hero: "dark-primary-horizontal",
  marketing: "dark-primary-horizontal",
  document: "light-primary-horizontal",
  login: "compact-dark-horizontal",
  "app-icon": "app-icon",
  favicon: "gradient-mark-on-white",
  "dark-background": "monochrome-white-horizontal",
  default: "compact-dark-horizontal",
};

const VARIANT_PATHS: Record<LogoVariant, string> = {
  "dark-primary-horizontal": "/logos/dark-primary-horizontal.png",
  "light-primary-horizontal": "/logos/light-primary-horizontal.png",
  "app-icon": "/logos/app-icon.png",
  "monochrome-white-horizontal": "/logos/monochrome-white-horizontal.png",
  "compact-dark-horizontal": "/logos/compact-dark-horizontal.png",
  "gradient-mark-on-white": "/logos/gradient-mark-on-white.png",
};

function getLogoVariant(variant?: LogoVariant | LogoUseCase): LogoVariant {
  if (!variant) return "compact-dark-horizontal";

  // If it's already a direct variant, return it
  if (variant in VARIANT_PATHS) return variant as LogoVariant;

  // Otherwise, map the use case to a variant
  return VARIANT_MAP[variant as LogoUseCase] || "compact-dark-horizontal";
}

/**
 * Main Carelane logo component.
 *
 * @param variant Logo variant or use case (e.g., "navbar", "hero", "compact-dark-horizontal")
 * @param width Optional width override
 * @param height Optional height override
 *
 * @example
 * // Use by context
 * <CarelaneLogoImage variant="navbar" width={40} />
 *
 * @example
 * // Use specific variant
 * <CarelaneLogoImage variant="dark-primary-horizontal" width={300} />
 */
export function CarelaneLogoImage({
  variant = "compact-dark-horizontal",
  width,
  height,
  className,
  ...props
}: CarelaneLogoProps) {
  const logoVariant = getLogoVariant(variant);
  const src = VARIANT_PATHS[logoVariant];

  return (
    <img
      src={src}
      alt="Carelane"
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
}

/**
 * Compact dark logo — main application logo.
 * Gradient CL mark + white wordmark, no tagline.
 * Use in: navbar, sidebar, login page, dashboard.
 */
export function CompactDarkLogo(props: Omit<CarelaneLogoProps, "variant">) {
  return <CarelaneLogoImage variant="compact-dark-horizontal" {...props} />;
}

/**
 * Dark primary logo — hero and marketing contexts.
 * Gradient CL mark + white wordmark + tagline.
 * Use in: hero sections, pitch decks, dark marketing banners.
 */
export function DarkPrimaryLogo(props: Omit<CarelaneLogoProps, "variant">) {
  return <CarelaneLogoImage variant="dark-primary-horizontal" {...props} />;
}

/**
 * Light primary logo — documents and light backgrounds.
 * Dark navy mark + dark navy wordmark + tagline.
 * Use in: PDFs, proposals, light landing sections, email signatures.
 */
export function LightPrimaryLogo(props: Omit<CarelaneLogoProps, "variant">) {
  return <CarelaneLogoImage variant="light-primary-horizontal" {...props} />;
}

/**
 * App icon — square logo for app/PWA/favicon.
 * Gradient CL mark in rounded dark container.
 * Use in: app icon, PWA manifest, mobile shortcut, login card, loading screen, favicon.
 */
export function AppIconLogo(props: Omit<CarelaneLogoProps, "variant">) {
  return <CarelaneLogoImage variant="app-icon" {...props} />;
}

/**
 * Monochrome white logo — dark backgrounds.
 * White CL mark + white wordmark + white tagline.
 * Use in: dark backgrounds, footer, accessibility fallback, one-color print, compliance.
 */
export function MonochromeWhiteLogo(props: Omit<CarelaneLogoProps, "variant">) {
  return <CarelaneLogoImage variant="monochrome-white-horizontal" {...props} />;
}

/**
 * Standalone gradient mark — small usage and avatars.
 * Isolated CL symbol on light background.
 * Use in: favicon source, decorations, small stamps, avatars, empty states.
 */
export function GradientMarkLogo(props: Omit<CarelaneLogoProps, "variant">) {
  return <CarelaneLogoImage variant="gradient-mark-on-white" {...props} />;
}
