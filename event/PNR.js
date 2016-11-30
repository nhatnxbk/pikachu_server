require("share");
require("common");
var playerDataList = Spark.runtimeCollection("playerData");
var playerID = Spark.getPlayer().getPlayerId();
var data = Spark.getData().data;
if(!data) data = {};

if (data.push_notification) {
    var player_id = data.player_id;
    var additionData = data.data;
    var response = {};
    if (player_id) {
        var playerPush = playerDataList.findOne({"playerID":player_id});
        var onesignalID = playerPush.one_signal_player_id;
        if (onesignalID) {
            var message = data.message ? data.message : {"en" : "Hey, can you back to play with us?"};
            var title = data.title ? data.title : {"en" : "Picachu Online"};
            if (playerPush.store_id == server_config.STORE_ID.pikachu_2p_android) {
                response = SendNewNotification2p([onesignalID], [], [], title, message, additionData).getResponseJson();
            } else {
                response = SendNewNotification([onesignalID], [], [], title, message, additionData).getResponseJson();    
            }
        }
    }
    Spark.setScriptData("response", response);
}