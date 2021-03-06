'use strict';

/**
 * Makes a request on the socket.
 *
 * @param {object} wrappedSocket The wrapped socket.
 * @param {object} requestCache The request cache to use.
 * @param {object} options Websocket options.
 * @param {*} body The request body to make.
 * @param {number} [timeout] Timeout for the request in milliseconds.
 * @param {function} [cb] The callback to invoke when the request is resolved.
 * @return {Promise|undefined} The request promise if promises are enabled, or undefined.
 */
module.exports = (wrappedSocket, requestCache, options, body, timeout, cb) => {

    const wrappedRequest = {
        _rq: options.generateRequestId(),
        _b: body
    };

    if (timeout) {
        setTimeout(() => {
            requestCache.reject(wrappedRequest._rq, new Error(`Timed out after ${timeout} ms`));
        }, timeout);
    }

    if (cb) {
        requestCache.addCallback(wrappedRequest._rq, cb);
        wrappedSocket.send(wrappedRequest);

    } else if (options.Promise) {
        return new options.Promise((resolve, reject) => {
            requestCache.addPromise(wrappedRequest._rq, resolve, reject);
            wrappedSocket.send(wrappedRequest);
        });

    } else {
        throw new Error('Can\'t make a request without a Promise implementation or callback');
    }
};
