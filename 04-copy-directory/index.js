const { constants } = require("fs");
const { readdir, mkdir, copyFile, rm } = require("fs/promises");
const { stdout } = require("process");
const path = require("path");

const COPY_FOLDER = "files";
const FOLDER_SUFFIX = "-copy";

const copyFolderName = `${COPY_FOLDER}${FOLDER_SUFFIX}`;

rm(path.join(__dirname, copyFolderName), {recursive: true, force: true}).then(() => {
  copyFolder(COPY_FOLDER, __dirname, __dirname, copyFolderName);
});

function copyFolder(folder, from, to, newName) {
  const folderPath = path.join(from, folder);
  const newFolderPath = path.join(to, newName ?? folder);
  mkdir(newFolderPath, { recursive: true }).then((err) => {
    if (err) stdout.write(err);
    copyFilesFormFolder(folderPath, newFolderPath);
  });
}

function copyFilesFormFolder(from, to) {
  readdir(from, { withFileTypes: true }).then((dirents) => {
    for (const dirent of dirents) {
      const { name } = dirent;
      if (dirent.isFile()) {
        copyFileFrom(name, from, to);
      }
      if (dirent.isDirectory()) {
        copyFolder(name, from, to);
      }
    }
  });
}

function copyFileFrom(fileName, from, to) {
  const filePath = path.join(from, fileName);
  const destinationPath = path.join(to, fileName);
  copyFile(filePath, destinationPath, constants.COPYFILE_FICLONE);
}
