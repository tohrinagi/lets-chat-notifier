var url = document.getElementById('url');
var token = document.getElementById('token');

document.getElementById('save').onclick = function() {
  localStorage['url'] = url.value;
  localStorage['token'] = token.value;
}

document.body.onload = function() {
  url.value = localStorage['url'] ? localStorage['url'] : "";
  token.value = localStorage['token'] ? localStorage['token']: "";
}
