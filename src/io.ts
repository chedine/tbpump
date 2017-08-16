const request = require("request");
const fs = require("fs");
const path = require("path");
const unzip = require("unzip");
const mv = require("fs-extra");
const DEFAULT_HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;",
    "Accept-Encoding": "gzip, deflate, sdch",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64)"
}

export function download(url: string, callback: any) {
    const urlParts: string[] = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const downloadHandler = function (error: any, response: any, body: any) {
        if (error) {
            console.log("Download: ERR " + error);
        }
        else {
            if (response.statusCode === 200) {
                callback({ content: response.body, file: fileName });
            }
            else {
                console.log("Download: File = " + fileName + " Code = " + response.statusCode);
            }
        }
    }
    const options = {
        url: url,
        headers: DEFAULT_HEADERS,
        encoding: null
    };
    request(options, downloadHandler);
}


export function saveBhavCopy(baseDir: string, response: any, callback: any) {
    const targetFile = path.join(baseDir, response.file);
    console.log("File: Saving to " + targetFile);
    fs.writeFile(targetFile, response.content, function (err: any) {
        if (err) { console.log("File : Err" + err); }
        else {
            callback(targetFile);
        }
    })
}


export function parseFileName(absPath: string) {
    return path.parse(absPath).base;
}

export function extract(zipFile: string, targetLocation: string, archiveLocation: string, callback: any) {
    console.log("File: Extracting " + zipFile);
    const unzip$ = fs.createReadStream(zipFile).pipe(unzip.Extract({ path: targetLocation }));

    unzip$.on("close", function () {
        const filePath: string = parseFileName(zipFile);
        mv.move(zipFile, (archiveLocation + "/" + filePath));
        callback(targetLocation + "/" + filePath.substring(0, filePath.length - 4));
    });
}
