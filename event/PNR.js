require("share");
var playerDataList = Spark.runtimeCollection("playerData");
var playerID = Spark.getPlayer().getPlayerId();
var data = Spark.getData().data;
if(!data) data = {};

if (data.push_all_user) {
    var included_segments = ["All"];
    var excluded_segments = [];
    var message = data.message ? data.message : "Hey, can you back to play with us?";
    var response = SendNewNotification(included_segments, excluded_segments, message).getResponseJson();
    Spark.setScriptData("response", response);
}

function SendNewNotification(included_segments, excluded_segments, message) {
  var jsonBody = {
    "app_id": "53aa05a0-16d7-4e30-894f-149c80736052",
    "included_segments": included_segments,
    "excluded_segments": excluded_segments,
    "contents": {"en": "There is message push from GS to your application via OneSignal"},
  };
  var promise = Spark.getHttp("https://onesignal.com/api/v1/notifications").setHeaders({
    "Content-Type": "application/json;charset=utf-8",
    "Authorization": "Basic YzU4NzA3N2YtNTZlZS00NjJlLWJkNzMtNzc5NjIwZDE0Zjlj"
  }).postJson(jsonBody);
  return promise;
}