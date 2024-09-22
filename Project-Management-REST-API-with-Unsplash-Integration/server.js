const express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    fs = require('fs'),
    cors = require('cors'),
    routers = require('./server/routes.js');
const port = 3001; // Define the port the server will listen on

const app=express(); // Initialize Express application

// Serve static files
app.use('/list', express.static(path.join(__dirname, 'client/index.html')));
app.use('/js', express.static(path.join(__dirname, 'client/js')));
app.use('/css', express.static(path.join(__dirname, 'client/css')));

// Use body-parser middleware to parse JSON and URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Use the router module for handling routes
app.use('/', routers);

// Start the server and listen on the defined port
const server = app.listen(port, () => {
    console.log('listening on port %s...', server.address().port);
    console.log('go to "http://localhost:3001/list" for client side');
});