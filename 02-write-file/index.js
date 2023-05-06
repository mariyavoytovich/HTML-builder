const fs = require('fs');
const path = require('path');
const { stdout, stdin, exit } = require('process');
const { createInterface } = require('readline');

const GREETING_MASSAGE = 'Hi! Please, enter the text: \n';
const EXIT_COMMAND = 'exit';

const writeFilePath = path.join(__dirname, 'text.txt');
const writableStream = createWritableStream();
const readline = createReadStream();
readline.prompt();

function createWritableStream() {
  const stream = fs.createWriteStream(writeFilePath);
  stream.on('error', (error) => { stdout.write(`An error occured while writing to the file. Error: ${error.message}`); });
  return stream;
}

function createReadStream() {
  const readline = createInterface({
    input: stdin,
    output: stdout,
    prompt: GREETING_MASSAGE,
  });

  readline
    .on('line', lineEventHandler)
    .on('close', closeWritableStreamAndExit)
    .on('SIGINT', closeWritableStreamAndExit);

  return readline;
}

function closeWritableStreamAndExit(){
  writableStream.end();
  writableStream.on('finish', endProcess);
}

function endProcess() {
  stdout.write(`All your sentences have been written to ${writeFilePath}\n`);
  stdout.write('Bye!');
  exit();
}

function lineEventHandler(line){
  switch (line.trim()) {
    case EXIT_COMMAND :
      readline.close();
      break;
    default:
      sentence = `${line}\n`;
      writableStream.write(sentence);
      break;
  }
}
