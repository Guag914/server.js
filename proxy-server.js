const express = require('express');
const request = require('request');  // For making requests to external websites
const app = express();
const port = 3000;

// This middleware will handle proxy requests to any website
app.use('/proxy', (req, res) => {
    const targetUrl = req.query.url;  // Get the URL to proxy from the query string
    if (!targetUrl) {
        return res.status(400).send('Missing URL parameter');
    }

    // Check if the URL is valid (basic validation for "http" or "https")
    if (!/^https?:\/\//.test(targetUrl)) {
        return res.status(400).send('Invalid URL');
    }

    // Make a request to the external website
    request(targetUrl)
        .on('response', (response) => {
            // Pipe the response from the external website to the client
            res.status(response.statusCode);
            response.pipe(res);  // Pipe the response directly
        })
        .on('error', (err) => {
            res.status(500).send(`Error with proxy request: ${err.message}`);
        });
});

// Serve a basic HTML page where users can input the URL they want to search
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Proxy Search</title>
            </head>
            <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                <h1>Enter URL to Proxy</h1>
                <form action="/proxy" method="get">
                    <input type="text" name="url" placeholder="Enter URL (e.g., https://bravesearch.org)" required style="padding: 10px; width: 300px; font-size: 16px;">
                    <button type="submit" style="padding: 10px; font-size: 16px;">Search</button>
                </form>
            </body>
        </html>
    `);
});

// Start the server on port 3000
app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
