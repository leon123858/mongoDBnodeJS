'use strict';

const mongodb = require('mongodb');
const http = require('http');
const nconf = require('nconf');

// Read in keys and secrets. Using nconf use can set secrets via
// environment variables, command-line arguments, or a keys.json file.
var uri = "mongodb+srv://leon1234858:8ntscpal@cluster0.gyixj.gcp.mongodb.net/sample_airbnb?retryWrites=true&w=majority";
console.log(uri);

mongodb.MongoClient.connect(uri, (err, db) => {
  if (err) {
    throw err;
  }

  // Create a simple little server.
  http.createServer((req, res) => {
    if (req.url === '/_ah/health') {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.write('OK');
      res.end();
      return;
    }
    // Track every IP that has visited this site
    const collection = db.collection('IPs');

    const ip = {
      address: req.connection.remoteAddress
    };

    mongodb.MongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
      if (err) {
        throw err;
      }

     const db = client.db(nconf.get("mongoDatabase"))

      // push out a range
      let iplist = '';
      collection.find().toArray((err, data) => {
        if (err) {
          throw err;
        }
        // Track every IP that has visited this site
        const collection = db.collection('IPs');

        const ip = {
          address: req.connection.remoteAddress
        };

        collection.insertOne(ip, (err) => {
          if (err) {
            throw err;
          }

          // push out a range
          let iplist = '';
          collection.find().toArray((err, data) => {
            if (err) {
              throw err;
            }
            data.forEach((ip) => {
              iplist += `${ip.address}; `;
            });

            res.writeHead(200, {
              'Content-Type': 'text/plain'
            });
            res.write('IPs:\n');
            res.end(iplist);
          });
        });

        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.write('IPs:\n');
        res.end(iplist);
      });
    });
  }).listen(process.env.PORT || 8080, () => {
    console.log('started web process');
  });
});