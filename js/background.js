function openLetsChatTab(room_id) {
  var url = window.storage.url();
  chrome.tabs.query({}, function(tabs){
    var i;
    var tabId = null;
    var taburl = url;
    for (i=0; i<tabs.length; i++) {
      if (tabs[i].url.indexOf(url) != -1) {
        tabId = tabs[i].id;
        taburl = tabs[i].url;
        break;
      }
    }
    if( tabId ){

      var opt =
      {
        active: true
      };

      if( room_id != "" )
      {
        if( url.slice(-1) != '/' )
        {
          url += '/';
        }
        url += "#!/room/" + room_id;
        if( taburl != url ) {
          opt.url = url;
        }
      }

      chrome.tabs.update(tabId, opt, function(){
        if(chrome.runtime.lastError) {
          chrome.tabs.create({url:url});
        }
      });
    }else{
      chrome.tabs.create({url:url});
    }
  });
}

chrome.browserAction.onClicked.addListener(function(){
  if( window.storage.isConfigured() ){
    openLetsChatTab("");
  } else {
    chrome.tabs.create({url:"chrome-extension://okmlegpkoblokjjiddakimljkiblmnhc/html/options.html"});
  }
});

chrome.notifications.onClicked.addListener(function(id){

  var room = "";
  for( var i = 0; i < dispayedNotifications.length; i++ ) {
    if( dispayedNotifications[i].id == id ) {
      room = dispayedNotifications[i].room;
    }
  }
  openLetsChatTab(room);
});

var activatedTabId = null;
chrome.tabs.onActivated.addListener(function(info){
  activatedTabId = info.tabId;
  var url = window.storage.url();
  if( url ){
    chrome.tabs.get(info.tabId, function(tab){
      if (tab.url.indexOf(url) != -1) {
        window.storage.setDate();
        chrome.browserAction.setBadgeText({text:""});
        dispayedNotifications = [];
      }
    });
  }
});

function beforeSendFunc(request) {
  request.setRequestHeader("Authorization", "Bearer " + window.storage.token());
}

var dispayedNotifications = [];
function showDesktopNotification(data) {
  if( window.storage.notificationMethod() == "desktop" )
  {
    var isDisplayed = false;
    for( var i = 0; i < dispayedNotifications.length; i++ ) {
      if( dispayedNotifications[i].id == data.id ) {
        isDisplayed = true;
      }
    }

    if( isDisplayed == false ) {
      window.cache.rooms(data.room, function(roomVal){
        window.cache.users(data.owner, function(userVal){
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

          chrome.notifications.create(data.id, {title: "[" + roomName + "] " + userName, message:data.text, type:'basic', iconUrl:chrome.runtime.getURL('icons/icon.png') }, function(id){});
          dispayedNotifications.push( { id : data.id, room : data.room } );
        });
      });
    }
  }
}

$(function(){
  setInterval(function() {
    if( window.storage.isConfigured() ) {
      chrome.browserAction.setIcon({path:"icons/icon.png"});
    } else {
      chrome.browserAction.setIcon({path:"icons/unauth.png"});
    }


    if(window.storage.isConfigured() && activatedTabId ) {
      chrome.tabs.get(activatedTabId, function(tab){
        if (tab.url.indexOf(window.storage.url()) === -1) {
          var url = window.storage.generateApiUrl( "rooms" );
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
                  if( json[i].owner === window.storage.userid() ) {
                    continue;
                  }
                  if( window.storage.roomNotification( json[i].room ) === "to" ) {
                    if( json[i].text.indexOf(window.storage.username()) === -1 && json[i].text.indexOf('@all') === -1 )
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
                var postParameter = window.storage.date() ? "?from=" + window.storage.date() : "";
                var url = window.storage.generateApiUrl( "rooms/" + json[i].id + "/messages" + postParameter );
                if( window.storage.roomNotification( json[i].id ) === "none" ) {
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
          window.storage.setDate();
          chrome.browserAction.setBadgeText({text:""});
          dispayedNotifications = [];
        }
      }); //chrome.tabs.get
    } //if
  }, 5000); //setInterval
}); //$
