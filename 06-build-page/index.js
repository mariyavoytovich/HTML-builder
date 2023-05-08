const path = require("path");
const { createWriteStream, createReadStream } = require("fs");
const { mkdir } = require("fs/promises");
const { createInterface } = require("readline");

//Folders
const RESULT_FOLDER = "project-dist";
const COMPONENTS_FOLDER = "components";

const TEMPLATE_HTML = "template.html";
const RESULT_HTML = "index.html";

const COMPONENT_PATTERN = /{{(.*?)}}/;

const distFolderPath = path.join(__dirname, RESULT_FOLDER);

createFolder(distFolderPath).then(() => {
  const templateHtmlPath = path.join(__dirname, TEMPLATE_HTML);
  const bundleHtmlPath = path.join(distFolderPath, RESULT_HTML);
  bundleHtml(templateHtmlPath, bundleHtmlPath);
});

function createFolder(folderPath) {
  return mkdir(folderPath, { recursive: true });
}

async function bundleHtml(htmlPath, bundleHtmlPath) {
  const bundleHTMLStream = createWriteStream(bundleHtmlPath);

  for await (let line of componentReader(htmlPath)) {
    bundleHTMLStream.write(line);
  }

  bundleHTMLStream.end();
}

async function* componentReader(componentPath) {
  const readline = createInterface({
    input: createReadStream(componentPath),
    crlfDelay: Infinity,
  });

  for await (const line of readline) {
    const [isComponent, parsedLine] = parseLine(line);
    isComponent
      ? yield* componentReader(path.join(__dirname, COMPONENTS_FOLDER, `${parsedLine}.html`))
      : yield `${line}\n`;
  }

  readline.close();
}

function parseLine(line) {
  const isComponent = COMPONENT_PATTERN.test(line);
  return [isComponent, isComponent ? line.match(COMPONENT_PATTERN)[1] : line];
}