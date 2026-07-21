import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));
const packageName = packageJson.name;
const peerDependencies = Object.keys(packageJson.peerDependencies ?? {});

async function bundleConsumer(name, source, { bundleLowlight = false } = {}) {
  const external = peerDependencies
    .filter((dependency) => !bundleLowlight || dependency !== "lowlight")
    .flatMap((dependency) => [dependency, `${dependency}/*`]);
  const result = await build({
    stdin: {
      contents: source,
      loader: "tsx",
      resolveDir: packageRoot,
      sourcefile: `${name}.tsx`,
    },
    bundle: true,
    external,
    format: "esm",
    logLevel: "silent",
    metafile: true,
    minify: true,
    outdir: path.join(packageRoot, `.bundle-check-${name}`),
    platform: "browser",
    splitting: true,
    treeShaking: true,
    write: false,
  });

  const outputEntries = Object.entries(result.metafile.outputs);
  const entryOutput = outputEntries.find(([, output]) => output.entryPoint === `${name}.tsx`)?.[0];
  assert.ok(entryOutput, `Unable to find generated entry output for ${name}`);

  const initialOutputs = new Set();
  const visitStaticOutput = (outputName) => {
    if (initialOutputs.has(outputName)) return;
    const output = result.metafile.outputs[outputName];
    if (!output) return;
    initialOutputs.add(outputName);
    output.imports.forEach((imported) => {
      if (!imported.external && imported.kind !== "dynamic-import") visitStaticOutput(imported.path);
    });
  };
  visitStaticOutput(entryOutput);

  return {
    bytes: result.outputFiles.reduce((sum, file) => sum + file.contents.byteLength, 0),
    inputs: Object.keys(result.metafile.inputs),
    initialBytes: [...initialOutputs].reduce((sum, outputName) => (
      sum + result.metafile.outputs[outputName].bytes
    ), 0),
    initialInputs: [...initialOutputs].flatMap((outputName) => (
      Object.keys(result.metafile.outputs[outputName].inputs)
    )),
  };
}

const root = await bundleConsumer(
  "root",
  `import { UEditor } from ${JSON.stringify(packageName)}; console.log(UEditor);`,
);
const subpath = await bundleConsumer(
  "subpath",
  `import UEditor from ${JSON.stringify(`${packageName}/ueditor`)}; console.log(UEditor);`,
);
const rootWithLowlight = await bundleConsumer(
  "root-with-lowlight",
  `import { UEditor } from ${JSON.stringify(packageName)}; console.log(UEditor);`,
  { bundleLowlight: true },
);

const allowedByteDifference = Math.max(2_048, Math.ceil(subpath.bytes * 0.01));
assert.ok(
  root.bytes <= subpath.bytes + allowedByteDifference,
  `Root UEditor bundle (${root.bytes} bytes) exceeds the subpath bundle (${subpath.bytes} bytes) by more than ${allowedByteDifference} bytes`,
);

const isHighlightGrammar = (input) => /highlight\.js\/(?:es|lib)\/languages\//.test(input);
assert.ok(
  rootWithLowlight.inputs.some(isHighlightGrammar),
  "Lowlight bundle check must include Highlight.js grammars in an optional chunk",
);
assert.equal(
  rootWithLowlight.initialInputs.some(isHighlightGrammar),
  false,
  "Highlight.js grammars must stay out of UEditor initial chunks until a code block is used",
);

console.log(
  `[verify:root-tree-shaking] root=${root.bytes} bytes/${root.inputs.length} inputs, subpath=${subpath.bytes} bytes/${subpath.inputs.length} inputs, initial-with-lowlight=${rootWithLowlight.initialBytes} bytes.`,
);
