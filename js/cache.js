window.cache = (function() {
    var self = {};
    var _rooms = null;
    var _users = null;

    function startRoomsApi(onFinished,onError) {
      $.ajax({
        url: window.storage.generateApiUrl( "rooms" ),
        cache: false,
        type: 'GET',
        beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Bearer " + window.storage.token());
        },
        success: function(json){
          _rooms = json;
          onFinished();
        },
        error: function() {
          onError();
        }
      });
    }

    function startUsersApi(onFinished,onError) {
      $.ajax({
        url: window.storage.generateApiUrl( "users" ),
        cache: false,
        type: 'GET',
        beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Bearer " + window.storage.token());
        },
        success: function(json){
          _users = json;
          onFinished();
        },
        error: function() {
          onError();
        }
      });
    }

    function getRooms(id,callback) {
      if( _rooms != null )
      {
        var i;
        for (i=0; i<_rooms.length; i++) {
          if (_rooms[i].id == id) {
            callback( _rooms[i] );
            return true;
          }
        }
      }
      return false;
    }
    function getUsers(id,callback) {
      if( _users != null )
      {
        var i;
        for (i=0; i<_users.length; i++) {
          if (_users[i].id == id) {
            callback( _users[i] );
            return true;
          }
        }
      }
      return false;
    }

    self.rooms = function(id,callback) {
      if( getRooms(id, callback) === false )
      {
        startRoomsApi( function(){
          if( getRooms(id, callback) === false )
          {
            callback(null);
          }
        },
        function(){
          callback(null);
        });
      }
    };

    self.users = function(id,callback) {
      if( getUsers(id, callback) === false )
      {
        startUsersApi( function(){
          if( getUsers(id, callback) === false )
          {
            callback(null);
          }
        },
        function(){
          callback(null);
        });
      }
    };

    return self;
})();

