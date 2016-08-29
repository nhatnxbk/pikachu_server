require("share");
require("common");
var playerDataList = Spark.runtimeCollection("playerData");
var playerID = Spark.getPlayer().getPlayerId();
var data = Spark.getData().data;
if(!data) data = {};

if (data.push_notification) {
    var player_id = data.player_id;
    var additionData = data.data;
    var include_player_ids = [];
    if (player_id) {
      var onesignalID = playerDataList.findOne({"playerID":player_id}).one_signal_player_id;
      if (onesignalID) {
        include_player_ids.push(onesignalID);
      }
    }
    var included_segments = include_player_ids.length > 0 ? [] : ["All"];
    var excluded_segments = [];
    var message = data.message ? data.message : "Hey, can you back to play with us?";
    var title = data.title ? data.title : "Picachu Online";
    var response = SendNewNotification(include_player_ids, included_segments, excluded_segments, title, message, additionData).getResponseJson();
    Spark.setScriptData("response", response);
}