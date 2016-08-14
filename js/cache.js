/*exported cache*/
/*global storage*/
var cache = (function() {
    var self = {};
    var _rooms = null;
    var _users = null;

    function startRoomsApi(onFinished,onError) {
      $.ajax({
        url: storage.generateApiUrl( "rooms" ),
        cache: false,
        type: 'GET',
        beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Bearer " + storage.token());
        },
        success: function(json){
          _rooms = json;
        },
        error: function() {
          onError();
        }
      });
    };

    function startUsersApi(onFinished,onError) {
      $.ajax({
        url: storage.generateApiUrl( "users" ),
        cache: false,
        type: 'GET',
        beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Bearer " + storage.token());
        },
        success: function(json){
          _users = json;
          onFinished();
        },
        error: function() {
          onError();
        }
      });
    };

    function getRooms(id,callback) {
      if( _rooms != null )
      {
        _rooms.forEach(function(val){
          if( val.id == id )
          {
            callback( val );
            return true;
          }
        });
      }
      return false;
    }
    function getUsers(id,callback) {
      if( _users != null )
      {
        _users.forEach(function(val){
          if( val.id == id )
          {
            callback( val );
            return true;
          }
        });
      }
      return false;
    }

    self.rooms = function(id,callback) {
      if( !getRooms(id, callback) )
      {
        startRoomsApi( function(){
          if( !getRooms(id, callback) )
          {
            callback(null);
          }
        },
        function(){
          callback(null)
        });
      }
    }

    self.users = function(id,callback) {
      if( !getUsers(id, callback) )
      {
        startUsersApi( function(){
          if( !getUsers(id, callback) )
          {
            callback(null)
          }
        },
        function(){
          callback(null)
        });
      }
    }

    return self;
})();

