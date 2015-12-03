/*global storage*/
$("#save").click(function() {
  $("#save").prop("disabled", true);

  $("#alert")
    .attr("class", "alert alert-warning")
    .attr("role", "alert")
    .text("通信中です。お待ち下さい。");

  var url = $('#url').val();
  var token = $('#token').val();
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
        $("#alert")
          .attr("class", "alert alert-success")
          .attr("role", "alert")
          .text("認証が成功しました");
        $("#save").prop("disabled", false);
      },
    error: function() {
        storage.register( "", "", "", "", "" );
        $("#alert")
          .attr("class", "alert alert-danger")
          .attr("role", "alert")
          .text("認証が失敗しました。URLかTOKENを見なおしてください。");
        $("#save").prop("disabled", false);
      }
  });
});

$(function(){
  $('#url').val( storage.url() ? storage.url() : "" );
  $('#token').val( storage.token() ? storage.token() : "" );

  if( !storage.isConfigured() ){
    $("#alert")
      .attr("class", "alert alert-info")
      .attr("role", "alert")
      .text("認証されていません。URLとTOKENを設定してください。");
  }
});
