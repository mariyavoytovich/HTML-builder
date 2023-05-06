const { readdir, stat } = require("fs/promises");
const path = require("path");
const { stdout } = require("process");

const SECRET_FOLDER = "secret-folder";

const folderPath = path.join(__dirname, SECRET_FOLDER);

readdir(folderPath, { withFileTypes: true }).then((files) => {
  for (const file of files) {
    if (file.isFile()) {
      const filePath = path.join(folderPath, file.name);
      stat(filePath).then((state) => {
        let { name, ext } = path.parse(filePath);
        ext = ext.split(".")[1];
        stdout.write(`${name} - ${ext} - ${convertToKB(state.size)}kb\n`);
      });
    }
  }
});

function convertToKB(bytes) {
  return (bytes / 1024).toFixed(2);
}
