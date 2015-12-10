/*jslint node: true */
"use strict";

var url = 'http://www3.bcb.gov.br/selic/consulta/taxaSelic.do?method=listarTaxaDiaria&tipoApresentacao=arquivo';
var request = require('request');
var cheerio = require('cheerio');
var Q = require('q');
var extend = require('extend');
var moment = require('moment');
var result, dateFormat, rateType, source, options,
  deferred, html, $, date, split, content,
  rate, dailyFactor, calculationBasis, statistics, indexes;

indexes = {
  DATE: 0,
  RATE: 1,
  DAILY_FACTOR: 2,
  CALCULATION_BASIS: 3,
  AVERAGE: 4,
  MEDIAN: 5,
  MODA: 6,
  STANDART_DEVIATION: 7,
  KURTOSI_INDEX: 8
};

function get(requestOptions) {

  dateFormat = "DD/MM/YYYY";
  rateType = "selic";
  source = "Banco Central Do Brasil";
  //&dataInicial=27/08/2015&dataFinal=27/08/2015 //TODO
  options = {
    date: moment().add(1).toDate()
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
    split = html.split(';');
    content = split.slice(split.length - 10, split.length - 1);

    date = content[indexes.DATE];
    date = moment(date, dateFormat);
    rate = parseFloat(content[indexes.RATE].replace(/\./g, '').replace(/,/g, '.'));
    dailyFactor = parseFloat(content[indexes.DAILY_FACTOR].replace(/\./g, '').replace(/,/g, '.'));
    calculationBasis = parseFloat(content[indexes.CALCULATION_BASIS].replace(/\./g, '').replace(/,/g, '.'));
    statistics = {
      average: parseFloat(content[indexes.AVERAGE].replace(/\./g, '').replace(/,/g, '.')),
      median: parseFloat(content[indexes.MEDIAN].replace(/\./g, '').replace(/,/g, '.')),
      moda: parseFloat(content[indexes.MODA].replace(/\./g, '').replace(/,/g, '.')),
      standardDeviation: parseFloat(content[indexes.STANDART_DEVIATION].replace(/\./g, '').replace(/,/g, '.')),
      kurtosiIndex: parseFloat(content[indexes.KURTOSI_INDEX].replace(/\./g, '').replace(/,/g, '.'))
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
