"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Carousel } from "@/components/ui/Carousel";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function CarouselExample() {
  const t = useTranslations("DocsUnderverse");
  const code =
    `import { Carousel } from '@underverse-ui/underverse'\n\n` +
    `// 1) Basic Carousel\n` +
    `<Carousel>\n` +
    `  {[1,2,3].map((i) => (\n` +
    `    <div key={i} className="h-64 flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5 rounded-lg">\n` +
    `      <span className="text-4xl font-bold">Slide {i}</span>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 2) Fade Animation with Progress Bar\n` +
    `<Carousel animation="fade" showProgress>\n` +
    `  {[1,2,3,4].map((i) => (\n` +
    `    <div key={i} className="h-64 flex items-center justify-center bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-lg">\n` +
    `      <span className="text-3xl font-semibold">Fade {i}</span>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 3) Scale Animation - Manual Control\n` +
    `<Carousel animation="scale" autoScroll={false}>\n` +
    `  {[1,2,3,4].map((i) => (\n` +
    `    <div key={i} className="h-64 flex items-center justify-center bg-linear-to-br from-green-500/20 to-teal-500/20 rounded-lg">\n` +
    `      <span className="text-3xl font-semibold">Scale {i}</span>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 4) Multiple Slides Visible\n` +
    `<Carousel slidesToShow={3} slidesToScroll={1} autoScroll={false}>\n` +
    `  {[1,2,3,4,5,6].map((i) => (\n` +
    `    <div key={i} className="h-48 mx-2 flex items-center justify-center bg-muted rounded-lg border-2 border-border">\n` +
    `      <span className="text-2xl font-bold">{i}</span>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 5) Vertical Carousel\n` +
    `<Carousel orientation="vertical" className="h-96">\n` +
    `  {[1,2,3,4].map((i) => (\n` +
    `    <div key={i} className="h-full flex items-center justify-center bg-linear-to-r from-orange-500/20 to-red-500/20 rounded-lg">\n` +
    `      <span className="text-3xl font-bold">Vertical {i}</span>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 6) With Thumbnails\n` +
    `<Carousel showThumbnails showProgress={false}>\n` +
    `  {[\n` +
    `    { id: 1, img: "https://picsum.photos/seed/c1/800/400", title: "Nature" },\n` +
    `    { id: 2, img: "https://picsum.photos/seed/c2/800/400", title: "City" },\n` +
    `    { id: 3, img: "https://picsum.photos/seed/c3/800/400", title: "Ocean" },\n` +
    `    { id: 4, img: "https://picsum.photos/seed/c4/800/400", title: "Mountain" },\n` +
    `  ].map((item) => (\n` +
    `    <div key={item.id} className="h-96 rounded-lg overflow-hidden relative">\n` +
    `      <img src={item.img} alt={item.title} className="w-full h-full object-cover" />\n` +
    `      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-6">\n` +
    `        <h3 className="text-white text-2xl font-bold">{item.title}</h3>\n` +
    `      </div>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// 7) Custom Thumbnail Renderer\n` +
    `<Carousel\n` +
    `  showThumbnails\n` +
    `  thumbnailRenderer={(child, idx) => (\n` +
    `    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-xs">\n` +
    `      {idx + 1}\n` +
    `    </div>\n` +
    `  )}\n` +
    `>\n` +
    `  {/* slides */}\n` +
    `</Carousel>\n\n` +
    `// 8) With onChange Callback\n` +
    `const [currentSlide, setCurrentSlide] = React.useState(0);\n\n` +
    `<Carousel onSlideChange={(idx) => setCurrentSlide(idx)} showProgress>\n` +
    `  {/* slides */}\n` +
    `</Carousel>\n\n` +
    `// 9) No Loop (Finite)\n` +
    `<Carousel loop={false} autoScroll={false}>\n` +
    `  {[1,2,3].map((i) => (\n` +
    `    <div key={i} className="h-64 flex items-center justify-center bg-muted rounded-lg">\n` +
    `      <span className="text-3xl">Slide {i}</span>\n` +
    `    </div>\n` +
    `  ))}\n` +
    `</Carousel>\n\n` +
    `// Features:\n` +
    `// - Touch/Swipe support (mobile & desktop)\n` +
    `// - Keyboard navigation (Arrow keys, Home, End)\n` +
    `// - 3 animation variants: slide, fade, scale\n` +
    `// - Vertical & horizontal orientation\n` +
    `// - Multiple slides visible\n` +
    `// - Progress indicator\n` +
    `// - Thumbnail navigation\n` +
    `// - Full accessibility (ARIA labels)\n` +
    `// - Auto-pause on hover`;

  const [currentSlide, setCurrentSlide] = React.useState(0);

  const demo = (
    <div className="space-y-8">
      {/* 1) Basic Carousel */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Basic Carousel</h3>
        <Carousel>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5 rounded-lg">
              <span className="text-4xl font-bold">Slide {i}</span>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 2) Fade Animation with Progress Bar */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Fade Animation + Progress Bar</h3>
        <Carousel animation="fade" showProgress>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 flex items-center justify-center bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
              <span className="text-3xl font-semibold">Fade {i}</span>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 3) Scale Animation - Manual Control */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Scale Animation (Manual - Use arrows or swipe)</h3>
        <Carousel animation="scale" autoScroll={false}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 flex items-center justify-center bg-linear-to-br from-green-500/20 to-teal-500/20 rounded-lg">
              <span className="text-3xl font-semibold">Scale {i}</span>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 4) Multiple Slides Visible */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Multiple Slides (3 visible at once)</h3>
        <Carousel slidesToShow={3} slidesToScroll={1} autoScroll={false}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 mx-2 flex items-center justify-center bg-muted rounded-lg border-2 border-border">
              <span className="text-2xl font-bold">{i}</span>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 5) Vertical Carousel */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Vertical Carousel</h3>
        <Carousel orientation="vertical" className="h-96">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-full flex items-center justify-center bg-linear-to-r from-orange-500/20 to-red-500/20 rounded-lg">
              <span className="text-3xl font-bold">Vertical {i}</span>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 6) With Thumbnails */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Image Gallery with Thumbnails</h3>
        <Carousel showThumbnails showProgress={false}>
          {[
            { id: 1, img: "https://picsum.photos/seed/c1/800/400", title: "Nature" },
            { id: 2, img: "https://picsum.photos/seed/c2/800/400", title: "City" },
            { id: 3, img: "https://picsum.photos/seed/c3/800/400", title: "Ocean" },
            { id: 4, img: "https://picsum.photos/seed/c4/800/400", title: "Mountain" },
          ].map((item) => (
            <div key={item.id} className="h-96 rounded-lg overflow-hidden relative">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white text-2xl font-bold">{item.title}</h3>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 7) With onChange Callback */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">With Callback - Current: Slide {currentSlide + 1}</h3>
        <Carousel onSlideChange={(idx) => setCurrentSlide(idx)} showProgress>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 flex items-center justify-center bg-linear-to-br from-pink-500/20 to-rose-500/20 rounded-lg">
              <div className="text-center">
                <span className="text-4xl font-bold block">Slide {i}</span>
                <span className="text-sm text-muted-foreground mt-2 block">Callback updates parent state</span>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 8) No Loop (Finite) */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">No Loop (Finite - arrows disable at ends)</h3>
        <Carousel loop={false} autoScroll={false}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <span className="text-3xl font-semibold">Slide {i}</span>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Features Info */}
      <div className="p-6 bg-muted/50 rounded-lg border border-border">
        <h4 className="font-semibold mb-3">✨ Features:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            • <strong>Touch/Swipe:</strong> Works on mobile and desktop (mouse drag)
          </li>
          <li>
            • <strong>Keyboard:</strong> Arrow keys, Home, End navigation
          </li>
          <li>
            • <strong>Animations:</strong> slide, fade, scale variants
          </li>
          <li>
            • <strong>Orientations:</strong> horizontal & vertical
          </li>
          <li>
            • <strong>Multiple slides:</strong> Show multiple items at once
          </li>
          <li>
            • <strong>Progress bar:</strong> Visual auto-scroll indicator
          </li>
          <li>
            • <strong>Thumbnails:</strong> Quick navigation preview
          </li>
          <li>
            • <strong>Accessibility:</strong> Full ARIA labels & keyboard support
          </li>
          <li>
            • <strong>Auto-pause:</strong> Pauses on hover
          </li>
          <li>
            • <strong>Customizable:</strong> Callbacks, renderers, styling
          </li>
        </ul>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "children", description: t("props.carousel.children"), type: "React.ReactNode[]", default: "-" },
    { property: "autoScroll", description: t("props.carousel.autoScroll"), type: "boolean", default: "true" },
    { property: "autoScrollInterval", description: t("props.carousel.autoScrollInterval"), type: "number", default: "5000" },
    { property: "animation", description: t("props.carousel.animation"), type: '"slide" | "fade" | "scale"', default: '"slide"' },
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
    { property: "thumbnailRenderer", description: t("props.carousel.thumbnailRenderer"), type: "(child: React.ReactNode, index: number) => React.ReactNode", default: "-" },
    { property: "ariaLabel", description: t("props.carousel.ariaLabel"), type: "string", default: '"Carousel"' },
  ];
  const order = [
    "children","autoScroll","autoScrollInterval","animation","orientation","showArrows","showDots","showProgress","showThumbnails","loop","slidesToShow","slidesToScroll","className","containerClassName","slideClassName","onSlideChange","thumbnailRenderer","ariaLabel"
  ];
  const docs = <PropsDocsTable rows={rows} order={order} />;

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
