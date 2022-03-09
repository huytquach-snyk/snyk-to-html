const nReadlines = require('n-readlines');
const path = require('path');

export const codeSeverityMap = { error: 'high', warning: 'medium', info: 'low', note: 'low'};
type codeSource = {
    codelineno: number
    codesource: string
    codesourcehtml: string
};

function stringToHtml(pre: string, highlight: string, post: string){
    const highlightrule = `${pre}<span class="marker">${highlight}</span>${post}`;
    return highlightrule;
}

function readCodeLines(filePath, region){
    try{
        const endLine = region.endLine;
        const startLine = (region.startLine == endLine) ? endLine-4: region.startLine ;
        const codeString: Array<codeSource> = [];
        const readSourceFile = new nReadlines(filePath);
        let startRecording=false;
        let line;
        let lineNumber = 1;
        let parseline = "";
        while (line = readSourceFile.next()) {
            if ( lineNumber == startLine ) startRecording = true;
            else if ( lineNumber == endLine ) {
                parseline = line.toString('ascii');
                parseline = stringToHtml(
                    parseline.substring(0, region.startColumn-1),
                    parseline.substring(region.startColumn-1, region.endColumn),
                    parseline.substring(region.endColumn, parseline.length)
                );
            }
            else if ( lineNumber > endLine ) break;
            if (startRecording){
                codeString.push({codelineno: lineNumber, codesource: `${line}`, codesourcehtml: parseline});
            }
            lineNumber++;
        }
        return codeString;
    } catch (err){
        console.error(err);
    }
}

export function readCodeSnippet(codeInfomation){
    //const filePath = './' + codeInfomation.physicalLocation.artifactLocation.uri;
    const mytest = path.resolve(codeInfomation.physicalLocation.artifactLocation.uri);
    const codeRegion = codeInfomation.physicalLocation.region;
    return  readCodeLines(mytest, codeRegion);
}