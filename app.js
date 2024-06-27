
require('dotenv').config();

console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
console.log('SESSION_KEY   :', process.env.SESSION_KEY);
console.log('SQLITE_DB     :', process.env.SQLITE_DB);

const MODE = process.argv[2];

let CookieSecureMode;

switch(MODE) {
  case 'PROD': {
    console.log('\nProduction Mode\n');
    CookieSecureMode = true;
    FastifyLoggerMode = false;
  } break;
  case 'BUILD': {
    console.log('\nBuild Mode\n');
    CookieSecureMode = false;
    FastifyLoggerMode = false;
  } break;
  case 'DEV': {
    console.log('\nDevelopment Mode\n');
    CookieSecureMode = false;
    FastifyLoggerMode = true;
  } break;
  case undefined: {
    console.log('\nNEED A MODE ARGUMENT\n\n\tMODES:\n\n\t\tPROD, BUILD, DEV\n');
    process.exit(1);
  }
  default: {
    console.log(`\nTHE MODE '${MODE}' SPECIFIED IS WRONG\n\n\tMODES:\n\n\t\tPROD, BUILD, DEV\n`);
    process.exit(1);
  }
}

const fastify = require('fastify')({logger:FastifyLoggerMode});
const fastifyStatic = require('@fastify/static');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');
const fastifyHelmet = require('@fastify/helmet');

const path = require('path');
const os = require('os');
const networkInterfaces = os.networkInterfaces();

const betterSqlite3Store = require('fastify-session-better-sqlite3-store');
const sqlite3db = require('better-sqlite3')(`./${process.env.SQLITE_DB}`);

const PORT = process.env.PORT || 8080;

fastify.register(fastifyCookie);
fastify.register(fastifySession,{
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: CookieSecureMode,
    httpOnly: true,
    maxAge: 3600000, 
  },
  saveUninitialized: false,
  store: new betterSqlite3Store(sqlite3db)
});

fastify.register(fastifyHelmet, { global : true } );

fastify.register(fastifyStatic.default, {
  root: path.join(__dirname, 'public')
});

fastify.register(require('@fastify/formbody'));

fastify.register(require('./routes'));

fastify.register(require('./actions'));

const start = async () => {
  try {
    await fastify.listen({port: PORT, host:'::'});
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
start();

// arguments
if(MODE === 'BUILD') {
  console.log('\nBUILD MODE - Closes in 10 seconds');
  setTimeout(()=> {
    console.log('Build Working!');
    process.exit(0);
  },10000);
}

// display device's network IP
if(typeof(networkInterfaces.wlp2s0) !== 'undefined') {
  console.log(`\n(a) | app-server-ip: ${networkInterfaces.wlp2s0[0].address}:${PORT}\\\n\n`);
} else if(typeof(networkInterfaces.enp3s0f1) !== 'undefined') {
  console.log(`\n(b) | app-server-ip: ${networkInterfaces.enp3s0f1[0].address}:${PORT}\\\n\n`);
} else if(typeof(networkInterfaces['Wi-Fi'])!=='undefined') {
 // console.log(`\n(c) | app-server-ip: ${networkInterfaces['Wi-Fi'][1].address}:${PORT}\\\n\n`);
} else if(typeof(networkInterfaces.Ethernet) !== 'undefined') {
  console.log(`\n(d) | app-server-ip: ${networkInterfaces.Ethernet[1].address}:${PORT}\\\n\n`);
} else if(typeof(networkInterfaces.enxca131647a229) !== 'undefined') {
  console.log(`\n(e) | app-server-ip: ${networkInterfaces.enxca131647a229[0].address}:${PORT}\\\n\n`);
} else {
  console.log('network out : ', networkInterfaces);
  console.log('\nno IP found for sharing over the network\n\n');
}