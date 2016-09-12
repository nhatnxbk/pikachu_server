//======== function common ========//

function SendNewNotification(include_player_ids, included_segments, excluded_segments, title, message, data) {
  var jsonBody = {
    "app_id": "53aa05a0-16d7-4e30-894f-149c80736052",
    "excluded_segments": excluded_segments,
    "headings" : title,
    "contents" : message
  };
  if (include_player_ids.length > 0) {
      jsonBody.include_player_ids = include_player_ids;
  }
  if (included_segments.length > 0) {
      jsonBody.included_segments = included_segments;
  }
  if (data) {
    jsonBody.data = data;
  }
   var promise = Spark.getHttp("https://onesignal.com/api/v1/notifications").setHeaders({
    "Content-Type": "application/json;charset=utf-8",
    "Authorization": "Basic YzU4NzA3N2YtNTZlZS00NjJlLWJkNzMtNzc5NjIwZDE0Zjlj"
  }).postJson(jsonBody);
  return promise;
}