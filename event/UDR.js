require("share");
require("event_service");
var playerDataList = Spark.runtimeCollection("playerData");
var playerID = Spark.getPlayer().getPlayerId();
var playerData = playerDataList.findOne({"playerID":playerID});
var itemPackMaster = Spark.metaCollection("pack_item_master");
var logPurchaserData = Spark.runtimeCollection("user_purchaser_log");
var userFeedbackData = Spark.runtimeCollection("user_feedback");
var userNotice = Spark.runtimeCollection("user_notice");
var data = Spark.getData().data;
if(!data) data = {};

//update one signal player id
if (data.one_signal_player_id) {
	var response;
	if (data.userId) {
		playerDataList.update({"playerID":playerID}, {"$set":{"one_signal_player_id":data.userId}}, true, false);
		response = {
			"result"  : true,
			"message" : "Update one signal player id success"
		}
	} else {
		response = {
			"result"  : false,
			"message" : "Update one signal player id failure"
		}
	}
	Spark.setScriptData("data", response);
}

//add coin
if (data.add_player_coin) {
	var response;
	var playerCoin = playerData.player_coin ? playerData.player_coin : 0;
	var coin = data.number_coin ? data.number_coin : 0;
	playerData.player_coin = playerCoin + coin;
	playerDataList.update({"playerID":playerID},{"$set":{"player_coin":playerData.player_coin}}, true, false);
	response = {
		"result":true,
		"message": "You have got " + data.number + " coin!",
		"player_coin": playerData.player_coin
	}
	Spark.setScriptData("data", response);
}

//get item master
if (data.get_item_in_shop) {
	var querry = data.item_type ? {"item_type":data.item_type} : {};
    var itemPackMasterArr = itemPackMaster.find(querry).toArray();
    var itemShopData = {"item_shop_data":itemPackMasterArr};
    Spark.setScriptData("data", itemShopData);
}

if (data.buy_pack_item) {
	var response;
	if (data.pack_id !== undefined) {
		var packID = data.pack_id;
		var packItem = itemPackMaster.find({"pack_id":packID});
		if (playerData.player_coin > packItem.cost) {
			var playerItems = playerData.player_item ? playerData.player_item : [];
			for (var i = 0; i < playerItems.length; i++) {
				var item = playerItems[i];
				if (item.item_id == packItem.item_id) {
					// item.number = item.number + packItem.number;
					playerData.player_coin = playerData.player_coin - packItem.cost;
					response = {
						"result":true,
						"message": "You have bought success " + packItem.number + getItemName(item.item_id) + "."
					}
				} 
			}
		} else {
			response = {
				"result":false,
				"message": "Do not enough coin to buy this item!"
			};
		}
	} else {
		response = {
			"result":false,
			"message": "Can not found this item!"
		};
	}
	Spark.setScriptData("data",response);
}

if (data.log_purchaser) {
	var pack_id = data.pack_id;
	if (pack_id !== undefined) {
		var reg_date = Date.now();
		var log = {
			"playerID" : playerID,
			"pack_id"  : pack_id,
			"reg_date" : reg_date
		}
		logPurchaserData.insert(log);
		Spark.setScriptData("response",log);
	} else {
		Spark.setScriptData("response",{"message":"Pack is not exists."});
	}
}

//get config
if (data.get_config) {
	var config = CONFIG;
	Spark.setScriptData("data",config);
}

//add feedback
if (data.user_feedback) {
	var title = data.title ? data.title : "User Feedback";
	var content = data.content ? data.content : "No feedback from user!";
	var timeNow = Date.now();
	var feedback = {
		"playerID": playerID,
		"title"   : title,
		"feedback": content,
		"time"    : timeNow
	}
	userFeedbackData.insert(feedback);
	var response = {
		"result"   : true,
		"message"  : "Your feedback was sent!",
		"feedback" : feedback
	}
	var userName = playerData.userName ? playerData.userName : "UserFeedback";
	var listAdmin = getAdmin();
	if (!isAdmin()) {
		var push = SendNewNotification(listAdmin, [], "User Feedback", "You received one feedback from user").getResponseJson();
	}
	Spark.setScriptData("data",response);
}

//get feedback
if (data.get_user_feedback) {
	var feedback = getUserFeedback();
	playerDataList.update({"playerID":playerID}, {"$set": {"last_read":Date.now()}}, true, false);
	Spark.setScriptData("data", feedback);
}

//get all feedback
if (data.get_all_feedback) {
	var limit = data.limit ? data.limit : 100;
	var feedbacks = userFeedbackData.find().limit(limit).sort({"response":1,"time":-1}).toArray();
	var timeNow = Date.now();
	for (var i = 0; i < feedbacks.length; i++) {
		feedbacks[i].time = timeNow - feedbacks[i].time;
		feedbacks[i].type = 1;
		feedbacks[i].is_new = 0;
	}
	Spark.setScriptData("data", feedbacks);
}

//reponse feedback
if (data.response_feedback) {
	var feedbackID   = data.id ? data.id : 0;
	var responseData = data.response ? data.response : undefined;
	var response;
	if (feedbackID && responseData) {
		var feedbackPlayerID = userFeedbackData.findOne({"_id":{$oid:feedbackID}}).playerID;
		var oneSignalPlayerID = getOneSignalPlayerID(feedbackPlayerID);
		if (oneSignalPlayerID) {
			var push = SendNewNotification([oneSignalPlayerID], [], "Picachu Online Response Feedback", "We are responsed your feedback, you can check in inbox of game.").getResponseJson();
		}
		userFeedbackData.update({"_id":{$oid:feedbackID}}, {"$set":{"response":responseData,"time":Date.now()}}, true, false);
		response = {
			"result" : true,
			"message": "Response success!"
		}
	} else {
		response = {
			"result"  : false,
			"message" : "Response failure!"
		}
	}
	Spark.setScriptData("data",response);
}

//add notice
if (data.add_notice) {
	var title = data.title ? data.title : "Pika Notice";
	var content = data.content ? data.content : "No have notice!";
	var timeNow = Date.now();
	var playerID = data.playerID ? data.playerID : "all";
	var notice = {
		"playerID": playerID,
		"title"   : title,
		"message" : content,
		"time"    : timeNow
	}
	userNotice.insert(notice);
	var response = {
		"result"  : true,
		"message" : "Add notice success!",
		"notice"  : notice
	}
	if (playerID == "all") {
	    //khi nao release bo comment
        //SendNewNotification(["All"], [], "Picachu Online Notice", "You have received a message, you can check in inbox of game.").getResponseJson();
	} else {
		var oneSignalPlayerID = getOneSignalPlayerID(playerID);
		if (oneSignalPlayerID) {
			var push = SendNewNotification([oneSignalPlayerID], [], "Picachu Online Notice", "You have received a message, you can check in inbox of game.").getResponseJson();
		}
	}
	Spark.setScriptData("data",response);
}

//get notice without feedback
if (data.get_notice_without_feedback) {
	var notice = getNotice();
	playerDataList.update({"playerID":playerID}, {"$set": {"last_read":Date.now()}}, true, false);
	Spark.setScriptData("data", notice);
}

//get all notice
if (data.get_notice) {
	var feedback = getUserFeedback();
	var notice = getNotice();
	var allNotice = feedback.concat(notice);
	allNotice.sort(function(a,b){
		return a.time - b.time;
	});
	var limit = isAdmin() ? NUM_NOTICE_ADMIN : NUM_NOTICE;
	allNotice = allNotice.slice(0, limit);
	playerDataList.update({"playerID":playerID}, {"$set": {"last_read":Date.now()}}, true, false);
	Spark.setScriptData("data", allNotice);
}

//==============event request================//

// get trophies
if (data.event_get_leaderboard) {
	var event = getCurrentEvent();
	var response;
	if (event) {
		var groupMember = getGroupMemberByPlayerID(event.event_id, playerID);
		if (groupMember) {
			var members = groupMember.members;
			members.sort(function(a, b) {
				return b.trophies - a.trophies;
			});
			response = {
				"result" : true,
				"data"   : members
			}
		} else {
			response = {
				"result": false,
				"message" : "Group members not found."
			}
		}
	} else {
		response = {
			"result": false,
			"message" : "Don't have event was going."
		}
	}
	Spark.setScriptData("data", response);
}

//update trophies
if (data.event_update_trophies) {
	var event = getCurrentEvent();
	var trophies = data.trophies;
	var response;
	if (event) {
		if (trophies) {
			updateTrophies(event.event_id, playerID, trophies);
			response = {
				"result" : true
			}
		} else {
			response = {
				"result": false,
				"message" : "Trophies not found."
			}
		}
	} else {
		response = {
			"result": false,
			"message" : "Don't have event was going."
		}
	}
	Spark.setScriptData("data", response);
}

//test
if (data.test) {

}

//=========================admin tool=========================//

// fake event trophies
if(data.event_fake_trophies) {
	var event = getCurrentEvent();
	var response;
	if (event) {
		var groupMembers = eventGroupMember.find({"event_id":event.event_id}).toArray();
		groupMembers.forEach(function(groupMember) {
			var members = groupMember.members;
			members.forEach(function(member) {
				member.trophies = parseInt(Math.random()*500);
			});
			eventGroupMember.update({"$and":[{"event_id":event.event_id},{"group_id":groupMember.group_id}]},{"$set":groupMember}, true, false);
		});
		response = {
			"result" : true
		}
	} else {
		response = {
			"result": false,
			"message" : "Don't have event was going."
		}
	}
	Spark.setScriptData("data", response);
}

function getNotice () {
	var notice = userNotice.find({$or:[{"playerID":"all"},{"playerID":playerID}]}).limit(NUM_NOTICE).sort({"time":-1}).toArray();
	var timeNow = Date.now();
	var lastTimeRead = playerData.last_read ? playerData.last_read : 0;
	for (var i = 0; i < notice.length; i++) {
		notice[i].is_new = notice[i].time >= lastTimeRead ? 1 : 0;
		notice[i].time = timeNow - notice[i].time;
		notice[i].title = "Notice: " + notice[i].title;
		notice[i].type = 0;
	}
	return notice;
}

function getUserFeedback () {
	var feedbacks;
	if (isAdmin()) {
		feedbacks = userFeedbackData.find().limit(NUM_NOTICE_ADMIN).sort({"response":1,"time":-1}).toArray();
	} else {
		feedbacks = userFeedbackData.find({"playerID":playerID}).limit(NUM_NOTICE).sort({"time":-1}).toArray();
	}
	var timeNow = Date.now();
	var lastTimeRead = playerData.last_read ? playerData.last_read : 0;
	for (var i = 0; i < feedbacks.length; i++) {
		var feedback = feedbacks[i];
		feedback.is_new = feedback.time >= lastTimeRead ? 1 : 0;
		feedback.time = timeNow - feedback.time;
		feedback.type = 1;
	}
	return feedbacks;
}

function getItemName(item_id) {
	switch(item_id) {
		case 0 : return "Item Hint";
		case 1 : return "Item Random";
		case 2 : return "Item Energy";
	}
	return "";
}

function isAdmin() {
  if (LIST_ADMIN.indexOf(playerID) != -1) {
    return 1;
  }
  return 0;
}

function getAdmin() {
	var listAdmin = playerDataList.find({"playerID":{"$in": LIST_ADMIN}}).toArray();
	var adminsPush = [];
	for (var i = 0; i < listAdmin.length; i++) {
		if (listAdmin[i].one_signal_player_id) {
			adminsPush.push(listAdmin[i].one_signal_player_id);
		}
	}
	return adminsPush;
}

function getOneSignalPlayerID(player_id) {
	var player = playerDataList.findOne({"playerID":player_id});
	return player.one_signal_player_id;
}

function SendNewNotification(include_player_ids, excluded_segments, title, message) {
  var titleObj = {"en":title};
  var messageObj = {"en":message};
  var jsonBody = {
    "app_id": "53aa05a0-16d7-4e30-894f-149c80736052",
    "include_player_ids": include_player_ids,
    "excluded_segments": excluded_segments,
    "headings" : {"en" : title},
    "contents" : {"en" : message}
  };
   var promise = Spark.getHttp("https://onesignal.com/api/v1/notifications").setHeaders({
    "Content-Type": "application/json;charset=utf-8",
    "Authorization": "Basic YzU4NzA3N2YtNTZlZS00NjJlLWJkNzMtNzc5NjIwZDE0Zjlj"
  }).postJson(jsonBody);
  return promise;
}

