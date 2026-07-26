import path from "node:path";
import { createRequire } from "node:module";

const requirePackage = createRequire(path.resolve(import.meta.dirname, "../../package.json"));

const React = requirePackage("react");
const reactDomClient = requirePackage("react-dom/client");
const reactDomServer = requirePackage("react-dom/server");

export default React;
export const createRoot = reactDomClient.createRoot;
export const renderToStaticMarkup = reactDomServer.renderToStaticMarkup;
