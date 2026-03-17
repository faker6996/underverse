import path from "node:path";
import { createRequire } from "node:module";

const requireWorkspace = createRequire(path.resolve(import.meta.dirname, "../../../../package.json"));

const React = requireWorkspace("react");
const reactDomServer = requireWorkspace("react-dom/server");

export default React;
export const renderToStaticMarkup = reactDomServer.renderToStaticMarkup;
