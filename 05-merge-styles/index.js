const { createWriteStream, createReadStream } = require("fs");
const path = require("path");
const { readdir } = require("fs/promises");
const { stdout } = require("process");

const START_FOLDER = "styles";
const BUNDLE_NAME = "bundle.css";
const DIST_FOLDER = "project-dist";
const CSS_EXTENSION = ".css";

const FILE_FILTER = (dirent) => dirent.isFile() && path.extname(dirent.name) === CSS_EXTENSION;

createCSSBundle();

async function createCSSBundle() {
  const startFolderPath = path.join(__dirname, START_FOLDER);
  const bundlePath = path.join(__dirname, DIST_FOLDER, BUNDLE_NAME);

  const files = await readdir(startFolderPath, { withFileTypes: true });
  const cssFiles = files.filter(FILE_FILTER).map(({ name }) => path.join(startFolderPath, name));

  for await(const info of bundleSSS(bundlePath, cssFiles)){
    stdout.write(`${ info }\n`);
  }
}

async function* bundleSSS(cssBundlePath, cssFiles){
  const bundleStream = createWriteStream(cssBundlePath);
  for(const cssFile of cssFiles){
    await writeFileToBundle(bundleStream, cssFile);
    bundleStream.write('\n');
    yield cssFile;
  }
}

function writeFileToBundle(bundleStream, filePath) {
  const readStream = createReadStream(filePath);
  return new Promise((resolve, reject) => {
    bundleStream.on("error", reject);
    readStream.on("error", reject);
    readStream.on("end", resolve);
    readStream.pipe(bundleStream, { end: false });
  });
}
