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
      };
    });
  }
});

$(function(){
  setInterval(function() {
        if(localStorage["token"] && localStorage["url"]) {
          chrome.tabs.get(activatedTabId, function(tab){
            if (tab.url.indexOf(localStorage["url"]) == -1) {
              var url = localStorage["url"] + "/rooms";
              var unreadMessageCount = 0;
              var checkRoomsNum = 0;
              var checkRoomsMax = 0;
              $.ajax({
                        url: "https://dl.dropboxusercontent.com/u/2485045/json/rooms.json", //TODO
                        cache: false,
                        type: 'GET',
                        beforeSend: function (request) {
                          request.setRequestHeader("Authorization", "Bearer " + localStorage["token"]);
                        },
                        success: function(json){
                          var res = $.parseJSON(json);
                          var i;
                          checkRoomsMax = res.length;
                          for (i=0; i<res.length; i++) {
                            var postParameter = localStorage["date"] ? "?from=" + localStorage["date"]: "";
                            var url = localStorage["url"] + "/rooms/" + res[i].id + "/messages" + postParameter;
                            $.ajax({
                                      url: "https://dl.dropboxusercontent.com/u/2485045/json/roomsallmessages_form%3D2015-09-17T14-00.json", //TODO
                                      cache: false,
                                      type: 'GET',
                                      beforeSend: function (request) {
                                        request.setRequestHeader("Authorization", "Bearer " + localStorage["token"]);
                                      },
                                      success: function(json){
                                        var res = $.parseJSON(json);
                                        checkRoomsNum++;
                                        unreadMessageCount += res.length;
                                        if( checkRoomsMax == checkRoomsNum )
                                        {
                                          chrome.browserAction.setBadgeText({text:unreadMessageCount.toString()});
                                        }
                                      },
                                      error: function(e) {
                                      }
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
  var date = new Date();
  localStorage["date"] = date.getFullYear() + "-" + date.getMonth()+1 + "-" + date.getDate()
                       + "T" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "Z";
}
