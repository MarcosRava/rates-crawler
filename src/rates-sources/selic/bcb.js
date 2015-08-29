/*jslint node: true */
"use strict";

var url = 'http://www3.bcb.gov.br/selic/consulta/taxaSelic.do?method=listarTaxaDiaria';
var request = require('request');
var cheerio = require('cheerio');
var Q = require('q');
var extend = require('extend');
var moment = require('moment');
var result, dateFormat, rateType, source, options,
  deferred, html, $, values, date,
  rate, dailyFactor, calculationBasis, statistics;

function get(requestOptions) {
  
  dateFormat = "DD/MM/YYYY";
  rateType = "selic";
  source = "Banco Central Do Brasil";
  //&dataInicial=27/08/2015&dataFinal=27/08/2015 //TODO
  options = {
    date: moment().add(-1).toDate()
  };
  
  options = extend(true, options, requestOptions);
  
  deferred = Q.defer();
  
  request(url, function (err, response, body) {
    if (err || (response && response.statusCode > 300)) {
      deferred.reject({error: true, errorMsg: response ? response.body : err});
      return;
    }
    html = body
      .replace(/\r?\n/g, "");
    
    $ = cheerio.load(html, {
      normalizeWhitespace: false,
      xmlMode: false,
      decodeEntities: true
    });
    
    values = $('.tabelaTaxaSelic tr').eq(2).children('td');
    date = values.eq(0).text();
    
    if (options.date && moment(options.date).format(dateFormat) !== date) {
      return deferred.reject({
        error: true,
        rateType: rateType,
        source: source,
        msg: "date " + options.date + " dont match"
      });
    }
    
    date = moment(date, dateFormat);
    rate = parseFloat(values.eq(1).text().replace(/\./g, '').replace(/,/g, '.'));
    dailyFactor = parseFloat(values.eq(2).text().replace(/\./g, '').replace(/,/g, '.'));
    calculationBasis = parseFloat(values.eq(3).text().replace(/\./g, '').replace(/,/g, '.'));
    statistics = {
      average: parseFloat(values.eq(4).text().replace(/\./g, '').replace(/,/g, '.')),
      median: parseFloat(values.eq(5).text().replace(/\./g, '').replace(/,/g, '.')),
      moda: parseFloat(values.eq(6).text().replace(/\./g, '').replace(/,/g, '.')),
      standardDeviation: parseFloat(values.eq(7).text().replace(/\./g, '').replace(/,/g, '.')),
      kurtosiIndex: parseFloat(values.eq(8).text().replace(/\./g, '').replace(/,/g, '.'))
    };
    
    result = {
      date: date.toDate(),
      rate: rate,
      rateType: rateType,
      dailyFactor: dailyFactor,
      calculationBasis: calculationBasis,
      statistics: statistics,
      source: source,
      error: false
    };
    
    deferred.resolve(result);
  });
  
  return deferred.promise;
}

exports.get = get;
