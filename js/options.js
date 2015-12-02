/*global storage*/
document.getElementById('save').onclick = function() {
  $("#save").prop("disabled", true);

  var url = document.getElementById('url').value;
  var token = document.getElementById('token').value;
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
        alert("success!");
        $("#save").prop("disabled", false);
      },
    error: function() {
        storage.register( "", "", "", "", "" );
        alert("error!");
        $("#save").prop("disabled", false);
      }
  });
};

document.body.onload = function() {
  document.getElementById('url').value = storage.url() ? storage.url() : "";
  document.getElementById('token').value = storage.token() ? storage.token() : "";
};
