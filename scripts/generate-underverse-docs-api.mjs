#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(repositoryRoot, "packages/underverse");
const sourceRoot = path.join(packageRoot, "src");
const registryPath = path.join(
  repositoryRoot,
  "app/[locale]/(pages)/docs/underverse/_data/docs-registry.ts",
);
const outputPath = path.join(
  repositoryRoot,
  "app/[locale]/(pages)/docs/underverse/_data/component-api.generated.json",
);
const checkOnly = process.argv.includes("--check");

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function parseRegistry() {
  const source = fs.readFileSync(registryPath, "utf8");
  return [...source.matchAll(
    /component\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*\[([^\]]*)\],\s*"([^"]+)"/g,
  )].map((match) => ({
    slug: match[1],
    importNames: [...match[4].matchAll(/"([^"]+)"/g)].map((nameMatch) => nameMatch[1]),
    sourceFile: match[5],
  }));
}

function createTypeScriptProgram() {
  const configPath = path.join(packageRoot, "tsconfig.tsup.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
  }

  const config = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath),
  );
  return ts.createProgram(config.fileNames, config.options);
}

function resolveSymbol(checker, symbol) {
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}

function symbolDeclaration(symbol) {
  return symbol.valueDeclaration ?? symbol.declarations?.[0];
}

function declarationSourcePath(symbol) {
  const declaration = symbolDeclaration(symbol);
  return declaration ? path.resolve(declaration.getSourceFile().fileName) : null;
}

function matchesRegistrySource(declarationPath, sourceFile) {
  if (!declarationPath) return false;
  const expected = path.resolve(sourceRoot, sourceFile);
  if (declarationPath === expected) return true;
  if (path.basename(expected) === "index.ts") {
    return declarationPath.startsWith(`${path.dirname(expected)}${path.sep}`);
  }
  return false;
}

function removeOptionalUndefined(checker, type) {
  if (!type.isUnion()) return type;
  const remaining = type.types.filter((member) => !(member.flags & ts.TypeFlags.Undefined));
  return remaining.length === type.types.length
    ? type
    : checker.getUnionType(remaining, ts.UnionReduction.None);
}

function portableTypeSignature(signature) {
  return signature.replace(/import\("([^"]+)"\)/g, (fullMatch, rawSpecifier) => {
    const specifier = rawSpecifier.replaceAll("\\", "/");
    const nodeModulesMarker = "/node_modules/";
    const nodeModulesIndex = specifier.lastIndexOf(nodeModulesMarker);

    if (nodeModulesIndex >= 0) {
      return `import("${specifier.slice(nodeModulesIndex + nodeModulesMarker.length)}")`;
    }

    return fullMatch;
  });
}

function typeText(checker, type, declaration) {
  return portableTypeSignature(checker.typeToString(
    type,
    declaration,
    ts.TypeFormatFlags.NoTruncation |
      ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
      ts.TypeFormatFlags.WriteArrowStyleSignature,
  ));
}

function declaredTypeText(declaration) {
  if (
    (ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration)) &&
    declaration.type
  ) {
    return declaration.type.getText().replace(/\s+/g, " ").trim();
  }

  return null;
}

function bindingDefaults(root, propNames) {
  const candidates = [];

  function collectBindingElements(pattern, output) {
    for (const element of pattern.elements) {
      if (!ts.isBindingElement(element)) continue;
      const propertyName = element.propertyName?.getText() ?? element.name.getText();
      if (element.initializer) output.set(propertyName, element.initializer.getText());
      if (ts.isObjectBindingPattern(element.name) || ts.isArrayBindingPattern(element.name)) {
        collectBindingElements(element.name, output);
      }
    }
  }

  function visit(node) {
    if (
      ts.isFunctionLike(node) &&
      node.parameters[0] &&
      ts.isObjectBindingPattern(node.parameters[0].name)
    ) {
      const defaults = new Map();
      collectBindingElements(node.parameters[0].name, defaults);
      const names = new Set(
        node.parameters[0].name.elements
          .filter(ts.isBindingElement)
          .map((element) => element.propertyName?.getText() ?? element.name.getText()),
      );
      const score = [...names].filter((name) => propNames.has(name)).length;
      candidates.push({ defaults, score });
    }
    ts.forEachChild(node, visit);
  }

  visit(root);
  candidates.sort((left, right) => right.score - left.score);
  return candidates[0]?.defaults ?? new Map();
}

function componentContract(checker, exportName, symbol) {
  const target = resolveSymbol(checker, symbol);
  const declaration = symbolDeclaration(target);
  if (!declaration) return null;

  const componentType = checker.getTypeOfSymbolAtLocation(target, declaration);
  const signature = componentType.getCallSignatures()[0];
  if (!signature?.parameters[0]) return null;

  const parameter = signature.parameters[0];
  const propsType = checker.getTypeOfSymbolAtLocation(parameter, declaration);
  const allProps = checker.getPropertiesOfType(propsType);
  const publicProps = allProps.filter((prop) =>
    prop.declarations?.some((propDeclaration) =>
      path.resolve(propDeclaration.getSourceFile().fileName).startsWith(`${sourceRoot}${path.sep}`),
    ),
  );
  if (!publicProps.length) return null;

  const defaults = bindingDefaults(declaration, new Set(publicProps.map((prop) => prop.name)));
  const props = publicProps.map((prop) => {
    const propDeclaration = prop.declarations?.find((candidate) =>
      path.resolve(candidate.getSourceFile().fileName).startsWith(`${sourceRoot}${path.sep}`),
    ) ?? prop.valueDeclaration ?? prop.declarations?.[0] ?? declaration;
    const optional = Boolean(prop.flags & ts.SymbolFlags.Optional);
    const rawType = checker.getTypeOfSymbolAtLocation(prop, propDeclaration);
    const resolvedType = optional ? removeOptionalUndefined(checker, rawType) : rawType;
    const sourceFile = propDeclaration.getSourceFile();
    const sourcePosition = sourceFile.getLineAndCharacterOfPosition(propDeclaration.getStart());

    return {
      name: prop.name,
      type: declaredTypeText(propDeclaration) ?? typeText(checker, resolvedType, propDeclaration),
      required: !optional,
      default: defaults.get(prop.name) ?? null,
      description: ts.displayPartsToString(prop.getDocumentationComment(checker)) || null,
      source: `${toPosix(path.relative(repositoryRoot, sourceFile.fileName))}:${sourcePosition.line + 1}`,
    };
  });

  return {
    name: exportName,
    kind: "component",
    signature: typeText(checker, componentType, declaration),
    source: toPosix(path.relative(repositoryRoot, declaration.getSourceFile().fileName)),
    props,
  };
}

function functionContract(checker, exportName, symbol) {
  const target = resolveSymbol(checker, symbol);
  const declaration = symbolDeclaration(target);
  if (!declaration) return null;
  const valueType = checker.getTypeOfSymbolAtLocation(target, declaration);
  const signatures = valueType.getCallSignatures();
  if (!signatures.length) return null;

  return {
    name: exportName,
    kind: "function",
    signature: signatures
      .map((signature) => portableTypeSignature(
        checker.signatureToString(
          signature,
          declaration,
          ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteArrowStyleSignature,
        ),
      ))
      .join(" | "),
    source: toPosix(path.relative(repositoryRoot, declaration.getSourceFile().fileName)),
    description: ts.displayPartsToString(target.getDocumentationComment(checker)) || null,
  };
}

function namespaceContract(checker, exportName, symbol) {
  const target = resolveSymbol(checker, symbol);
  if (!(target.flags & ts.SymbolFlags.Module)) return null;
  const members = checker
    .getExportsOfModule(target)
    .map((member) => functionContract(checker, member.name, member))
    .filter(Boolean);
  if (!members.length) return null;

  return {
    name: exportName,
    kind: "namespace",
    source: members[0].source,
    members,
  };
}

function generateManifest() {
  const registry = parseRegistry();
  const program = createTypeScriptProgram();
  const checker = program.getTypeChecker();
  const packageEntryPath = path.join(sourceRoot, "index.ts");
  const packageEntry = program.getSourceFile(packageEntryPath);
  if (!packageEntry) throw new Error(`Unable to load ${packageEntryPath}.`);
  const packageSymbol = checker.getSymbolAtLocation(packageEntry);
  if (!packageSymbol) throw new Error("Unable to resolve the package entry symbol.");

  const packageExports = checker.getExportsOfModule(packageSymbol);
  const exportMap = new Map(packageExports.map((symbol) => [symbol.name, symbol]));
  const resolvedExports = packageExports.map((symbol) => ({
    symbol,
    target: resolveSymbol(checker, symbol),
  }));

  const components = {};
  const errors = [];

  for (const entry of registry) {
    const selectedNames = new Set(entry.importNames);
    for (const { symbol, target } of resolvedExports) {
      if (matchesRegistrySource(declarationSourcePath(target), entry.sourceFile)) {
        selectedNames.add(symbol.name);
      }
    }

    const apis = [];
    for (const exportName of selectedNames) {
      const symbol = exportMap.get(exportName);
      if (!symbol) {
        errors.push(`${entry.slug}: package export "${exportName}" does not exist.`);
        continue;
      }

      const namespace = namespaceContract(checker, exportName, symbol);
      if (namespace) {
        apis.push(namespace);
        continue;
      }

      const component = /^[A-Z]/.test(exportName)
        ? componentContract(checker, exportName, symbol)
        : null;
      if (component) {
        apis.push(component);
        continue;
      }

      const fn = functionContract(checker, exportName, symbol);
      if (fn) apis.push(fn);
    }

    const importOrder = new Map(entry.importNames.map((name, index) => [name, index]));
    apis.sort((left, right) => {
      const leftOrder = importOrder.get(left.name) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = importOrder.get(right.name) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || left.name.localeCompare(right.name);
    });

    components[entry.slug] = {
      sourcePath: `packages/underverse/src/${entry.sourceFile}`,
      importNames: entry.importNames,
      apis,
    };
  }

  if (errors.length) throw new Error(errors.join("\n"));

  return {
    schemaVersion: 1,
    source: "packages/underverse/src/index.ts",
    components,
  };
}

const manifest = generateManifest();
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
const absoluteTypeImport = /import\("(?:[A-Za-z]:[/\\]|\/)[^"]+"\)/;

if (absoluteTypeImport.test(serialized)) {
  throw new Error(
    "Generated API signatures contain an absolute import path. Normalize it before writing the manifest.",
  );
}

if (checkOnly) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, "utf8") !== serialized) {
    console.error(
      "[docs:api] Generated API reference is stale. Run `npm run docs:generate-api`.",
    );
    process.exitCode = 1;
  } else {
    console.log(
      `[docs:api] ${Object.keys(manifest.components).length} component API contracts are current.`,
    );
  }
} else {
  fs.writeFileSync(outputPath, serialized, "utf8");
  console.log(
    `[docs:api] Generated ${path.relative(repositoryRoot, outputPath)} for ${Object.keys(manifest.components).length} components.`,
  );
}
