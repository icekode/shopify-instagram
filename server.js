// Shoppify Instagram App
// Kareem Glover kareem @ icekode.com
// 10-26-19
// (C) 2019 IceKode Creations

require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const https = require('https');
const fs = require('fs')
const path = require('path');

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 443;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;

// APP
app.prepare().then(() => {
    // Routing Middleware
    const server = new Koa();
    server.use(session(server));
    server.keys = [SHOPIFY_API_SECRET_KEY];
    server.use(
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET_KEY,
            scopes: ['read_products'],
            afterAuth(ctx) {
                const { shop, accessToken } = ctx.session;
                     ctx.cookies.set('shopOrigin', shop, { httpOnly: false });
                ctx.redirect('/');
            },
        }),
    );

    server.use(verifyRequest());
    server.use(async (ctx) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
        return
    });

    //Setting up Port
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
    } catch (ex) {
        console.error('Failed to start HTTPS server\n', ex, (ex && ex.stack));
    }

    /*
    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
*/
});

