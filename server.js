// Shoppify Instagram App
// Kareem Glover kareem @ icekode.com
// 10-26-19
// (C) 2019 IceKode Creations

'use strict';

const fs = require('fs');

const path = require('path');

const https = require('https');

const Koa = require('koa');

const server = new Koa();

// add main routes

// the following routes are for the authorisation challenges

// ... we'll come back to this shortly

const router = require('./router.js');

server

.use(router.routes())

.use(router.allowedMethods());

const config = {

domain: 'shopifydev.icekode.com', // your domain

https: {

port: 443, // any port that is open and not already used on your server

options: {

key: fs.readFileSync(path.resolve(process.cwd(), '../../../etc/letsencrypt/live/shopifydev.icekode.com/privkey.pem'), 'utf8').toString(),

cert: fs.readFileSync(path.resolve(process.cwd(), '../../../etc/letsencrypt/live/shopifydev.icekode.com/fullchain.pem'), 'utf8').toString(),

},

},

};

const serverCallback = server.callback();

try {

const httpsServer = https.createServer(config.https.options, serverCallback);

httpsServer

.listen(config.https.port, function(err) {

if (!!err) {

console.error('HTTPS server FAIL: ', err, (err && err.stack));

}

else {

console.log(`HTTPS server OK: https://${config.domain}:${config.https.port}`);

}

});

}

catch (ex) {

console.error('Failed to start HTTPS server\n', ex, (ex && ex.stack));

}
