const request = require("request");
const fs = require("fs");
const path = require("path");
const unzip = require("unzip");

const DEFAULT_HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;",
    "Accept-Encoding": "gzip, deflate, sdch",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64)"
}

export function makeDownloader(download$: any, error$: any) {
    return function (url: string) {
        const urlParts: string[] = url.split("/");
        const downloadHandler = function (error: any, response: any, body: any) {
            if (error) {
                error$(error);
            }
            else {
                if (response.statusCode === 200) {
                    download$({ content: response.body, file: urlParts[urlParts.length - 1] });
                }
                else {
                    error$("Failed with " + response.statusCode);
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

export function makeFileWriter(write$: any, error$: any) {
    return function (baseDir: string, response: any) {
        const targetFile = path.join(baseDir, response.file);
        console.log("Writing to a file " + targetFile);
        fs.writeFile(targetFile, response.content, function (err: any) {
            if (err) { error$(err) }
            else {
                write$(targetFile);
            }
        })
    }
}

export function extract (zipFile: string, targetLocation: string) {
    console.log("Extracting " + zipFile);
    fs.createReadStream(zipFile).pipe(unzip.Extract({ path: targetLocation }));
}