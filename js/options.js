/*global storage*/
$("#save").click(function() {
  $("#save").prop("disabled", true);

  $("#alert")
    .attr("class", "alert alert-warning")
    .attr("role", "alert")
    .text(chrome.i18n.getMessage("authenticating"));
  $("#rooms").empty();
  $("#rooms").append( '<tr><td><dv id="empty">' + chrome.i18n.getMessage("uncommunicated") + '<div></td></tr>' );

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
          .text(chrome.i18n.getMessage("successfullAuthentication"));
        $("#save").prop("disabled", false);
        createRoomTable();
      },
    error: function() {
        storage.register( "", "", "", "", "" );
        $("#alert")
          .attr("class", "alert alert-danger")
          .attr("role", "alert")
          .text(chrome.i18n.getMessage("failureAuthentication"));
        $("#save").prop("disabled", false);
      }
  });
});

$(function(){
  $('#url').val( storage.url() ? storage.url() : "" );
  $('#token').val( storage.token() ? storage.token() : "" );

  //i18n
  $("title").text( chrome.i18n.getMessage("optionTitle") );
  $("#msg_option").text( chrome.i18n.getMessage("optionTitle") );
  $("#msg_authenticationSetting").text( chrome.i18n.getMessage("authenticationSetting") );
  $("#msg_url").text( chrome.i18n.getMessage("url") );
  $("#url").attr("placeholder",chrome.i18n.getMessage("urlExample"));
  $("#msg_token").text( chrome.i18n.getMessage("token") );
  $("#token").attr("placeholder",chrome.i18n.getMessage("tokenExample"));
  $("#save").text( chrome.i18n.getMessage("save") );
  $("#msg_roomSetting").text( chrome.i18n.getMessage("roomSetting") );
  $("#empty").text( chrome.i18n.getMessage("uncommunicated") );

  if( storage.isConfigured() ){
    createRoomTable();
    $("#alert")
      .attr("class", "alert alert-info")
      .attr("role", "alert")
      .text(chrome.i18n.getMessage("authenticated"));
  } else {
    $("#alert")
      .attr("class", "alert alert-warning")
      .attr("role", "alert")
      .text(chrome.i18n.getMessage("unauthenticated"));
  }
});

function createRoomTable(){
  $("#empty")
    .text(chrome.i18n.getMessage("communicating"));
  $.ajax({
    url: storage.generateApiUrl( "rooms" ),
    cache: false,
    type: 'GET',
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", "Bearer " + storage.token());
    },
    success: function(json){
      var roomContents = "";
      json.forEach(function(val){
        var selected = storage.roomNotification(val.id);
        var noneSelected = ( selected == "none") ? ' active">' : '">';
        var toSelected = ( selected == "to") ? ' active">' : '">';
        var allSelected = ( selected == "all") ? ' active">' : '">';

        roomContents += '<tr>' +
          '<td>' +
          val.name +
          '</td>' +
          '<td>' +
          '<div id="' + val.name + '-mode" class="btn-group" data-toggle="buttons">' +
          '<label class="btn btn-default' + noneSelected +
          '<input type="radio" autocomplete="off" name="' + val.id + '" value="none" id="none-' + val.id + '">' + chrome.i18n.getMessage("notifyNone") +
          '</label>' +
          '<label class="btn btn-default' + toSelected +
          '<input type="radio" autocomplete="off" name="' + val.id + '" value="to">' + chrome.i18n.getMessage("notifyOnlyTo") +
          '</label>' +
          '<label class="btn btn-default' + allSelected +
          '<input type="radio" autocomplete="off" name="' + val.id + '" value="all">' + chrome.i18n.getMessage("notifyAll") +
          '</label>' +
          '</div>' +
          '</td>' +
          '</tr>';
      });

      $("#rooms").empty();
      $("#rooms").append( roomContents );

      var radioChanged = function(){
        storage.setRoomNotification( $(this).attr("name"), $(this).val() );
        $("#alert")
          .attr("class", "alert alert-success")
          .attr("role", "alert")
          .text(chrome.i18n.getMessage("modifySetting", [$(this).parents("td").siblings().text()] ));
      };
      json.forEach(function(val){
        $('input[name="' + val.id + '"]:radio').change(radioChanged);
      });
    },
    error: function() {
      $("#empty")
        .text(chrome.i18n.getMessage("uncommunicated"));
      $("#alert")
        .attr("class", "alert alert-info")
        .attr("role", "alert")
        .text(chrome.i18n.getMessage("unauthenticated"));
    }
  });
}
