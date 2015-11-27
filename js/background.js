chrome.browserAction.onClicked.addListener(function(){
  var url = storage.url();
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
        chrome.tabs.update(tabId, {active:true}, function(){
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
  var url = storage.url();
  if( url ){
    chrome.tabs.get(info.tabId, function(tab){
      if (tab.url.indexOf(url) != -1) {
        storage.setDate();
        chrome.browserAction.setBadgeText({text:""});
      }
    });
  }
});

function beforeSendFunc(request) {
  request.setRequestHeader("Authorization", "Bearer " + storage.token());
}

$(function(){
  setInterval(function() {
        if(storage.token() && storage.url() && activatedTabId ) {
          chrome.tabs.get(activatedTabId, function(tab){
            if (tab.url.indexOf(storage.url()) == -1) {
              var url = storage.generateApiUrl( "rooms" );
              var unreadMessageCount = 0;
              var checkRoomsNum = 0;
              var checkRoomsMax = 0;

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

                          function errorFunc(){
                          }

                          for (i=0; i<json.length; i++) {
                            var postParameter = storage.date() ? "?from=" + storage.date() : "";
                            var url = storage.generateApiUrl( "rooms/" + json[i].id + "/messages" + postParameter );
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
                        error: function() {
                        }
                    }); //ajax
            } //if
          }); //chrome.tabs.get
        } //if
  }, 5000); //setInterval
}); //$
