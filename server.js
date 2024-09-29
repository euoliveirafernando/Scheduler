import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

const port = 4200;

const MYME_TYPES = {
    default: "application/octet-stream",
    html: "text/html; charset=UTF-8",
    js: "application/javascript",
    css: "text/css",
    png: "image/png",
    jpg: "image/jpg",
    gif: "image/gif",
    ico: "image/x-icon",
    svg: "image/svg+xml"
};

const static_path = path.join("frontend/static");

const toBool = [() => true, () => false];

const prepareFile = async (url) => {
    const paths = [static_path, url];
    
    if (url.endsWith("/"))
        paths.push("index.html");

    const filePath = path.join(...paths);
    const pathTransversal = !filePath.startsWith(static_path);
    const exists = await fs.promises.access(filePath).then(...toBool);
    const found = !pathTransversal && exists;
    const streamPath = found ? filePath : static_path + "404.html";
    const ext = path.extname(streamPath).substring(1).toLowerCase();
    const stream = fs.createReadStream(streamPath);
    
    return {found, ext, stream};
};

http.createServer(async (req, res) => {
    const file = await prepareFile(req.url);
    const statusCode = file.found ? 200 : 404;
    const mimeType = MYME_TYPES[file.ext] || MYME_TYPES.default;
    res.writeHead(statusCode, {"Content-Type" : mimeType});
    file.stream.pipe(res);
    console.log(`${req.method} ${req.url} ${statusCode}`);
}).listen(port);

console.log(`Server running at http://127.0.0.1:${port}/`);