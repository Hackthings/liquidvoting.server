'use strict';
const Hapi = require('hapi');
const Inert = require('inert');
const Path = require('path');
var Web3 = require('web3');
var locus = require('locus');
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
