var url = 'http://www.portaldefinancas.com/js-tx/cdidiaria.js';
var request = require('request');
var cheerio = require('cheerio');
var Q = require('q');
var extend = require('extend');
var moment = require('moment');

function get(requestOptions) {
  
  var dateFormat = "DD/MM/YY";
  
  var options = {
    //date: moment().add(-1).toDate()
  };
  
  options = extend(true, options, requestOptions);
  
  var deferred = Q.defer();
  
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
    var $ = cheerio.load(html
                         , {
      normalizeWhitespace: false,
      xmlMode: false,
      decodeEntities: true
    });
    var firstTr = $('tr').eq(1);
    var rate = firstTr.children().eq(1).text();
    rate = parseFloat(rate.replace(",", "."))
    var _date = firstTr.children().eq(0).text()
    
    if (options.date && moment.utc(options.date).format(dateFormat) !== _date) {
      return deferred.reject({
        error: true,
        msg: "date " + options.date + " dont match"
      })
    }
    
    _date = moment(_date, dateFormat);
    
    deferred.resolve({
      date:_date.toDate(), 
      rate: rate,
      source: "Portal de Finanças",
      error: false
    });
  })
  
  return deferred.promise;
}

exports.get = get;
