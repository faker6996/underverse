"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Carousel } from "@/components/ui/Carousel";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import Image from "next/image";

export default function CarouselExample() {
  const t = useTranslations("DocsUnderverse");
  const heroSlides = [
    { id: 1, img: "https://picsum.photos/seed/car-hero-1/1400/900", title: "Aurora Ridge", subtitle: "Immersive full-width hero" },
    { id: 2, img: "https://picsum.photos/seed/car-hero-2/1400/900", title: "Neon District", subtitle: "Autoplay with progress feedback" },
    { id: 3, img: "https://picsum.photos/seed/car-hero-3/1400/900", title: "Midnight Coast", subtitle: "Swipe, arrows, and dots ready" },
  ];
  const immersiveSlides = [
    { id: 1, img: "https://picsum.photos/seed/coverflow-1/1200/800", title: "Aurora Ridge", subtitle: "Main visual focus" },
    { id: 2, img: "https://picsum.photos/seed/coverflow-2/1200/800", title: "Neon District", subtitle: "Secondary depth layer" },
    { id: 3, img: "https://picsum.photos/seed/coverflow-3/1200/800", title: "Desert Bloom", subtitle: "Background card" },
    { id: 4, img: "https://picsum.photos/seed/coverflow-4/1200/800", title: "Midnight Coast", subtitle: "Layered stack card" },
    { id: 5, img: "https://picsum.photos/seed/coverflow-5/1200/800", title: "Glass Valley", subtitle: "Rear perspective card" },
  ];
  const gallerySlides = [
    { id: 1, img: "https://picsum.photos/seed/gallery-1/1000/700", title: "Nature Archive", subtitle: "Editorial gallery slide" },
    { id: 2, img: "https://picsum.photos/seed/gallery-2/1000/700", title: "Urban Tension", subtitle: "Magazine-style preview" },
    { id: 3, img: "https://picsum.photos/seed/gallery-3/1000/700", title: "Ocean Frame", subtitle: "Thumbnail navigation demo" },
    { id: 4, img: "https://picsum.photos/seed/gallery-4/1000/700", title: "Mountain Light", subtitle: "Full-bleed image card" },
  ];
  const stripSlides = [
    { id: 1, img: "https://picsum.photos/seed/strip-1/900/700", title: "Studio A" },
    { id: 2, img: "https://picsum.photos/seed/strip-2/900/700", title: "Studio B" },
    { id: 3, img: "https://picsum.photos/seed/strip-3/900/700", title: "Studio C" },
    { id: 4, img: "https://picsum.photos/seed/strip-4/900/700", title: "Studio D" },
    { id: 5, img: "https://picsum.photos/seed/strip-5/900/700", title: "Studio E" },
    { id: 6, img: "https://picsum.photos/seed/strip-6/900/700", title: "Studio F" },
  ];
  const verticalSlides = [
    { id: 1, img: "https://picsum.photos/seed/vertical-1/900/1200", title: "Vertical One", subtitle: "Portrait storytelling" },
    { id: 2, img: "https://picsum.photos/seed/vertical-2/900/1200", title: "Vertical Two", subtitle: "Works with tall artboards" },
    { id: 3, img: "https://picsum.photos/seed/vertical-3/900/1200", title: "Vertical Three", subtitle: "Motion in portrait mode" },
  ];
  const code =
    `import { Carousel } from '@underverse-ui/underverse'\n\n` +
    `const heroSlides = [\n` +
    `  { id: 1, img: 'https://picsum.photos/seed/car-hero-1/1400/900', title: 'Aurora Ridge', subtitle: 'Immersive full-width hero' },\n` +
    `  { id: 2, img: 'https://picsum.photos/seed/car-hero-2/1400/900', title: 'Neon District', subtitle: 'Autoplay with progress feedback' },\n` +
    `  { id: 3, img: 'https://picsum.photos/seed/car-hero-3/1400/900', title: 'Midnight Coast', subtitle: 'Swipe, arrows, and dots ready' },\n` +
    `]\n\n` +
    `// 1) Hero autoplay carousel\n` +
    `<Carousel showProgress autoScrollInterval={4200}>\n` +
    `  {heroSlides.map((item) => (\n` +
    `    <div key={item.id} className="relative h-72 overflow-hidden rounded-2xl border border-border/40">\n` +
    `      <img src={item.img} alt={item.title} className="h-full w-full object-cover" />\n` +
    `      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/35 to-transparent p-6">\n` +
    `        <p className="text-xl font-semibold text-white">{item.title}</p>\n` +
    `        <p className="text-sm text-white/75">{item.subtitle}</p>\n` +
    `      </div>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 2) 3D Coverflow autoplay\n` +
    `<Carousel\n` +
    `  animation="coverflow"\n` +
    `  effectPreset="cinematic"\n` +
    `  autoScroll\n` +
    `  autoScrollInterval={3200}\n` +
    `  showProgress\n` +
    `  effectOptions={{ mainScale: 1.08, sideScale: 0.84, sideOffset: 24 }}\n` +
    `>\n` +
    `  {slides.map((item) => (\n` +
    `    <div key={item.id} className="relative h-72 overflow-hidden rounded-2xl border border-border/40">\n` +
    `      <img src={item.img} alt={item.title} className="h-full w-full object-cover" />\n` +
    `      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/35 to-transparent p-6">\n` +
    `        <p className="text-lg font-semibold text-white">{item.title}</p>\n` +
    `        <p className="text-sm text-white/70">{item.subtitle}</p>\n` +
    `      </div>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 3) Stack / deck carousel\n` +
    `<Carousel animation="stack" effectPreset="gallery" autoScroll={false} effectOptions={{ stackLift: 10 }}>\n` +
    `  {slides.map((item) => (\n` +
    `    <div key={item.id} className="relative h-72 overflow-hidden rounded-2xl border border-border/40">\n` +
    `      <img src={item.img} alt={item.title} className="h-full w-full object-cover" />\n` +
    `      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/35 to-transparent p-6">\n` +
    `        <p className="text-lg font-semibold text-white">{item.title}</p>\n` +
    `        <p className="text-sm text-white/70">{item.subtitle}</p>\n` +
    `      </div>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 4) Multi-slide strip\n` +
    `<Carousel slidesToShow={3} slidesToScroll={1} autoScroll={false}>\n` +
    `  {stripSlides.map((item) => (\n` +
    `    <div key={item.id} className="relative mx-2 h-52 overflow-hidden rounded-2xl border border-border/40">\n` +
    `      <img src={item.img} alt={item.title} className="h-full w-full object-cover" />\n` +
    `      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4 text-white">\n` +
    `        <p className="text-base font-medium">{item.title}</p>\n` +
    `      </div>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 5) Vertical carousel\n` +
    `<Carousel orientation="vertical" className="h-96">\n` +
    `  {verticalSlides.map((item) => (\n` +
    `    <div key={item.id} className="relative h-full overflow-hidden rounded-2xl border border-border/40">\n` +
    `      <img src={item.img} alt={item.title} className="h-full w-full object-cover" />\n` +
    `      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/35 to-transparent p-5">\n` +
    `        <p className="text-lg font-semibold text-white">{item.title}</p>\n` +
    `        <p className="text-sm text-white/75">{item.subtitle}</p>\n` +
    `      </div>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 6) Image gallery with thumbnails\n` +
    `<Carousel showThumbnails showProgress={false}>\n` +
    `  {gallerySlides.map((item) => (\n` +
    `    <div key={item.id} className="h-96 rounded-lg overflow-hidden relative">\n` +
    `      <img src={item.img} alt={item.title} className="w-full h-full object-cover" />\n` +
    `      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-6">\n` +
    `        <h3 className="text-white text-2xl font-bold">{item.title}</h3>\n` +
    `        <p className="text-sm text-white/75">{item.subtitle}</p>\n` +
    `      </div>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 7) Finite carousel with callback\n` +
    `const [currentSlide, setCurrentSlide] = React.useState(0);\n\n` +
    `<Carousel loop={false} autoScroll={false} onSlideChange={(idx) => setCurrentSlide(idx)}>\n` +
    `  {heroSlides.map((item) => (\n` +
    `    <div key={item.id} className="relative h-72 overflow-hidden rounded-2xl border border-border/40">\n` +
    `      <img src={item.img} alt={item.title} className="h-full w-full object-cover" />\n` +
    `      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/35 to-transparent p-6">\n` +
    `        <p className="text-xl font-semibold text-white">{item.title}</p>\n` +
    `      </div>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// Features:\n` +
    `// - Touch/Swipe support\n` +
    `// - Keyboard navigation\n` +
    `// - 3D coverflow + stack presets\n` +
    `// - Image gallery / vertical / strip layouts\n` +
    `// - Progress indicator + thumbnail navigation`;

  const [currentSlide, setCurrentSlide] = React.useState(0);

  const renderImageSlide = React.useCallback(
    (item: { id: number; img: string; title: string; subtitle?: string }, heightClassName: string) => (
      <div key={item.id} className={["relative overflow-hidden rounded-2xl border border-border/40", heightClassName].join(" ")}>
        <Image src={item.img} alt={item.title} fill sizes="(min-width: 768px) 900px, 100vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/35 to-transparent p-5 md:p-6">
          <p className="text-lg md:text-xl font-semibold text-white">{item.title}</p>
          {item.subtitle ? <p className="text-sm text-white/75">{item.subtitle}</p> : null}
        </div>
      </div>
    ),
    [],
  );

  const demo = (
    <div className="space-y-8">
      {/* 1) Hero */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Hero Autoplay</h3>
        <Carousel showProgress autoScrollInterval={4200}>
          {heroSlides.map((item) => renderImageSlide(item, "h-72 md:h-80"))}
        </Carousel>
      </div>

      {/* 2) Coverflow */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">3D Coverflow Autoplay</h3>
        <Carousel
          animation="coverflow"
          effectPreset="cinematic"
          autoScroll
          autoScrollInterval={3200}
          showProgress
          effectOptions={{ mainScale: 1.08, sideScale: 0.84, sideOffset: 24 }}
        >
          {immersiveSlides.map((item) => renderImageSlide(item, "h-72"))}
        </Carousel>
      </div>

      {/* 3) Stack */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Stack / Deck</h3>
        <Carousel animation="stack" effectPreset="gallery" autoScroll={false} effectOptions={{ stackLift: 10 }}>
          {immersiveSlides.map((item) => renderImageSlide(item, "h-72"))}
        </Carousel>
      </div>

      {/* 4) Strip */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Multi-slide Strip</h3>
        <Carousel slidesToShow={3} slidesToScroll={1} autoScroll={false}>
          {stripSlides.map((item) => (
            <div key={item.id} className="mx-2">
              {renderImageSlide(item, "h-52")}
            </div>
          ))}
        </Carousel>
      </div>

      {/* 5) Vertical */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Vertical Carousel</h3>
        <Carousel orientation="vertical" className="h-96">
          {verticalSlides.map((item) => renderImageSlide(item, "h-full"))}
        </Carousel>
      </div>

      {/* 6) Gallery */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Image Gallery with Thumbnails</h3>
        <Carousel showThumbnails showProgress={false}>
          {gallerySlides.map((item) => renderImageSlide(item, "h-96"))}
        </Carousel>
      </div>

      {/* 7) Finite */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Finite Carousel - Current: {currentSlide + 1}</h3>
        <Carousel loop={false} autoScroll={false} onSlideChange={(idx) => setCurrentSlide(idx)}>
          {heroSlides.map((item) => renderImageSlide(item, "h-72"))}
        </Carousel>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "children", description: t("props.carousel.children"), type: "React.ReactNode", default: "-" },
    { property: "autoScroll", description: t("props.carousel.autoScroll"), type: "boolean", default: "true" },
    { property: "autoScrollInterval", description: t("props.carousel.autoScrollInterval"), type: "number", default: "5000" },
    {
      property: "animation",
      description: t("props.carousel.animation"),
      type: '"slide" | "fade" | "scale" | "coverflow" | "stack"',
      default: '"slide"',
    },
    { property: "orientation", description: t("props.carousel.orientation"), type: '"horizontal" | "vertical"', default: '"horizontal"' },
    { property: "showArrows", description: t("props.carousel.showArrows"), type: "boolean", default: "true" },
    { property: "showDots", description: t("props.carousel.showDots"), type: "boolean", default: "true" },
    { property: "showProgress", description: t("props.carousel.showProgress"), type: "boolean", default: "false" },
    { property: "showThumbnails", description: t("props.carousel.showThumbnails"), type: "boolean", default: "false" },
    { property: "loop", description: t("props.carousel.loop"), type: "boolean", default: "true" },
    { property: "slidesToShow", description: t("props.carousel.slidesToShow"), type: "number", default: "1" },
    { property: "slidesToScroll", description: t("props.carousel.slidesToScroll"), type: "number", default: "1" },
    { property: "className", description: t("props.carousel.className"), type: "string", default: "-" },
    { property: "containerClassName", description: t("props.carousel.containerClassName"), type: "string", default: "-" },
    { property: "slideClassName", description: t("props.carousel.slideClassName"), type: "string", default: "-" },
    { property: "onSlideChange", description: t("props.carousel.onSlideChange"), type: "(index: number) => void", default: "-" },
    {
      property: "thumbnailRenderer",
      description: t("props.carousel.thumbnailRenderer"),
      type: "(child: React.ReactNode, index: number) => React.ReactNode",
      default: "-",
    },
    { property: "ariaLabel", description: t("props.carousel.ariaLabel"), type: "string", default: '"Carousel"' },
    {
      property: "effectPreset",
      description: "Preset deck look for coverflow/stack (`cinematic` or `gallery`).",
      type: '"cinematic" | "gallery"',
      default: "-",
    },
    {
      property: "effectOptions",
      description: "Deck animation tuning for coverflow/stack (scale, offset, rotate, blur, depth).",
      type: "CarouselEffectOptions",
      default: "-",
    },
  ];
  const order = [
    "children",
    "autoScroll",
    "autoScrollInterval",
    "animation",
    "orientation",
    "showArrows",
    "showDots",
    "showProgress",
    "showThumbnails",
    "loop",
    "slidesToShow",
    "slidesToScroll",
    "className",
    "containerClassName",
    "slideClassName",
    "onSlideChange",
    "thumbnailRenderer",
    "ariaLabel",
    "effectPreset",
    "effectOptions",
  ];
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="Carousel.md" />;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
        { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
