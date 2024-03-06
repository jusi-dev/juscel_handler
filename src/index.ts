import express from 'express'
require('dotenv').config()

const app = express()

import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({});

app.get("/*", async (req, res) => {
    try {
        console.log("Got Request")
        const host = req.hostname;
        const id = host.split(".")[0];
        console.log("this is the host: ", host, "this is the id: ", id)
        const filePath = req.path === "/" ? "/index.html" : req.path;

        const downloadCommand = new GetObjectCommand({
            Bucket: "juscel",
            Key: `dist/${id}${filePath}`,
        });

        const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
        res.set('Content-Type', type);

        s3Client.send(downloadCommand).then((data) => {
            // @ts-ignore
            let streamData = [];
            // @ts-ignore
            data.Body.on('data', (chunk) => {
                streamData.push(chunk);
            }).on('end', () => {
                // @ts-ignore
                let content = Buffer.concat(streamData);
                res.send(content);
            });
        });
    } catch (err) {
        console.log(err)
    }
})

app.listen(3001);
