#!/usr/bin/env node
//require dependencies
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();
const port = 3000;
const model = require('./model/model');

const fs = require('fs')
const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(express.static(__dirname + '/public'))

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//start Express server on defined port
app.listen(port);

// Storage file
var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./public/images");
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});
var upload = multer({ storage: Storage }).single('ct_img'); //Field name and max count

//define a route, usually this would be a bunch of routes imported from another file
app.get('/', function (req, res, next) {
    res.send('Welcome to the BearHunt, Inc. API');
});

//log to console to let us know it's working
console.log('BearHunt, Inc. API server started on: ' + port);

// app.post('/api/login' , model)
// app.post('/api/logout' , model.event.event.get_list)
// app.post('/api/logout' , model.event.event.get_list)

// --- Event ---
app.get('/api/event' , model.event.event.get_list)
app.get('/api/event/:id' , model.event.event.get_data)
app.post('/api/event' , model.event.event.save_data)
app.put('/api/event/:id' , model.event.event.save_data)
app.delete('/api/event/:id' , model.event.event.delete_data)

// --- Project ---
app.post('/api/project' , model.project.project.get_list)
app.get('/api/project/:id' , model.project.project.get_data)
app.put('/api/project' , model.project.project.save_data)
app.put('/api/project/:id' , model.project.project.save_data)
app.delete('/api/project/:id' , model.project.project.delete_data)