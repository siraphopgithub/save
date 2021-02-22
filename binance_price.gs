function CRYPTOFINANCE(market, coin1, coin2, attribute, option, refresh_cell) {

  // Sanitize input
  var market = (market+":"+coin1+'/'+coin2+"") || "";
  var attribute = (attribute+"") || "";
  var option = (option+"") || "";

  // Get user anonymous token (https://developers.google.com/apps-script/reference/base/session#getTemporaryActiveUserKey())
  // Mandatory to authenticate request origin
  var GSUUID = encodeURIComponent(Session.getTemporaryActiveUserKey());
  // Get Data Availability Service and Historical Plan API Keys, if any
//  var userProperties = PropertiesService.getUserProperties();
//  var APIKEYDATAAVAIBILITYSERVICE = userProperties.getProperty("APIKEYDATAAVAIBILITYSERVICE") || "";
//  var APIKEY_HISTPLAN = userProperties.getProperty("APIKEY_HISTPLAN") || "";
  
  // Fetch data
  try {

    var data = {};
    var CACHE_KEY = "CF__"+ market.toLowerCase() + "_" + attribute.toLowerCase() + "_" + option.toLowerCase();
    // First check if we have a cached version
    var cache = CacheService.getUserCache();
    var cached = cache.get(CACHE_KEY);
    if (cached && cached != null && cached.length > 1) {
      data = JSON.parse(cached)
    }
    // Else, fetch it from API and cache it
    else {
      var url = "https://api.cryptofinance.ai/v1/data?histplanapikey=APIKEY_HISTPLAN&gsuuid=" + GSUUID + "&dataproxyapikey=APIKEYDATAAVAIBILITYSERVICE";
//      var url = "https://api.cryptofinance.ai/v1/data?histplanapikey=" + APIKEY_HISTPLAN + "&gsuuid=" + GSUUID + "&dataproxyapikey=" + APIKEYDATAAVAIBILITYSERVICE;
      url += "&m=" + market;
      url += "&a=" + attribute;
      url += "&o=" + option;
      url += "&s=os";
      // Send request
      var response = UrlFetchApp.fetch(url, {muteHttpExceptions: true, validateHttpsCertificates: true})
      data = JSON.parse(response.getContentText());
      // Stop here if there is an error
      if (data["error"] != "") {
        throw new Error(data["error"])
      }
      // If everything went fine, cache the raw data returned
      else if (response && response.getResponseCode() == 200 && data.length > 1 && data.length < 99900) {
        cache.put(CACHE_KEY, response.getContentText(), data["caching_time"] || 60)
      }
    }

    // Return with the proper type
    var out = "-";
    if (data["type"] == "float") {
      out = parseFloat(data["value"]);
    }
    else if (data["type"] == "int") {
      out = parseInt(data["value"]);
    }
    else if (data["type"] == "csv") {
      out = Utilities.parseCsv(data["value"]);
      out = cast_matrix__(out);
    }
    else {
      out = data["value"]
    }
    return out;

  }

  catch (e) {
    var msg = e.message.replace(/https:\/\/api.*$/gi,'')
    throw new Error(msg)
  }
  
}
