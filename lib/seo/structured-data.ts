/**
 * Utility functions for generating JSON-LD structured data
 * @see https://schema.org/
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://underverse-ui.com";
const NPM_PACKAGE = process.env.NEXT_PUBLIC_NPM_PACKAGE || "@underverse-ui/underverse";
const NPM_VERSION = process.env.NEXT_PUBLIC_NPM_VERSION || "0.1.7";

/**
 * Organization schema for the library/company
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Underverse UI",
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    description: "Modern React component library for building beautiful user interfaces",
    sameAs: [`https://www.npmjs.com/package/${NPM_PACKAGE}`, `https://github.com/faker6996/underverse`],
  };
}

/**
 * SoftwareApplication schema for the component library
 */
export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Underverse UI",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A comprehensive React component library with 40+ accessible, customizable UI components built with TypeScript, Tailwind CSS, and Next.js.",
    softwareVersion: NPM_VERSION,
    url: SITE_URL,
    downloadUrl: `https://www.npmjs.com/package/${NPM_PACKAGE}`,
    screenshot: `${SITE_URL}/og-image.png`,
    author: {
      "@type": "Organization",
      name: "Underverse UI",
    },
    programmingLanguage: ["TypeScript", "JavaScript", "React"],
    keywords: "react, components, ui library, nextjs, typescript, tailwind css, design system",
  };
}

/**
 * BreadcrumbList schema for navigation
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * WebPage schema for documentation pages
 */
export function getWebPageSchema(params: { title: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: params.title,
    description: params.description,
    url: params.url,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Underverse UI",
      url: SITE_URL,
    },
  };
}

/**
 * Utility to create a script tag with JSON-LD data
 */
export function createJsonLdScript(data: object) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  };
}
