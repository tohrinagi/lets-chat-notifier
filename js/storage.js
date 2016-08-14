/*exported storage*/
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
  userid : function() {
    return localStorage["userid"];
  },
  roomNotification: function(room_id) {
    return localStorage["room"+room_id] || "all";
  },
  setRoomNotification: function(room_id,value) {
    localStorage["room"+room_id] = value;
  },
  notificationMethod: function() {
    return localStorage["notificationMethod"] || "badge";
  },
  setNotificationMethod: function(method) {
    localStorage["notificationMethod"] = method;
  },
  username: function() {
    return localStorage["username"];
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
  register : function(url, token, username, userid, avatar) {
    localStorage["url"] = url;
    localStorage["token"] = token;
    localStorage["username"] = username;
    localStorage["userid"] = userid;
    localStorage["avatar"] = avatar;
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
