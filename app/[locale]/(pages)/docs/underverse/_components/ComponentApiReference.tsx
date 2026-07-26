import apiManifestJson from "../_data/component-api.generated.json";
import type { DocsSlug } from "../_data/docs-registry";

type GeneratedProp = {
  name: string;
  type: string;
  required: boolean;
  default: string | null;
  description: string | null;
};

type GeneratedComponentApi = {
  name: string;
  kind: "component";
  props: GeneratedProp[];
};

type GeneratedFunctionApi = {
  name: string;
  kind: "function";
  signature: string;
  description: string | null;
};

type GeneratedNamespaceApi = {
  name: string;
  kind: "namespace";
  members: GeneratedFunctionApi[];
};

type GeneratedApi =
  | GeneratedComponentApi
  | GeneratedFunctionApi
  | GeneratedNamespaceApi;

type ApiManifest = {
  components: Record<
    DocsSlug,
    {
      apis: GeneratedApi[];
    }
  >;
};

export type ComponentApiReferenceLabels = {
  eyebrow: string;
  title: string;
  description: string;
  generated: string;
  component: string;
  function: string;
  namespace: string;
  property: string;
  type: string;
  defaultValue: string;
  propDescription: string;
  required: string;
  noDescription: string;
};

const apiManifest = apiManifestJson as unknown as ApiManifest;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ApiKindLabel({
  kind,
  labels,
}: {
  kind: GeneratedApi["kind"];
  labels: ComponentApiReferenceLabels;
}) {
  const text =
    kind === "component"
      ? labels.component
      : kind === "function"
        ? labels.function
        : labels.namespace;

  return (
    <span className="rounded-md border border-border/70 bg-muted/35 px-2 py-1 text-[11px] font-semibold text-muted-foreground">
      {text}
    </span>
  );
}

function ComponentPropsTable({
  api,
  labels,
  getPropDescription,
}: {
  api: GeneratedComponentApi;
  labels: ComponentApiReferenceLabels;
  getPropDescription?: (apiName: string, propName: string) => string | null;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/70">
      <table className="w-full min-w-176 border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-muted/45 text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="w-40 border-b border-border/70 px-4 py-3 font-semibold">
              {labels.property}
            </th>
            <th scope="col" className="border-b border-border/70 px-4 py-3 font-semibold">
              {labels.propDescription}
            </th>
            <th scope="col" className="w-64 border-b border-border/70 px-4 py-3 font-semibold">
              {labels.type}
            </th>
            <th scope="col" className="w-32 border-b border-border/70 px-4 py-3 font-semibold">
              {labels.defaultValue}
            </th>
          </tr>
        </thead>
        <tbody>
          {api.props.map((prop) => (
            <tr
              key={prop.name}
              className="align-top transition-colors hover:bg-muted/20 [&>*]:border-b [&>*]:border-border/55 last:[&>*]:border-b-0"
            >
              <th scope="row" className="px-4 py-3.5">
                <code className="font-mono text-[13px] font-semibold text-primary">
                  {prop.name}
                </code>
                {prop.required ? (
                  <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-destructive">
                    {labels.required}
                  </span>
                ) : null}
              </th>
              <td className="px-4 py-3.5 leading-6 text-muted-foreground">
                {prop.description ??
                  getPropDescription?.(api.name, prop.name) ??
                  labels.noDescription}
              </td>
              <td className="px-4 py-3.5">
                <code className="whitespace-pre-wrap break-all rounded bg-muted/55 px-1.5 py-1 font-mono text-xs leading-5 text-foreground">
                  {prop.type}
                </code>
              </td>
              <td className="px-4 py-3.5">
                <code className="whitespace-pre-wrap wrap-break-word font-mono text-xs leading-5 text-foreground">
                  {prop.default ?? (prop.required ? labels.required : "—")}
                </code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FunctionTable({
  functions,
  labels,
}: {
  functions: GeneratedFunctionApi[];
  labels: ComponentApiReferenceLabels;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/70">
      <table className="w-full min-w-168 border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-muted/45 text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="w-48 border-b border-border/70 px-4 py-3 font-semibold">
              API
            </th>
            <th scope="col" className="border-b border-border/70 px-4 py-3 font-semibold">
              {labels.type}
            </th>
            <th scope="col" className="w-64 border-b border-border/70 px-4 py-3 font-semibold">
              {labels.propDescription}
            </th>
          </tr>
        </thead>
        <tbody>
          {functions.map((fn) => (
            <tr
              key={fn.name}
              className="align-top transition-colors hover:bg-muted/20 [&>*]:border-b [&>*]:border-border/55 last:[&>*]:border-b-0"
            >
              <th scope="row" className="px-4 py-3.5 font-mono text-[13px] font-semibold text-primary">
                {fn.name}
              </th>
              <td className="px-4 py-3.5">
                <code className="whitespace-pre-wrap break-all rounded bg-muted/55 px-1.5 py-1 font-mono text-xs leading-5 text-foreground">
                  {fn.signature}
                </code>
              </td>
              <td className="px-4 py-3.5 leading-6 text-muted-foreground">
                {fn.description ?? labels.noDescription}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ComponentApiReference({
  slug,
  labels,
  getPropDescription,
}: {
  slug: DocsSlug;
  labels: ComponentApiReferenceLabels;
  getPropDescription?: (apiName: string, propName: string) => string | null;
}) {
  const contract = apiManifest.components[slug];
  if (!contract?.apis.length) return null;

  return (
    <section id="api-reference" aria-labelledby="api-reference-title" className="scroll-m-24">
      <div className="border-b border-border/60 pb-4">
        <div className="mb-2 text-sm font-semibold text-primary">{labels.eyebrow}</div>
        <h2
          id="api-reference-title"
          data-doc-heading
          className="text-balance text-2xl font-semibold tracking-tight text-foreground"
        >
          {labels.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {labels.description}
        </p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{labels.generated}</p>
      </div>

      <div className="mt-7 space-y-10">
        {contract.apis.map((api) => {
          const headingId = `api-${slugify(api.name)}`;
          return (
            <section key={`${api.kind}-${api.name}`} aria-labelledby={headingId}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <h3
                  id={headingId}
                  data-doc-heading
                  className="scroll-m-24 font-mono text-lg font-semibold text-foreground"
                >
                  {api.name}
                </h3>
                <ApiKindLabel kind={api.kind} labels={labels} />
              </div>

              {api.kind === "component" ? (
                <ComponentPropsTable
                  api={api}
                  labels={labels}
                  getPropDescription={getPropDescription}
                />
              ) : api.kind === "namespace" ? (
                <FunctionTable functions={api.members} labels={labels} />
              ) : (
                <FunctionTable functions={[api]} labels={labels} />
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
