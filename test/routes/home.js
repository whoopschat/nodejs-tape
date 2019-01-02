'use strict';
const Tape = require('../../index');

exports.routes = {
  '/upload': { post: Tape.createUploader() },
  '*': { get: 'index' },
}

exports.index = function (req, res, next) {
  let data = {
    a: 1,
    b: 2121
  }
  req.storage.set('a.json', JSON.stringify(data, null, 2)).then(data => {
    res.send('Hello World ' + JSON.stringify(req.config));
    console.log("-------then---------", data)
  })
}