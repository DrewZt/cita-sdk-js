"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ABICoder = require('web3-eth-abi');
exports.LogParser = (log, abi) => {
    if (typeof log === 'string')
        return log;
    if (!abi)
        throw new Error('ABI Missed');
    if (abi.length === undefined)
        throw new Error('ABI must be type of array');
    const topics = abi.filter((input) => input.indexed).length ===
        log.topics.length
        ? log.topics
        : log.topics.slice(1);
    const decodedLogs = ABICoder.decodeLog(abi, log.data || '', topics);
    return Object.assign({}, log, { decodedLogs });
};
