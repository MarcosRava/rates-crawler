/*jslint node: true */
"use strict";

var url = 'http://www.portaldefinancas.com/js-tx/cdidiaria.js';
var request = require('request');
var cheerio = require('cheerio');
var Q = require('q');
var extend = require('extend');
var moment = require('moment');
var dateFormat = "DD/MM/YY";
var rateType = "cdi";
var source = "Portal de Finanças";
var deferred, $, date, firstTr, rate;

function get(requestOptions) {
  
  deferred = Q.defer();
  
  var options = {
    //date: moment().add(-1).toDate()
  };
  
  options = extend(true, options, requestOptions);
  
  
  request(url, function (err, response, body) {
    if (err || (response && response.statusCode > 300)) {
      deferred.reject({error: true, errorMsg: response ? response.body : err});
      return;
    }
    var html = body
        .replace(/\r?\n/g, "")
        .replace("document.write(''),document.write('", "")
        .replace('//  id="e1"', '')
        .replace("');", "");
    
    $ = cheerio.load(html, {
      normalizeWhitespace: false,
      xmlMode: false,
      decodeEntities: true
    });
    firstTr = $('tr').eq(1);
    rate = firstTr.children().eq(1).text();
    rate = parseFloat(rate.replace(/\./g, '').replace(/,/g, '.'));
    date = firstTr.children().eq(0).text();
    
    if (options.date && moment.utc(options.date).format(dateFormat) !== date) {
      return deferred.reject({
        error: true,
        rateType: rateType,
        source: source,
        msg: "date " + options.date + " dont match"
      });
    }
    
    date = moment(date, dateFormat);
    
    deferred.resolve({
      date: date.toDate(),
      rate: rate,
      rateType: rateType,
      source: source,
      error: false
    });
  });
  
  return deferred.promise;
}

exports.get = get;
