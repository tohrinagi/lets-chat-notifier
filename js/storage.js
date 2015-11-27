var storage = {
  url : function() {
    return localStorage['url'];
  },
  token : function() {
    return localStorage["token"];
  },
  date : function() {
    return localStorage["date"];
  },
  generateApiUrl : function( action ){
    var url = localStorage["url"];
    if( url.slice(-1) != '/' )
    {
      url += '/';
    }
    return url + action;
  },
  isConfigured : function() {
    if( localStorage["username"] )
    {
      return true;
    }
    return false;
  },
  setDate : function() {
    var toDoubleDigits = function(num) {
      num += "";
      if (num.length === 1) {
        num = "0" + num;
      }
      return num;
    };

    var date = new Date();
    var yyyy = date.getUTCFullYear();
    var mm = toDoubleDigits( date.getUTCMonth() + 1 );
    var dd = toDoubleDigits( date.getUTCDate() );
    var hh = toDoubleDigits( date.getUTCHours() );
    var mi = toDoubleDigits( date.getUTCMinutes() );
    var se = toDoubleDigits( date.getUTCSeconds() );
    var ms = date.getMilliseconds();
    localStorage["date"] = yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + mi + ":" + se + "." + ms + "Z";
  }
};
