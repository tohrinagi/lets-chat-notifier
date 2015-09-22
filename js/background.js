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
