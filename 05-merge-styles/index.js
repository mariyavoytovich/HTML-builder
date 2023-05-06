const { createWriteStream, createReadStream } = require("fs");
const path = require("path");
const { readdir } = require("fs/promises");

const START_FOLDER = "styles";
const BUNDLE_NAME = "bundle.css";
const DIST_FOLDER = "project-dist";
const CSS_EXTENSION = ".css";

const FILE_FILTER = (dirent) => dirent.isFile() && path.extname(dirent.name) === CSS_EXTENSION;

createCSSBundle();

function createCSSBundle() {
  const startFolderPath = path.join(__dirname, START_FOLDER);
  const bundlePath = path.join(__dirname, DIST_FOLDER, BUNDLE_NAME);
  const bundleStream = createWriteStream(bundlePath);

  readdir(startFolderPath, { withFileTypes: true }).then((results) => {
    const cssFiles = results.filter(FILE_FILTER).map((dirent) => dirent.name);
    const promises = cssFiles.map((file)=> {
      const filePath = path.join(startFolderPath, file);
      return writeFileToBundle(bundleStream, filePath);
    });

    Promise.all(promises).then(() => bundleStream.end());
  });
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
