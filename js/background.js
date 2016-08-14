/*global storage*/
/*global cache*/
chrome.browserAction.onClicked.addListener(function(){
  if( storage.isConfigured() ){
    var url = storage.url();
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
      }else{
        chrome.tabs.create({url:url});
      }
    });
  } else {
    chrome.tabs.create({url:"chrome-extension://okmlegpkoblokjjiddakimljkiblmnhc/html/options.html"});
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
        dispayedNotifications = [];
      }
    });
  }
});

function beforeSendFunc(request) {
  request.setRequestHeader("Authorization", "Bearer " + storage.token());
}

var dispayedNotifications = [];
function showDesktopNotification(data) {
  if( storage.notificationMethod == "desktop" )
  {
    if( dispayedNotifications.indexOf(data.id) === -1 ) {
      cache.getRooms(data.room, function(roomVal){
        chache.getUsrs(data.owner, function(userVal){
          var roomName = "";
          var userName = "";
          if( roomVal != null )
          {
            roomName = roomVal.name;
          }
          if( userVal != null )
          {
            userName = userVal.username;
          }

          chrome.notifications.create(data.id, {title: username + "[" + roomName + "]", message:data.text, type:'basic', iconUrl:'http://rakugakiicon.com/ri/wp-content/uploads/2015/04/fc2b099ab8e978ffd1fbcef6650ea286.png'}, function(id){});
          dispayedNotifications.push( data.id );
        });
      });
    }
  }
}

$(function(){
  setInterval(function() {
    if( storage.isConfigured() ) {
      chrome.browserAction.setIcon({path:"icons/icon.png"});
    } else {
      chrome.browserAction.setIcon({path:"icons/unauth.png"});
    }


    if(storage.isConfigured() && activatedTabId ) {
      chrome.tabs.get(activatedTabId, function(tab){
        if (tab.url.indexOf(storage.url()) === -1) {
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
                for( var i = 0; i < json.length; i++ ) {
                  if( json[i].owner === storage.userid() ) {
                    continue;
                  }
                  if( storage.roomNotification( json[i].room ) === "to" ) {
                    if( json[i].text.indexOf(storage.username()) === -1 && json[i].text.indexOf('@all') === -1 )
                    {
                      continue;
                    }
                  }
                  showDesktopNotification(json[i]);
                  unreadMessageCount++;
                }
                if( checkRoomsMax === checkRoomsNum )
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
                if( storage.roomNotification( json[i].id ) === "none" ) {
                  checkRoomsMax--;
                  continue;
                }
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
        } else { // if url
          storage.setDate();
          chrome.browserAction.setBadgeText({text:""});
          dispayedNotifications = [];
        }
      }); //chrome.tabs.get
    } //if
  }, 5000); //setInterval
}); //$
