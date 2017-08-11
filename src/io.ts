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

export function makeDownloader(download$: stream, error$: stream) {
    return function (url: string) {
        const urlParts: string[] = url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const downloadHandler = function (error: any, response: any, body: any) {
            if (error) {
                error$(error);
            }
            else {
                if (response.statusCode === 200) {
                    download$({ content: response.body, file: fileName });
                }
                else {
                    error$("Download: File = " + fileName + " Code = " + response.statusCode);
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
}

export function makeFileWriter(write$: stream, error$: stream) {
    return function (baseDir: string, response: any) {
        const targetFile = path.join(baseDir, response.file);
        console.log("File: Saving to " + targetFile);
        fs.writeFile(targetFile, response.content, function (err: any) {
            if (err) { error$(err) }
            else {
                write$(targetFile);
            }
        })
    }
}

export function parseFileName(absPath: string) {
    return path.parse(absPath).base;
}
export function extractAndArchive(zipFile: string, targetLocation: string, archiveLocation: string) {
    console.log("File: Extracting " + zipFile);
    const unzip$ = fs.createReadStream(zipFile).pipe(unzip.Extract({ path: targetLocation }));
    const filePath: string = parseFileName(zipFile);
    mv.move(zipFile, (archiveLocation + "/" + filePath));
    return targetLocation + "/" + filePath.substring(0, filePath.length - 4);
}

export function makeExtractor(completion$: stream) {
    return function (zipFile: string, targetLocation: string, archiveLocation: string) {
        console.log("File: Extracting " + zipFile);
        const unzip$ = fs.createReadStream(zipFile).pipe(unzip.Extract({ path: targetLocation }));

        unzip$.on("close", function () {
            const filePath: string = parseFileName(zipFile);
            mv.move(zipFile, (archiveLocation + "/" + filePath));
            completion$(targetLocation + "/" + filePath.substring(0, filePath.length - 4));
        });
    }
}