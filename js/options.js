/*exported storage*/
var url = document.getElementById('url');
var token = document.getElementById('token');

document.getElementById('save').onclick = function() {
  url = url.value;
  token = token.value;
  if( url.slice(-1) != '/' )
  {
    url += '/';
  }

  $.ajax({
    url: url + "account",
    cache: false,
    type: 'GET',
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", "Bearer " + token);
    },
    success: function(json) {
        storage.register( url, token, json.username, json.id, json.avatar );
        alert(json);
      },
    error: function() {
        alert("error occred!");
      }
  });
};

document.body.onload = function() {
  url.value = storage.url() ? storage.url() : "";
  token.value = storage.token() ? storage.token() : "";
};
