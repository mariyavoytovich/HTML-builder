const path = require('path');
const { constants } = require('fs');
const { createWriteStream, createReadStream } = require('fs');
const { mkdir, readdir, copyFile } = require('fs/promises');
const { createInterface } = require('readline');
const { stdout } = require('process');

//Folders
const RESULT_FOLDER = 'project-dist';
const COMPONENTS_FOLDER = 'components';
const ASSETS_FOLDER = 'assets';
const STYLES_FOLDER = 'styles';

const TEMPLATE_HTML = 'template.html';
const RESULT_HTML = 'index.html';

const CSS_BUNDLE_NAME ='style.css';

const COMPONENT_PATTERN = /{{(.*?)}}/;

const distFolderPath = path.join(__dirname, RESULT_FOLDER);

createFolder(distFolderPath).then(() => {
  const templateHtmlPath = path.join(__dirname, TEMPLATE_HTML);
  const bundleHtmlPath = path.join(distFolderPath, RESULT_HTML);
  return Promise.all([bundleHtml(templateHtmlPath, bundleHtmlPath), copyAssets(), bundleCSS()]);
})
.catch((error)=> stdout.write(error.message));

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

async function copyAssets(){
  await copyFolder(ASSETS_FOLDER, __dirname, distFolderPath);
}

async function copyFolder(folderName, from, to){
  const folderPath = path.join(from, folderName);
  const copyFolderPath = path.join(to, folderName);
  await createFolder(copyFolderPath);
  await copyFolderContent(folderPath, copyFolderPath);
}

async function copyFolderContent(from, to){
  const content = await readdir(from, {withFileTypes: true});
  for(const component of content){
    await copyFolderComponent(component, from, to);
  }
}

function copyFolderComponent(component, from, to) {
  const { name } = component;

  if(component.isFile()){
    return copyFolderFile(name, from, to);
  }

  if(component.isDirectory()){
    return copyFolder(name, from, to);
  }
}

function copyFolderFile(fileName, from, to){
  const filePath = path.join(from, fileName);
  const destinationPath = path.join(to, fileName);
  return copyFile(filePath, destinationPath, constants.COPYFILE_FICLONE);
}

async function bundleCSS(){
  const stylesFolderPath = path.join(__dirname, STYLES_FOLDER);
  const bundlePath = path.join(distFolderPath, CSS_BUNDLE_NAME);
  const bundleStream = createWriteStream(bundlePath);

  const styles = await readdir(stylesFolderPath, { withFileTypes: true });
  for(const { name } of styles){
    const stylePath = path.join(stylesFolderPath, name);
    await pipeContentToBundle(bundleStream, stylePath);
  }

  bundleStream.end();
}

function pipeContentToBundle(bundleStream, filePath) {
  const readStream = createReadStream(filePath);
  return new Promise((resolve, reject) => {
    bundleStream.on('error', reject);
    readStream.on('error', reject);
    readStream.on('end', resolve);
    readStream.pipe(bundleStream, { end: false });
  });
}

