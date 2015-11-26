chrome.browserAction.onClicked.addListener(function(){
  var url = localStorage['url'];
  if( url ){
    chrome.tabs.query({}, function(tabs){
      var i;
      var tabId = null;
      for (i=0; i<tabs.length; i++) {
        if (tabs[i].url.indexOf(url) != -1) {
          tabId = tabs[i].id;
          break;
        }
      }
      if( tabId ){
        chrome.tabs.update(tabId, {active:true}, function(tab){
          if(chrome.runtime.lastError) {
            chrome.tabs.create({url:url});
          }
        });
        chrome.browserAction.setBadgeText({text:""});
      }else{
        chrome.tabs.create({url:url});
      }
    });
  }
});

var activatedTabId = null;
chrome.tabs.onActivated.addListener(function(info){
  activatedTabId = info.tabId;
  var url = localStorage['url'];
  if( url ){
    chrome.tabs.get(info.tabId, function(tab){
      if (tab.url.indexOf(url) != -1) {
        SaveDate();
        chrome.browserAction.setBadgeText({text:""});
      }
    });
  }
});

$(function(){
  setInterval(function() {
        if(localStorage["token"] && localStorage["url"] && activatedTabId ) {
          chrome.tabs.get(activatedTabId, function(tab){
            if (tab.url.indexOf(localStorage["url"]) == -1) {
              var url = GenerateUrl( "rooms" );
              var unreadMessageCount = 0;
              var checkRoomsNum = 0;
              var checkRoomsMax = 0;

              function beforeSendFunc(request, settings) {
                request.setRequestHeader("Authorization", "Bearer " + localStorage["token"]);
              }
              $.ajax({
                        url: url,
                        cache: false,
                        type: 'GET',
                        beforeSend: beforeSendFunc,
                        success: function(json){
                          var i;
                          checkRoomsMax = json.length;

                          function successFunc(json){
                            checkRoomsNum++;
                            unreadMessageCount += json.length;
                            if( checkRoomsMax == checkRoomsNum )
                            {
                              if( unreadMessageCount > 0 )
                              {
                                chrome.browserAction.setBadgeText({text:unreadMessageCount.toString()});
                              }
                              else
                              {
                                chrome.browserAction.setBadgeText({text:""});
                              }
                            }
                          }

                          function errorFunc(e){
                          }

                          for (i=0; i<json.length; i++) {
                            var postParameter = localStorage["date"] ? "?from=" + localStorage["date"] : "";
                            var url = GenerateUrl( "rooms/" + json[i].id + "/messages" + postParameter );
                            $.ajax({
                                      url: url,
                                      cache: false,
                                      type: 'GET',
                                      beforeSend: beforeSendFunc,
                                      success: successFunc,
                                      error: errorFunc
                                  });
                          }
                        },
                        error: function(e) {
                        }
                    }); //ajax
            } //if
          }); //chrome.tabs.get
        } //if
  }, 5000); //setInterval
}); //$


function SaveDate()
{
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

function GenerateUrl( subUrl )
{
  var url = localStorage["url"];
  if( url.slice(-1) != '/' )
  {
    url += '/';
  }
  return url + subUrl;
}
