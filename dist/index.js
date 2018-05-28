"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
var vorpal = require('vorpal')();
vorpal
    .command('health', 'Checks to see if Elysian running')
    .action(function (args, callback) {
    console.log('Check Elysian');
    axios_1.default.get('http://app:5000').then((response) => {
        callback(response.data);
    });
});
vorpal
    .delimiter('elysian$')
    .show();
