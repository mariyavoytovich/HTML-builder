const fs = require("fs");
const path = require("path");
const {stdout} = require("process");

const readableFilePath = path.join(__dirname, "text.txt");
const readStream = fs.createReadStream(readableFilePath, "utf-8");
readStream.on("data", (data)=> stdout.write(data));