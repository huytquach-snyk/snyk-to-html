import { RSA_X931_PADDING } from "constants";

const path = require('path');
const events = require('events');
const fs = require('fs');
const readline = require('readline');

export const codeSeverityMap = {
  error: 'high',
  warning: 'medium',
  info: 'low',
  note: 'low',
};
type codeSource = {
  codelineno: number;
  codesource: string;
  codepremarker: string;
  codemarker: string;
  codepostmarker: string;
};

async function processCodeLine(filePath, region) {
  try {
    const endLine = region.endLine;
    const startLine =
      region.startLine == endLine ? endLine - 4 : region.startLine;
    const codeString: Array<codeSource> = [];
    let startRecording = false;
    let lineNumber = 1;
    let parseline = '';
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath)
    });
    rl.on('line', (line) => {
      const codeMarker: codeSource = {codelineno:0, codesource: "", codepremarker:"", codemarker:"", codepostmarker:""};
      if (lineNumber == startLine) startRecording = true;
      else if (lineNumber == endLine) {
        parseline = line.toString('ascii');
        codeMarker.codepremarker = parseline.substring(0, region.startColumn - 1);
        codeMarker.codemarker = parseline.substring(
          region.startColumn - 1,
          region.endColumn,
        );
        codeMarker.codepostmarker = parseline.substring(
          region.endColumn,
          parseline.length,
        );
      } else if (lineNumber > endLine) rl.close();
      if (startRecording) {
        codeMarker.codelineno = lineNumber;
        codeMarker.codesource = `${line}`;
        codeString.push(codeMarker);
      }
      lineNumber++;
    });

    await events.once(rl, 'close');
    return codeString;
  } catch (err) {
    console.error(err);
  }
};

export async function readCodeSnippet(codeInfomation){
  const filePath = path.resolve(
    codeInfomation.physicalLocation.artifactLocation.uri,
  );
  const codeRegion = codeInfomation.physicalLocation.region;
  const result = await processCodeLine(filePath, codeRegion);
  return result;
}

export function getCurrentDirectory() {
  //return path.dirname(__dirname);
  return process.cwd();
}
