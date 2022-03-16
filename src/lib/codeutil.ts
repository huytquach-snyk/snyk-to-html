import { RSA_X931_PADDING } from "constants";

const nReadlines = require('n-readlines');
const path = require('path');

export const codeSeverityMap = {
  error: 'high',
  warning: 'medium',
  info: 'low',
  note: 'low',
};
type codeSource = {
  codelineno: number;
  block: boolean;
  codesource: string;
  codepremarker: string;
  codemarker: string;
  codepostmarker: string;
};

function readCodeLines(filePath, region) {
  try {
    const endLine = region.endLine;
    const startLine = region.startLine;
    const multiLine =
      region.startLine == endLine ? false : true;
    const codeString: Array<codeSource> = [];
    const readSourceFile = new nReadlines(filePath);
    let line;
    let lineNumber = 1;
    let parseline = '';
    let columnEndOfLine;
    const codeMarker: codeSource = {codelineno:0, block: multiLine, codesource: "", codepremarker:"", codemarker:"", codepostmarker:""};
    while ((line = readSourceFile.next())) {
      parseline = line.toString('ascii');
      if (lineNumber == startLine){
        if (multiLine) {
          columnEndOfLine = parseline.length;
        }
        else {
          columnEndOfLine = region.endColumn;
        }
        codeMarker.codelineno = lineNumber;
        codeMarker.codepremarker = parseline.substring(0, region.startColumn - 1);
        codeMarker.codemarker = parseline.substring(
          region.startColumn - 1,
          columnEndOfLine,
        );
      }
      if (lineNumber == endLine) {
        if (multiLine){
          codeMarker.codemarker = codeMarker.codemarker + "\n" + parseline.substring(
            0,
            region.endColumn,
          );
        }
        codeMarker.codepostmarker =  parseline.substring(
          region.endColumn,
          parseline.length,
        );
        break;
      }
      if ( lineNumber>startLine && lineNumber < endLine){
        codeMarker.codemarker = codeMarker.codemarker + "\n" + parseline;
      }
      lineNumber++;
    }

    codeString.push(codeMarker);
    readSourceFile.close();
    
    return codeString;
  } catch (err) {
    console.error('Error reading: ' + filePath);
    console.error(err);
  }
}

export function readCodeSnippet(codeInfomation) {
  const filePath = path.resolve(
    codeInfomation.physicalLocation.artifactLocation.uri,
  );
  const codeRegion = codeInfomation.physicalLocation.region;
  return readCodeLines(filePath, codeRegion);
}

export function getCurrentDirectory() {
  //return path.dirname(__dirname);
  return process.cwd();
}
