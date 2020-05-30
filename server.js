"use strict";

// dotenv config:
// https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786
const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const shortid = require('shortid');
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

/** this project needs a db !! **/
const Schema = mongoose.Schema;
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const shortSchema = new Schema({
  short_url: String,
  original_url:   String,
});
// model
const ShortenedUrl = mongoose.model('ShortenedUrl', shortSchema);
//
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl/new", function(req, res) {
  let url = req.body.url;
  url = url.replace(/https?:\/\//, '');
  dns.lookup(url, function(err, addresses) {
    if (err) {
      return res.json({"error":"invalid URL"});
    }
    var shortUrl = new ShortenedUrl({
      original_url: url,
      short_url: shortid.generate()
    });
    shortUrl.save(function (err, shortUrl) {
      if (err) return console.error(err);
      return res.json({
        "original_url":shortUrl.original_url,
        "short_url":shortUrl.short_url
      });
    });
  });
});
// I can POST a URL to [project_url]/api/shorturl/new and I will receive a shortened URL in the JSON response.
// Example : {"original_url":"www.google.com","short_url":1}
// If I pass an invalid URL that doesn't follow the valid http(s)://www.example.com(/more/routes) format,
// the JSON response will contain an error like {"error":"invalid URL"}. HINT: to be sure that the submitted url points to a valid site you can use the
// function dns.lookup(host, cb) from the dns core module.

// When I visit the shortened URL, it will redirect me to my original link.

app.listen(port, function() {
  console.log("Node.js listening ...");
});
