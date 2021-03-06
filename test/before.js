'use strict';

const http = require('http');
const os = require('os');

const express = require('express');
const io = require('socket.io');
const writejson = require('writejson');
const readjson = require('readjson');

process.env.NODE_ENV = 'development';

const cloudcmd = require('../server/cloudcmd');
const {assign} = Object;

const pathConfig = os.homedir() + '/.cloudcmd.json';
const currentConfig = readjson.sync.try(pathConfig);

module.exports = (options, fn = options) => {
    if (fn === options) {
        options = {};
    }
    
    const {config, plugins, modules} = options;
    
    const app = express();
    const server = http.createServer(app);
    const after = () => {
        if (currentConfig)
            writejson.sync(pathConfig, currentConfig);
        
        server.close();
    };
    
    const socket = io.listen(server);
    
    app.use(cloudcmd({
        socket,
        plugins,
        config: assign(defaultConfig(), config),
        modules,
    }));
    
    server.listen(() => {
        fn(server.address().port, after);
    });
};

function defaultConfig() {
    return {
        auth: false,
        root: __dirname
    };
}

