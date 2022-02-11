import { relativeTimeRounding } from "moment";

export const codeSeverityMap = { error: 'high', warning: 'medium', info: 'low'};
const nReadlines = require('n-readlines');

function readCodeLines(filePath, lines){
    try{
        const endLine = lines.endLine;
        const startLine = (lines.startLine == endLine) ? endLine-4: lines.startLine ;
        const codeString: Array<string> =[];
        const readSourceFile = new nReadlines(filePath);
        
        let startRecording=false;
        let line;
        let lineNumber = 1;

        while (line = readSourceFile.next()) {

            if ( lineNumber == startLine ) startRecording = true;
            if ( lineNumber > endLine ) break;
            if (startRecording){
                codeString.push(lineNumber + `: ${line}`);
            }
            lineNumber++;
        }

        return codeString;
    } catch (err){
        console.error(err);
    }
}

export function readCodeSnippet(codeInfomation){

    const filePath = './' + codeInfomation.physicalLocation.artifactLocation.uri;
    const codeRegion = codeInfomation.physicalLocation.region;
    
    return  readCodeLines(filePath, codeRegion);
}
