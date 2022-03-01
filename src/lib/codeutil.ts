import { relativeTimeRounding } from "moment";

export const codeSeverityMap = { error: 'high', warning: 'medium', info: 'low', note: 'low'};
const nReadlines = require('n-readlines');

type codeSource = {
    codelineno: number
    codesource: string
};

function readCodeLines(filePath, lines){
    try{
        const endLine = lines.endLine;
        const startLine = (lines.startLine == endLine) ? endLine-4: lines.startLine ;
        const codeString: Array<codeSource> = [];
        const readSourceFile = new nReadlines(filePath);
        
        let startRecording=false;
        let line;
        let lineNumber = 1;

        while (line = readSourceFile.next()) {

            if ( lineNumber == startLine ) startRecording = true;
            if ( lineNumber > endLine ) break;
            if (startRecording){
                //source.codelineno = lineNumber;
                //source.codesource = `${line}`;
                codeString.push({codelineno: lineNumber, codesource:`${line}`});
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
