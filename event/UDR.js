require("share");
require("event_service");
require("common");

var playerID = Spark.getPlayer().getPlayerId();
var playerDataList = Spark.runtimeCollection("playerData");
var playerData = playerDataList.findOne({"playerID":playerID});
var itemPackMaster = Spark.metaCollection("pack_item_master");
var logPurchaserData = Spark.runtimeCollection("user_purchaser_log");
var userFeedbackData = Spark.runtimeCollection("user_feedback");
var userNotice = Spark.runtimeCollection("user_notice");
var data = Spark.getData().data;
var timeNow = getTimeNow();
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
		var log = {
			"playerID" : playerID,
			"pack_id"  : pack_id,
			"reg_date" : timeNow
		}
		var pack_info = playerData.pack_info ? playerData.pack_info : [];
		if (pack_info.indexOf(pack_id) == -1) {
			pack_info.push(pack_id);
			playerDataList.update({"playerID":playerID},{"$set":{"pack_info":pack_info}}, true, false);
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
	var listAdminPikachu = [];
	var listAdminPikachu2p = [];
	for (var i = 0; i < listAdmin.length; i++) {
		var admin = listAdmin[i];
		if (admin.store_id == server_config.STORE_ID.pikachu_2p_android) {
			listAdminPikachu2p.push(admin.player_id);
		} else {
			listAdminPikachu.push(admin.player_id);
		}
	}
	var message = content;
	if (!isAdmin()) {
		SendNewNotification(listAdminPikachu, [], [], {"en" : title}, {"en": message}, null).getResponseJson();
		SendNewNotification2p(listAdminPikachu2p, [], [], {"en" : title}, {"en": message}, null).getResponseJson();
	}
	Spark.setScriptData("data",response);
}

//get feedback
if (data.get_user_feedback) {
	var feedback = getUserFeedback();
	playerDataList.update({"playerID":playerID}, {"$set": {"last_read":timeNow}}, true, false);
	Spark.setScriptData("data", feedback);
}

//get all feedback
if (data.get_all_feedback) {
	var limit = data.limit ? data.limit : 100;
	var feedbacks = userFeedbackData.find().limit(limit).sort({"response":1,"time":-1}).toArray();
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
	var is_show_android_store = data.is_show_android_store;
	var is_show_ios_store = data.is_show_ios_store;
	if (feedbackID && responseData) {
		var feedbackPlayerID = userFeedbackData.findOne({"_id":{$oid:feedbackID}}).playerID;
		var feedbackPlayer = playerDataList.findOne({"playerID":feedbackPlayerID});
		var oneSignalPlayerID = feedbackPlayer.one_signal_player_id;
		var saveData = {"response":responseData,"time":timeNow};
		if (oneSignalPlayerID) {
			if (feedbackPlayer.store_id == server_config.STORE_ID.pikachu_2p_android) {
				SendNewNotification2p([oneSignalPlayerID], [], [], {"en" : "Picachu Online Response Feedback"}, {"en" : responseData}, null).getResponseJson();	
			} else {
				SendNewNotification([oneSignalPlayerID], [], [], {"en" : "Picachu Online Response Feedback"}, {"en" : responseData}, null).getResponseJson();
			}
		}
		if(is_show_android_store){
			saveData.button_name = "Rate 5 star";
			saveData.url = "https://play.google.com/store/apps/details?id=com.SunnyMonkey.PikachuOnline";
		}
		if(is_show_ios_store){
			saveData.button_name = "Rate 5 star";
			saveData.url = "https://itunes.apple.com/vn/app/pukachi-online/id1068833233?mt=8";
		}
		userFeedbackData.update({"_id":{$oid:feedbackID}}, {"$set":saveData}, true, false);
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
	var title = data.title ? data.title : {"en": "Pika Notice"};
	var content = data.content ? data.content : {"en" : "No have notice!"};
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
        SendNewNotification([], ["All"], [], title, content, null).getResponseJson();
        SendNewNotification2p([], ["All"], [], title, content, null).getResponseJson();
	} else {
		var noticePlayer = playerDataList.findOne({"playerID":playerID});
		var oneSignalPlayerID = noticePlayer.one_signal_player_id;
		if (oneSignalPlayerID) {
			if (noticePlayer.store_id == server_config.STORE_ID.pikachu_2p_android) {
				SendNewNotification2p([oneSignalPlayerID], [], [], title, content, null).getResponseJson();
			} else {
				SendNewNotification([oneSignalPlayerID], [], [], title, content, null).getResponseJson();	
			}
		}
	}
	Spark.setScriptData("data",response);
}

//get notice without feedback
if (data.get_notice_without_feedback) {
	var notice = getNotice();
	playerDataList.update({"playerID":playerID}, {"$set": {"last_read":timeNow}}, true, false);
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
	playerDataList.update({"playerID":playerID}, {"$set": {"last_read":timeNow}}, true, false);
	Spark.setScriptData("data", allNotice);
}

//==============event request================//

// get trophies
if (data.event_get_leaderboard) {
	var event = getCurrentEvent();
	var response;
	var rankInfo;
	if (event) {
		var groupMember = getGroupMemberSortByTrophies(event.event_id, playerID);
		if (groupMember) {
			var members = groupMember.members;
			var rewards = getEventReward(event.event_id);
			var myRankInfo;
			if (rewards && rewards.length > 0) {
				for (var i = 0; i < members.length; i++) {
					var member = members[i];
					member.rank = (i+1);
					if (i < rewards.length) {
						member.rewards = rewards[i];
					}
					if (member.playerID == playerID) {
						if (member.last_rank && member.last_rank > member.rank) {
							myRankInfo = {
								"last_rank" : {
									"rank" : member.last_rank,
									"trophies" : member.last_trophies
								},
								"current_rank" : {
									"rank" : member.rank,
									"trophies" : member.trophies
								} 
							};	
							if (member.last_rank < rewards.length) {
								myRankInfo.last_rank.rewards = rewards[member.last_rank - 1];
							}
							if (member.rank < rewards.length) {
								myRankInfo.current_rank.rewards = rewards[member.rank - 1];
							}
						}
						member.last_rank = member.rank;
						member.last_trophies = member.trophies;
						updateMemberData(event.event_id, member);
					}
				}
			}

			response = {
				"result" : true,
				"data"   : members,
			}
			if (myRankInfo) {
				response.rank_up_data = myRankInfo;
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
	var event = getCurrentEventStart();
	var trophies = data.trophies;
	var pID = data.player_id ? data.player_id : playerID;
	var response;
	if (event) {
		if (trophies) {
			updateEventTrophies(event.event_id, pID, trophies);
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

// get event rewards
if (data.event_get_reward) {
	var event_rewards = playerData.event_rewards;
	var response;
	if (!event_rewards.is_received) {
		var currentTrophies = playerData.trophies;
		var highTrophies = playerData.highest_trophy ? playerData.highest_trophy : 0;
		if (event_rewards.reward_trophies) {
			currentTrophies = currentTrophies + event_rewards.reward_trophies;
			var result = Spark.sendRequest({
				"@class": ".LogEventRequest",
				"eventKey": "TLB",
				"trophies": currentTrophies,
				"COUNTRY": playerData && playerData.location && playerData.location.country ? playerData.location.country : "VN",
				"CITY": ""
			});
			if (highTrophies < currentTrophies) {
				highTrophies = currentTrophies;
			}
		}
		event_rewards.is_received = 1;
		playerDataList.update({"playerID":playerID},{"$set":{"trophies":currentTrophies, "highest_trophy":highTrophies, "event_rewards":event_rewards}}, false, true);
		event_rewards.trophies = currentTrophies;
		response = {
			"result"  : true,
			"message" : "Get rewards success",
			"event_rewards" : event_rewards
		}
	} else {
		response = {
			"result"  : false,
			"message" : "You received rewards already"
		}
	}
	Spark.setScriptData("data",response);
}

//get time server
if (data.get_server_time) {
	Spark.setScriptData("data", timeNow);
}

//watch ads to get coin
if (data.video_for_coin) {
	var userFreeCoinCollection = Spark.runtimeCollection("user_get_free_coin");
	var userFreeCoin = userFreeCoinCollection.findOne({"$and":[{"playerID":playerID},{"type" : "view_ads"}]});
	var response;
	if (userFreeCoin) {
		if (userFreeCoin.count < server_config.video_for_coin_count) {
			userFreeCoin.count ++;
			userFreeCoin.total ++;
			if (userFreeCoin.count == server_config.video_for_coin_count) {
				userFreeCoin.time = timeNow;
			}
			userFreeCoinCollection.update({"$and":[{"playerID":playerID},{"type" : "view_ads"}]}, {"$set":userFreeCoin}, true, false);
			response = {
				"time_remain" : 0,
				"coin" : server_config.video_for_coin
			}
		} else {
			if (timeNow - userFreeCoin.time > server_config.video_for_coin_time) {
				userFreeCoin.count = 1;
				userFreeCoin.total ++;
				userFreeCoinCollection.update({"$and":[{"playerID":playerID},{"type" : "view_ads"}]}, {"$set":userFreeCoin}, true, false);
				response = {
					"time_remain" : 0,
					"coin" : server_config.video_for_coin
				}
			} else {
				var message = (playerData.location && playerData.location.country == "VN") ?
							message_const.video_for_coin.vi :
							message_const.video_for_coin.en;
				var timeRemain = Math.ceil((server_config.video_for_coin_time + userFreeCoin.time - timeNow) / 1000);
				response = {
					"time_remain" : timeRemain,
					"message_fail" : message
				}
			}
		}
	} else {
		var userFreeCoinData = {
			"playerID" : playerID,
			"type" : "view_ads",
			"count" : 1,
			"total" : 1,
			"time" : timeNow
		}
		userFreeCoinCollection.insert(userFreeCoinData);
		response = {
			"time_remain" : 0,
			"coin" : server_config.video_for_coin
		}
	}
	Spark.setScriptData("data", response);
}

//invite friend to get coin
if (data.invite_for_coin) {
	var totalFriend = data.total_friend ? data.total_friend : 0;
	var count = data.count ? data.count : 0;

	var userFreeCoinCollection = Spark.runtimeCollection("user_get_free_coin");
	var userFreeCoin = userFreeCoinCollection.findOne({"$and":[{"playerID":playerID},{"type" : "invite_friend"}]});
	var response;
	if (userFreeCoin) {
		if (userFreeCoin.count < totalFriend) {
			userFreeCoin.count += count;
			userFreeCoin.total += count;
			if (userFreeCoin.count >= totalFriend) {
				userFreeCoin.time = timeNow;
			}
			userFreeCoinCollection.update({"$and":[{"playerID":playerID},{"type" : "invite_friend"}]}, {"$set":userFreeCoin}, true, false);
			response = {
				"time_remain" : 0,
				"coin" : server_config.invite_for_coin
			}
		} else {
			if (timeNow - userFreeCoin.time > server_config.invite_for_coin_time) {
				userFreeCoin.count = count;
				userFreeCoin.total += count;
				response = {
					"time_remain" : 0,
					"coin" : server_config.invite_for_coin
				}
				userFreeCoinCollection.update({"$and":[{"playerID":playerID},{"type" : "invite_friend"}]}, {"$set":userFreeCoin}, true, false);
			} else {
				var message = (playerData.location && playerData.location.country == "VN") ?
							message_const.invite_for_coin.vi :
							message_const.invite_for_coin.en;
				var timeRemain = Math.ceil((server_config.invite_for_coin_time + userFreeCoin.time - timeNow) / 1000);
				response = {
					"time_remain" : timeRemain,
					"message_fail" : message
				}
			}
		}
	} else {
		var userFreeCoinData = {
			"playerID" : playerID,
			"type" : "invite_friend",
			"count" : count,
			"total" : count,
			"time" : timeNow
		}
		userFreeCoinCollection.insert(userFreeCoinData);
		response = {
			"time_remain" : 0,
			"coin" : server_config.invite_for_coin
		}
	}
	Spark.setScriptData("data", response);
}

// get event data
if (data.get_event_data) {
	var event = getCurrentEvent(true);
	var response = {};
	if (event) {
		var event_data = {
		"trophies" : 0
		}
		if (event.time_prepare <= timeNow && timeNow < event.time_start) {
			event_data.status = 1;
			event_data.time = event.time_start - timeNow;
			event_data.text_time_prefix = isVN() ? message_const.text_time_start.vi : message_const.text_time_start.en;
			event_data.event_name = isVN() ? message_const.event_prepare_status.vi : message_const.event_prepare_status.en;
		} else if (event.time_start <= timeNow && timeNow < event.time_end) {
			event_data.status = 2;
			event_data.time = event.time_end - timeNow;
			event_data.event_name = isVN() ? message_const.event_ongoing_status.vi : message_const.event_ongoing_status.en;
			event_data.text_time_prefix = isVN() ? message_const.text_time_end.vi : message_const.text_time_end.en;
		} else if (event.time_end <= timeNow) {
			event_data.status = 3;
			event_data.time = event.time_close - timeNow;
			event_data.event_name = isVN() ? message_const.event_ended_status.vi : message_const.event_ended_status.en;
			event_data.text_time_prefix = isVN() ? message_const.text_time_end.vi : message_const.text_time_end.en;
		}
		var groupMember = getGroupMemberSortByTrophies(event.event_id, playerID);
		if (!groupMember) {
			joinEvent(event.event_id);
			groupMember = getGroupMemberSortByTrophies(event.event_id, playerID);
		}
		var members = groupMember.members;
		var rewards = event.rewards;
		if (rewards && rewards.length > 0) {
			for (var i = 0; i < members.length; i++) {
				if (members[i].playerID == playerID) {
					event_data.trophies = members[i].trophies;
					if (i < rewards.length) {
						if (event.time_end > timeNow || event_data.trophies > 0) {
							event_data.rewards = rewards[i];
						}
					}
					if (playerData.event_rewards && playerData.event_rewards.event_id == event.event_id) {
						event_data.is_received = playerData.event_rewards.is_received;
					} else {
						event_data.is_received = 0;
					}
					break;
				}
			}
		}
		if (event_data.rewards) {
		 event_data.reward_status = isVN() ? message_const.received_reward_status.vi : message_const.received_reward_status.en;
		} else {
		 event_data.reward_status = isVN() ? message_const.no_reward_status.vi : message_const.no_reward_status.en;
		}
		response.event_data = event_data;

		//get event rewards
		response.event_rewards = playerData.event_rewards;
	}
	Spark.setScriptData("data", response);
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

// event reset tropheis
if (data.event_reset_trophies) {
	var event = getCurrentEvent();
	var response;
	if (event) {
		var groupMembers = eventGroupMember.find({"event_id":event.event_id}).toArray();
		groupMembers.forEach(function(groupMember) {
			var members = groupMember.members;
			members.forEach(function(member) {
				member.trophies = 0;
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

// reset event
if (data.reset_event) {
	var event_id = data.event_id;
	var response;
	if (event_id) {
		eventMaster.update({"event_id":event_id},{"$set":{"is_match_group":0,"is_distribute_reward":0}}, true, false);
		eventGroupMember.remove({"event_id":event_id},0);
		response = {
			"result": true,
			"message" : "Reset event success"
		}
	} else {
		response = {
			"result": false,
			"message" : "Don't have event"
		}
	}
	Spark.setScriptData("data",response);
}

//change time server
if (data.debug_change_time) {
	var time = data.time ? data.time : Date.now();
	var response;
	setTimeNow(time);
	response = {
		"result": true,
		"message" : "Change time success"
	}
	Spark.setScriptData("data", response);
}

if (data.debug_get_time) {
    var response = {
        "timeNow" : Date.now(),
        "timeSys" : getTimeNow()
    }
    Spark.setScriptData("data", response);
}

// debug distribute reward
if (data.debug_distribute_reward) {
	var event_id = data.event_id;
	var event = eventMaster.findOne({"event_id":event_id});
	var response;
	if (event) {
		setTimeNow(event.time_end + 10 * 60 * 1000);
		removeCacheEvent();
		eventMaster.update({"event_id":event_id},{"$set":{"is_distribute_reward":0}}, true, false);
		response = {
			"result": true,
			"message" : "Distribute success"
		}	
	} else {
		response = {
			"result": false,
			"message" : "Event not found"
		}
	}
	Spark.setScriptData("data", response);
}
//debug update trophies
if (data.debug_update_trophies) {
	var event = getCurrentEvent();
	var trophies = data.trophies;
	var pID = data.player_id ? data.player_id : playerID;
	var response;
	if (event) {
		if (trophies) {
			updateEventTrophies(event.event_id, pID, trophies);
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

//debug change time to event
if (data.debug_change_time_event) {
	var event_id = data.event_id;
	var event = eventMaster.findOne({"event_id":event_id});
	var response;
	if (event) {
		var time;
		if (data.time_prepare) {
			time = event.time_prepare;
		} else if (data.time_start) {
			time = event.time_start;
		} else if (data.time_end) {
			time = event.time_end;
		} else {
			time = getTimeNow();
		}
		setTimeNow(time);
		removeCacheEvent();
		response = {
			"result": true,
			"message" : "Change time success"
		}
	} else {
		response = {
			"result": false,
			"message" : "Event not found"
		}
	}
	Spark.setScriptData("data", response);
}

//get onesignal player info
if (data.get_onesignal_player_info) {
    var player_id = data.player_id ? data.player_id : playerID;
    var one_signal_player_id = getOneSignalPlayerID(player_id);
    var response;
    if (one_signal_player_id) {
		var url = "https://onesignal.com/api/v1/players/" + one_signal_player_id + "?app_id=53aa05a0-16d7-4e30-894f-149c80736052";
	    var result = Spark.getHttp(url).setHeaders({
		    "Content-Type": "application/json;charset=utf-8",
		    "Authorization": "Basic YzU4NzA3N2YtNTZlZS00NjJlLWJkNzMtNzc5NjIwZDE0Zjlj"
		}).get();
		response = {
		    "result" : result.getResponseJson()
		}
    } else {
    	response = {
    		"message" : "Not found onesignal id"
    	}
    }
	Spark.setScriptData("data", response);
}

//get current event
if (data.debug_get_current_event) {
    var without_cache = data.without_cache || 0;
	var event = getCurrentEvent(without_cache);
	Spark.setScriptData("data", event);
}

//remove event cache
if (data.debug_remove_event_cache) {
    removeCacheEvent();
    Spark.setScriptData("data", {"message":"Removed cache"});
}

//add event master
if (data.debug_add_event_master) {
	var numberEvent = data.number_event ? data.number_event : 5;
	var events = eventMaster.find().sort({"event_id":-1}).limit(1).toArray();
	var lastEvent = events ? events[0] : undefined;
	var newEvents = [];
	var offsetTime = 7*24*60*60*1000;
	for (var i = 0; i < numberEvent; i++) {
	    var event = {
	        "event_id"            : lastEvent.event_id + (i+1),
	        "time_prepare"        : lastEvent.time_prepare + (i+1) * offsetTime,
	        "time_start"          : lastEvent.time_start + (i+1) * offsetTime,
	        "time_end"            : lastEvent.time_end + (i+1) * offsetTime,
	        "time_close"          : lastEvent.time_close + (i+1) * offsetTime,
	        "rewards"             : lastEvent.rewards,
	        "is_prepare"          : 0,
	        "is_push_start"       : 0,
	        "is_distribute_reward": 0,
	        "background"          : lastEvent.background
	    }
	    newEvents.push(event);
	}
	eventMaster.insert(newEvents);
	var response = {
		"result": true,
		"message": "Add event success",
		"newEvents": newEvents
	}
	Spark.setScriptData("data",response);
}

//=====================FUNCTION=====================//

function getNotice () {
	var notice = userNotice.find({$and:[{$or:[{"playerID":"all"},{"playerID":playerID}]}, {"time":{"$lt":timeNow}}]}).limit(NUM_NOTICE).sort({"time":-1}).toArray();
	var lastTimeRead = playerData.last_read ? playerData.last_read : 0;
	var isVN = playerData.location && playerData.location.country && playerData.location.country == "VN" ? true : false;
	for (var i = 0; i < notice.length; i++) {
		notice[i].is_new = notice[i].time >= lastTimeRead ? 1 : 0;
		notice[i].time = timeNow - notice[i].time;
		notice[i].title = isVN && notice[i].title.vi ? "Notice: " + notice[i].title.vi : "Notice: " + notice[i].title.en;
		notice[i].message = isVN && notice[i].message.vi ? "Notice: " + notice[i].message.vi : "Notice: " + notice[i].message.en;
		notice[i].type = 0;
	}
	return notice;
}

function getUserFeedback () {
	var feedbacks;
	if (isAdmin()) {
		feedbacks = userFeedbackData.find({"time":{"$lt":timeNow}}).limit(NUM_NOTICE_ADMIN).sort({"response":1,"time":-1}).toArray();
	} else {
		feedbacks = userFeedbackData.find({"playerID":playerID}).limit(NUM_NOTICE).sort({"time":-1}).toArray();
	}
	var lastTimeRead = playerData.last_read ? playerData.last_read : 0;
	for (var i = 0; i < feedbacks.length; i++) {
		var feedback = feedbacks[i];
		feedback.is_new = feedback.time >= lastTimeRead ? 1 : 0;
		feedback.time = timeNow - feedback.time;
		feedback.type = 1;
		if (isAdmin()) {
			var userFeedback = playerDataList.findOne({"playerID":feedback.playerID});
			var userSys = playerDataSys.findOne({"_id":{"$oid":feedback.playerID}});
			feedback.feedback = feedback.feedback + "\n"
			+ "UserName : " + userFeedback.userName + ". "
			+ "Trophies : " + userFeedback.trophies + ". "
			+ "Total Win : " + userFeedback.online_win + ". "
			+ "Online match : " + userFeedback.online_match_start + ". "
			+ "Bot match : " + userFeedback.online_bot_start + ". "
			+ "OS : " + userSys.userName;
		}
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
			var admin = {
				"player_id": listAdmin[i].one_signal_player_id,
				"store_id" : listAdmin[i].store_id
			}
			adminsPush.push(admin);
		}
	}
	return adminsPush;
}

function getOneSignalPlayerID(player_id) {
	var player = playerDataList.findOne({"playerID":player_id});
	return player.one_signal_player_id;
}

function joinEvent(event_id) {
	var member = {
	   "playerID": playerID,
	   "userName": playerData.userName ? playerData.userName : playerID,
	   "trophies": 0,
	   "last_rank": 1,
	   "last_trophies": 0
	}
	playerDataList.update({"playerID":playerID},{"$set":{"event_trophies":0}}, true, false);
	var lastGroup = eventGroupMember.find({"event_id":event_id}).sort({"group_id":-1}).limit(1).toArray()[0];
	if (lastGroup && lastGroup.members.length < NUMBER_MEMBER_PER_GROUP) {
	  member.last_rank = lastGroup.members.length;
	  lastGroup.members.push(member);
	  eventGroupMember.update({"event_id":event_id, "group_id":lastGroup.group_id},{"$set":lastGroup}, true, false);
	} else {
	  var newGroupMember = {
	    "event_id" : event_id,
	    "group_id" : lastGroup ? lastGroup.group_id + 1 : 1,
	    "members"  : [ member ]
	  }
	  eventGroupMember.insert(newGroupMember);
	}
}

function isVN() {
  return (playerData.location && playerData.location.country == "VN") ? true : false;
}