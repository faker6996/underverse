import { MetadataRoute } from "next";
import { LOCALE } from "@/lib/constants/enum";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://underverse-ui.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = [LOCALE.VI, LOCALE.EN, LOCALE.KO, LOCALE.JA];
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [];

  // Add root pages for each locale
  locales.forEach((locale) => {
    routes.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    });
  });

  // Add documentation pages for each locale
  locales.forEach((locale) => {
    routes.push({
      url: `${SITE_URL}/${locale}/docs/underverse`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  });

  // Add individual component documentation sections
  // These are anchor links within the docs page but good for sitemap context
  const componentSections = [
    "install",
    "button",
    "badge",
    "avatar",
    "breadcrumb",
    "card",
    "checkbox",
    "textarea",
    "modal",
    "tabs",
    "toast",
    "alert",
    "tooltip",
    "popover",
    "sheet",
    "switch",
    "slider",
    "radio-group",
    "table",
    "data-table",
    "progress",
    "skeleton",
    "carousel",
    "dropdown-menu",
    "combobox",
    "multi-combobox",
    "input",
    "date-picker",
    "calendar",
    "color-picker",
    "time-picker",
    "pagination",
    "image-upload",
    "form",
    "theme-toggle",
  ];

  locales.forEach((locale) => {
    componentSections.forEach((section) => {
      routes.push({
        url: `${SITE_URL}/${locale}/docs/underverse#${section}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    });
  });

  return routes;
}
