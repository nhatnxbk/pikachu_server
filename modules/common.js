//======== function common ========//
var playerDataList = Spark.runtimeCollection("playerData");
var playerData = playerDataList.findOne({"playerID":playerID});

function getOneSignalPlayerID(player_id) {
	var player = playerDataList.findOne({"playerID":player_id});
	return player.one_signal_player_id;
}

function SendNewNotification(include_player_ids, included_segments, excluded_segments, title, message) {
  var titleObj = {"en":title};
  var messageObj = {"en":message};
  var jsonBody = {
    "app_id": "53aa05a0-16d7-4e30-894f-149c80736052",
    "include_player_ids": include_player_ids,
    "excluded_segments": excluded_segments,
    "headings" : {"en" : title},
    "contents" : {"en" : message}
  };
  if (included_segments.length > 0) {
  	jsonBody.included_segments = included_segments;
  }
   var promise = Spark.getHttp("https://onesignal.com/api/v1/notifications").setHeaders({
    "Content-Type": "application/json;charset=utf-8",
    "Authorization": "Basic YzU4NzA3N2YtNTZlZS00NjJlLWJkNzMtNzc5NjIwZDE0Zjlj"
  }).postJson(jsonBody);
  return promise;
}