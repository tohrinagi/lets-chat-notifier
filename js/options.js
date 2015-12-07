/*global storage*/
$("#save").click(function() {
  $("#save").prop("disabled", true);

  $("#alert")
    .attr("class", "alert alert-warning")
    .attr("role", "alert")
    .text("認証中です。お待ち下さい。");
  $("#rooms").empty();
  $("#rooms").append( '<tr><td><dv id="empty">情報を取得できませんでした<div></td></tr>' );

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
        createRoomTable();
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

  if( storage.isConfigured() ){
    createRoomTable();
    $("#alert")
      .attr("class", "alert alert-info")
      .attr("role", "alert")
      .text("認証済みです。このままご利用できます。");
  } else {
    $("#alert")
      .attr("class", "alert alert-warning")
      .attr("role", "alert")
      .text("認証されていません。URLとTOKENを設定してください。");
  }
});

function createRoomTable(){
  $("#empty")
    .text("情報を取得中です……");
  $.ajax({
    url: storage.generateApiUrl( "rooms" ),
    cache: false,
    type: 'GET',
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", "Bearer " + storage.token());
    },
    success: function(json){
      var roomContents = "";
      for (var i=0; i<json.length; i++) {
        var selected = storage.roomNotification(json[i].id);
        noneSelected = ( selected == "none") ? ' active">' : '">';
        toSelected = ( selected == "to") ? ' active">' : '">';
        allSelected = ( selected == "all") ? ' active">' : '">';

        roomContents += '<tr>'
          + '<td>'
          + json[i].name
          + '</td>'
          + '<td>'
          + '<div id="'+ json[i].name+ '-mode" class="btn-group" data-toggle="buttons">'
          + '<label class="btn btn-default' + noneSelected
          + '<input type="radio" autocomplete="off" name="' + json[i].id + '" value="none" id="none-' + json[i].id + '">通知しない'
          + '</label>'
          + '<label class="btn btn-default' + toSelected
          + '<input type="radio" autocomplete="off" name="' + json[i].id + '" value="to">TO のみ通知'
          + '</label>'
          + '<label class="btn btn-default' + allSelected
          + '<input type="radio" autocomplete="off" name="' + json[i].id + '" value="all">すべて通知'
          + '</label>'
          + '</div>'
          + '</td>'
          + '</tr>';
      }

      $("#rooms").empty();
      $("#rooms").append( roomContents );
      for (var i=0; i<json.length; i++) {
        $('input[name="' + json[i].id + '"]:radio').change( function(){
          storage.setRoomNotification( $(this).attr("name"), $(this).val() );
          $("#alert")
            .attr("class", "alert alert-success")
            .attr("role", "alert")
            .text($(this).parents("td").siblings().text() + "の通知設定を変更しました。");
        });
      }
    },
    error: function() {
      $("#empty")
        .text("情報を取得できませんでした");
      $("#alert")
        .attr("class", "alert alert-info")
        .attr("role", "alert")
        .text("認証されていません。URLとTOKENを設定してください。");
    }
  });
}
