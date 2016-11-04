'use strict';
const Hapi = require('hapi');
const Inert = require('inert');
const Path = require('path');
var Web3 = require('web3');
var locus = require('locus');
var fs = require('fs');


var aadhar_data = JSON.parse(fs.readFileSync('mocked_aadhar_api.json', 'utf8'));

const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  }
});
var web3 = new Web3(new Web3.providers.HttpProvider("http://128.199.116.249:8545"));
var coinbase = web3.eth.coinbase;
var balance = web3.eth.getBalance(coinbase);

server.connection({
  host: 'localhost',
  port: 8888
});
server.register(Inert, () => {});

server.route({
  method: 'GET',
  path: '/ping',
  handler: function (request, reply) {
    reply('ping');
  }
});


server.start((
  err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});

server.route({
    method: 'POST',
    path: '/register',
    config: {

        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data'
        },

        handler: function (request, reply) {
            var data = request.payload;
            if (data.file) {
                var name = data.file.hapi.filename;
                var path = __dirname + "/uploads/" + name;
                var file = fs.createWriteStream(path);

                file.on('error', function (err) { 
                    console.error(err) 
                });

                data.file.pipe(file);
                data.file.on('end', function (err) { 
                    var ret = {
                        filename: data.file.hapi.filename,
                        headers: data.file.hapi.headers
                    }
                    var filename = file.path;
                    fs.readFile(filename, 'utf8', function(err, content) {
                      if (err) throw err;
                      var aadhar_id = request.payload.aadhar_id
                      if(content == aadhar_data[aadhar_id]["fingerprint"]){
                        reply(content)
                      }else{
                        reply({
                          "status": "error",
                          "message": "aadhar_id invalid"
                        })
                      }
                      
                    });
                })
            }

        }
    }
});

