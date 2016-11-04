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
        relativeTo: Path.join(__dirname, 'uploads')
      }
    }
  }
});
var web3 = new Web3(new Web3.providers.HttpProvider("http://128.199.116.249:8545"));
var coinbase = web3.eth.coinbase;
var balance = web3.eth.getBalance(coinbase);

server.connection({
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

function createServeWallet(password) {
  var addr = web3.personal.newAccount(password);

  var exec = require('child_process').exec;
  var cmd = 'ag -g "'+ addr +'"';


    exec(cmd, function(error, stdout, stderr) {
      cpcmd = 'http://128.199.116.249:8888/keystore/'+stdout;
      reply(cpcmd);
    });
  }

server.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: '.',
      redirectToSlash: true,
      index: true
    }
  }
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
                      if(aadhar_data[aadhar_id] == undefined){
                        reply({
                          "status": "error",
                          "message": "aadhar_id invalid"
                        }).code(402)
                      }else if(content == aadhar_data[aadhar_id]["fingerprint"]){
                        var wallet = createServeWallet('123');
                        reply(wallet);
                      }else{
                        reply({
                          "status": "error",
                          "message": "aadhar_id and fingerprint do not match"
                        }).code(402)
                      }

                    });
                })
            }

        }
    }
});
