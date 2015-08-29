/*jslint node: true */
"use strict";

var rates = require('./src/rates-sources/index.js');

function get(options) {
  //return rates.cdi.portalDeFinancas.get(options);
  return rates.selic.bcb.get(options);
  
}
if (process.argv[1]) {
  get(process.argv[1])
    .then(function (data) {
      console.log(data);
    }).fail(function (err) {
      console.log(err);
      return;
    });
}

exports.get = get;
