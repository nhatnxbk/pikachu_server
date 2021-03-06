//=========Online COntroller============//
require("share");
require("event_service");
var playerDataList = Spark.runtimeCollection("playerData");
var playerID = Spark.getPlayer().getPlayerId();
var data = Spark.getData().data;
if(!data) data = {};

if(data.get_server){
	var response= {};
	var version = data.version;
	var index = 0;
	var found = false;
	var isDebug = data.debug;
	var isEvent = data.is_event;
	if(version && version > CONFIG.app_version_ios){
		PHOTON_SERVER_LIST = PHOTON_SERVER_LIST_NEW_SERVER;
	}
	if(isDebug){
		PHOTON_SERVER_LIST = PHOTON_SERVER_LIST_DEBUG;
	}
	if(isEvent){
	    var event = getCurrentEvent(true);
	    var playerData = playerDataList.findOne({"playerID": playerID});
	    var groupMember = getGroupMemberSortByTrophies(event.event_id, playerID);
		if (!groupMember) {
			joinEvent(event.event_id,NUMBER_MEMBER_PER_GROUP,playerID,playerData);
		}
	}
	while(index < PHOTON_SERVER_LIST.length && !found){
		var server = Spark.runtimeCollection("PhotonServer");
		var numberUser = server.count({"server_id": index});
		var onlineMatchList = Spark.runtimeCollection("OnlineMatch");
		var online_match_data = onlineMatchList.findOne({"playerID":playerID});
		var list_ignore = online_match_data?online_match_data.list_ignore:[];
		var isGameEvent = data.is_event ? data.is_event : false;

		if(numberUser  < 20) {
			response.server = PHOTON_SERVER_LIST[index];
			response.numberUser = numberUser;
			response.server_id = index;

			var timeNow = getTimeNow();
			server.update({"playerID": playerID},{"playerID": playerID,"timeCreate": timeNow,"server_id":index, "is_event":isGameEvent},true,false);
			var theScheduler = Spark.getScheduler();
			theScheduler.inSeconds("remove_online_player", TIME_EXPIRE_MATCH, {"playerID" : playerID});

			if(data.game_type == "friend"){
				var currentPlayerData = playerDataList.findOne({"playerID": playerID});
				if(!currentPlayerData) currentPlayerData = {"trophies":0};
				var friendRoomDB = Spark.runtimeCollection("FriendRoom");
				var timeNow = getTimeNow();
				var updateData = {
					"playerID": playerID,
					"facebook_id":currentPlayerData.facebook_id?currentPlayerData.facebook_id:"",
					"userName":currentPlayerData.userName?currentPlayerData.userName:"",
					"timeCreate": timeNow,
					"server_id":index,
					"server": PHOTON_SERVER_LIST[index],
					"room_id":playerID
				};
				friendRoomDB.update({"playerID": playerID},updateData,true,false);
				var theScheduler = Spark.getScheduler();
				theScheduler.inSeconds("remove_online_player", TIME_EXPIRE_ROOM + 5, {"playerID" : playerID,"remove_room":true});
				response.room_id = playerID;
				response.timeout = TIME_EXPIRE_ROOM;
			}
			if(data.game_type == "random"){
				if (isGameEvent) {
					var concurrentPlayersNotEvent = convertCollectionHashToArray(server.find({"is_event":{"$ne":1}}));
					var event = getCurrentEventStart();
					if (event) {
						var groupMember = getGroupMemberByPlayerID(event.event_id, playerID);
						if (groupMember) {
							var members = groupMember.members;
							concurrentPlayersNotEvent.forEach(function(player) {
								var index = members.indexOf(function(member){
									return member.playerID == player.playerID;
								});
								if (index != -1) {
									if(list_ignore.length == NUMBER_IGNORE_PLAYER){
										list_ignore.pop();
									}
									list_ignore.unshift(player.playerID);
								}
							});
							onlineMatchList.update({"playerID": playerID},{"$set":{"list_ignore":list_ignore}},true,false);
						}
					}
				}
				if(list_ignore){
					response.list_ignore = list_ignore;
					if(DEBUG) response.list_ignore = [];
				}
			}
			found = true;
		}
		index ++;
	}
	if(!found){
		response.error = "Not enough server";
		Spark.getLog().error("Not enough server player id " + playerID + " time " + new Date().toLocaleDateString()+ " " + new Date().toLocaleTimeString());
	}
	if(isEvent){
		// var levelCollection = Spark.metaCollection("Level");
		// var levelEvent = levelCollection.findOne({level:1});
		// response.level = levelEvent;
		var event_data = getCurrentEvent();
		if(event_data && event_data.background){
			// response.background = "http://topanhdep.net/wp-content/uploads/2015/12/anh-girl-xinh-gai-dep-98-7.jpg";
			if(event_data.background.indexOf("http") == -1){
            	event_data.background = getUrlDownloadable(event_data.background);
          	}
			response.background = event_data.background;
		}
	}
	response.time_change_to_bot = 20 + Math.random()*20;
	Spark.setScriptData("data",response);
}

if(data.get_bot_player){
	var isEvent = data.is_event ? data.is_event : false;
	var opponentPlayer = get_bot_player_data(isEvent);
	Spark.setScriptData("botData",opponentPlayer);
}

if(data.online_match_start  && data.game_type == "friend"){
	var response = {"time_expire": TIME_EXPIRE_MATCH};
	Spark.setScriptData("data", response);
}

if(data.online_match_start  && data.game_type != "friend"){
	var isGameEvent = data.is_event ? data.is_event : false;
	var event = getCurrentEventStart();
	var currentPlayerData = playerDataList.findOne({"playerID": playerID});
	var currentPlayer = Spark.getPlayer();
	if(!currentPlayer) currentPlayer = {};
	if(!currentPlayerData) currentPlayerData = {"trophies":0, "event_trophies":0};
	if(!currentPlayerData.trophies) currentPlayerData.trophies = 0;
	if(!currentPlayerData.event_trophies) currentPlayerData.event_trophies = 0;
	var my_total_match_on = (currentPlayer.getPrivateData("total_match_on")?currentPlayer.getPrivateData("total_match_on"):0) + 1;

	var opponentPlayerData = playerDataList.findOne({"playerID": data.opponent_id});
	var opponentPlayer = Spark.loadPlayer(data.opponent_id);
	if(!opponentPlayer) opponentPlayer = {};
	if(!opponentPlayerData) opponentPlayerData = {"trophies":0,"event_trophies":0};
	if(!opponentPlayerData.trophies) opponentPlayerData.trophies = 0;
	if(!opponentPlayerData.event_trophies) opponentPlayerData.event_trophies = 0;
	var op_total_match_on = (opponentPlayer.getPrivateData("total_match_on")?opponentPlayer.getPrivateData("total_match_on"):0) + 1;

	var myTrophies = event && isGameEvent? currentPlayerData.event_trophies : currentPlayerData.trophies;
	var opponentTrophies = event && isGameEvent? opponentPlayerData.event_trophies : opponentPlayerData.trophies;
	
	var timeNow = getTimeNow();
	var response = {
		"playerID": playerID,
		"opponent_id":data.opponent_id,
		"time": timeNow,
		"time_expire": TIME_EXPIRE_MATCH,
		"my_total_match_on": my_total_match_on,
		"opponent_total_match_on": op_total_match_on,
		"my_trophy": myTrophies,
		"opponent_trophy": opponentTrophies,
		"bot_enable": data.bot_enable,
		"is_event": isGameEvent
	};
	Spark.getLog().debug(response);
	var onlineMatchList = Spark.runtimeCollection("OnlineMatch");
	var online_match_data = onlineMatchList.findOne({"playerID":playerID});
	var online_opponent_match_data = onlineMatchList.findOne({"playerID":data.opponent_id});
	if(online_opponent_match_data && online_opponent_match_data.opponent_id == playerID && !online_opponent_match_data.is_finish){
		response.opponent_trophy = online_opponent_match_data.my_trophy;
	}
	
	//Them user vao danh sach moi gap
	if(data.game_type == "random"){
		var list_ignore = online_match_data?online_match_data.list_ignore:[];
		if(list_ignore && online_match_data){
			if(list_ignore.length == NUMBER_IGNORE_PLAYER){
				list_ignore.pop();
			}
			list_ignore.unshift(data.opponent_id);
		}else{
			list_ignore = [];
			list_ignore.push(data.opponent_id);
		}
		response.list_ignore = list_ignore;
	}
	response.is_finish = false;
	//rank of myPlayer on leader board friends
	var myRank = isGameEvent ? 1 : get_current_rank_with_friends();
	response.rank_before = myRank;

	onlineMatchList.update({"playerID": playerID},{"$set":response},true,false);

	var bonus_trophies = get_bonus_trophies_lost(myTrophies,opponentTrophies, isGameEvent);
	currentPlayer.setPrivateData("total_match_on",my_total_match_on);
	myTrophies = myTrophies > bonus_trophies ? myTrophies - bonus_trophies : 0;
	if (event && isGameEvent) {
		currentPlayerData.event_trophies = myTrophies;
		updateEventTrophies(event.event_id, playerID, myTrophies);
	} else {
		currentPlayerData.trophies = myTrophies;
		var result = Spark.sendRequest({
			"@class": ".LogEventRequest",
			"eventKey": "TLB",
			"trophies": myTrophies,
			"COUNTRY": currentPlayerData && currentPlayerData.location && currentPlayerData.location.country ? currentPlayerData.location.country : "VN",
			"CITY": ""
		});
	}
	currentPlayerData.online_match_start = currentPlayerData.online_match_start ? (currentPlayerData.online_match_start+1) : 1;

	if(!data.bot_enable){
		opponentPlayer.setPrivateData("total_match_on",op_total_match_on);
	}else{
		currentPlayerData.online_bot_start = currentPlayerData.online_bot_start ? (currentPlayerData.online_bot_start+1) : 1;
	}

	response.trophies = myTrophies;

	playerDataList.update({"playerID": playerID}, {"$set": currentPlayerData}, true,false);
	Spark.setScriptData("data", response);
}

if(data.online_match_end){
	var event = getCurrentEventStart();
	var isGameEvent = data.is_event ? data.is_event : false;
	var my_score = data.my_score;
	var op_score = data.opponent_score;
	var op_id = data.opponent_id;
	var currentPlayerData = playerDataList.findOne({"playerID": playerID});
	var bonus = 0;
	var server = Spark.runtimeCollection("PhotonServer");
	server.remove({"playerID":playerID});
	server.remove({"playerID":op_id});
	if(data.game_type != "friend"){
		var onlineMatchList = Spark.runtimeCollection("OnlineMatch");
		var online_match_data =onlineMatchList.findOne({"playerID":playerID});
		var coin_bonus = 0;
		if(online_match_data !== null && !online_match_data.is_finish){
			if(my_score >= op_score){
				var isWin = my_score > op_score;
				var currentPlayer = Spark.getPlayer();
				var bonus_trophies = get_bonus_trophies_win(online_match_data.my_trophy,online_match_data.opponent_trophy, isGameEvent);
				bonus = bonus_trophies;
				if(!currentPlayerData.trophies) currentPlayerData.trophies = 0;
				if(isWin){
					currentPlayerData.online_win = currentPlayerData.online_win ? (currentPlayerData.online_win+1) : 1;
					coin_bonus = BONUS_COIN_WIN;
				}else{
					bonus = 0;
				}
				if (event && isGameEvent) {
					currentPlayerData.event_trophies = (online_match_data.my_trophy + bonus);
				} else {
					currentPlayerData.trophies = (online_match_data.my_trophy + bonus);
					if(!currentPlayerData.highest_trophy) currentPlayerData.highest_trophy = currentPlayerData.trophies;
					if(currentPlayerData.trophies > currentPlayerData.highest_trophy){
						currentPlayerData.highest_trophy = currentPlayerData.trophies;
					}
				}

				playerDataList.update({"playerID": playerID}, {"$set": currentPlayerData}, true,false);

				var save_data = {"winner":{"id":playerID,"score":my_score, "coin_bonus": coin_bonus},"loser":{"id":op_id,"score":op_score},"draw":(!isWin)};
				Spark.getLog().debug(save_data);
			}else{
				currentPlayerData.online_lose = currentPlayerData.online_lose ? (currentPlayerData.online_lose+1) : 0;
				bonus = -get_bonus_trophies_lost(online_match_data.my_trophy,online_match_data.opponent_trophy, isGameEvent);
			}
			online_match_data.is_finish = true;
			//rank of myPlayer after match_end
			myRank = isGameEvent ? 1 : get_current_rank_with_friends();
			online_match_data.rank_after = myRank;
			onlineMatchList.update({"playerID": playerID}, {"$set": online_match_data}, true,false);
		}else{
			bonus = 0;
		}

		if (event && isGameEvent) {
			updateEventTrophies(event.event_id, playerID, currentPlayerData.event_trophies);	
		} else {
			var result = Spark.sendRequest({
				"@class": ".LogEventRequest",
				"eventKey": "TLB",
				"trophies": currentPlayerData ? currentPlayerData.trophies : 0,
				"COUNTRY": currentPlayerData && currentPlayerData.location && currentPlayerData.location.country ? currentPlayerData.location.country : "VN",
				"CITY": ""
			});
		}

		Spark.setScriptData("data", {
			"bonus" : bonus,
			"trophies": currentPlayerData.trophies,
			"event_trophies" : currentPlayerData.event_trophies,
			"is_event" : isGameEvent,
			"online_win":currentPlayerData.online_win,
			"online_match_start":currentPlayerData.online_match_start,
			"highest_trophy":currentPlayerData.highest_trophy,
			"rank_before":online_match_data.rank_before,
			"rank_after": online_match_data.rank_after,
			"coin_bonus": coin_bonus});
	}else{
		remove_room();
	}
}

if(data.online_match_cancel){
	var server = Spark.runtimeCollection("PhotonServer");
	server.remove({"playerID":playerID});
	if(data.game_type == "friend"){
		remove_room();
	}
}

if(data.get_friend_room_list){
	var friendRoomDB = Spark.runtimeCollection("FriendRoom");
	var response = convertCollectionHashToArray(friendRoomDB.find({"playerID":{"$ne":playerID},"server_id":{"$ne":null}}));
	var timeNow = getTimeNow();
	var list = [];
	for (var i = 0; i < response.length; i++) {
		response[i].timeout = TIME_EXPIRE_ROOM - parseInt((timeNow - response[i].timeCreate) /1000);
		if(response[i].timeout >= 5) list.push(response[i]);
	};
	Spark.setScriptData("data", list);
}

if(data.join_room){
	var room_id = data.room_id;
	var index = data.server_id;
	var server = Spark.runtimeCollection("FriendRoom");

	if(server.find({"room_id":room_id})){
		var response = true;
		server.remove({"room_id":room_id});
		var timeNow = getTimeNow();
		server.update({"playerID": playerID},{"playerID": playerID,"timeCreate": timeNow,"server_id":index},true,false);
		var theScheduler = Spark.getScheduler();
		theScheduler.inSeconds("remove_online_player", TIME_EXPIRE_MATCH, {"playerID" : playerID});
	}else{
		var response = false;
	}
	Spark.setScriptData("data", response);
}

if (data.get_bonus_trophies) {
	var myTrophies = data.my_trophies;
	var oppoentTrophies = data.opponent_trophies;
	var isGameEvent = data.is_event ? data.is_event : 0;
	var bonus_win  = get_bonus_trophies_win(myTrophies, oppoentTrophies, isGameEvent);
	var bonus_lost = get_bonus_trophies_lost(myTrophies, oppoentTrophies, isGameEvent);
	Spark.setScriptData("data", {"bonus_win":bonus_win, "bonus_lost": bonus_lost});
}

if(data.get_image_link_from_item){
	var id = data.id;
	var url = getUrlDownloadable(id);
	Spark.setScriptData("url", url);
}

if(data.get_number_fb_duplicate){
    var count_found =0;
    var playerDataList = Spark.runtimeCollection("playerData");
    var list = convertCollectionHashToArray(playerDataList.find({app_version:16,facebook_id:{$exists:true}}));
    var list_result = [];
    for (var i = 0; i < list.length; i++) {
        var currentPlayer = list[i];
        var new_data = playerDataList.findOne({app_version:{$lt:16},facebook_id:list[i].facebook_id,trophies:{$gt:list[i].trophies}});
        if(new_data){
        	count_found++;
        	new_data.old_data = currentPlayer;
        	list_result.push(new_data);
        }
    }

    Spark.setScriptData("data", {"found":count_found, "total ": list.length,"preview":list_result});
}

if(data.load_old_data){
	var old_id = data.old_id;
    var playerDataList = Spark.runtimeCollection("playerData");
	var new_data = playerDataList.findOne({playerID:old_id});
	var found = false;
	if(new_data){
		found = true;
		delete new_data._id;
		delete new_data.app_version;
		delete new_data.playerID;
		playerDataList.update({"playerID": playerID}, {"$set": new_data}, true,false);

		var result = Spark.sendRequest({
			"@class": ".LogEventRequest",
			"eventKey": "TLB",
			"trophies": new_data ? new_data.trophies : 0,
			"COUNTRY": new_data && new_data.location && new_data.location.country ? new_data.location.country : "VN",
			"CITY": ""
		});
	}
    Spark.setScriptData("data", {"success":found});
}

if(data.process_number_fb_duplicate){
    var count_found =0;
    var playerDataList = Spark.runtimeCollection("playerData");
    var list = convertCollectionHashToArray(playerDataList.find({app_version:16,facebook_id:{$exists:true}}));

    for (var i = 0; i < list.length; i++) {
        var currentPlayer = list[i];
        var new_data = playerDataList.findOne({app_version:{$lt:16},facebook_id:list[i].facebook_id,trophies:{$gt:list[i].trophies}});
        if(new_data){
            delete new_data._id;
            delete new_data.app_version;
			delete new_data.playerID;
            count_found++;
            playerDataList.update({"playerID": currentPlayer.playerID}, {"$set": new_data}, true,false);
            // break;
        }
    }

    Spark.setScriptData("data", {"updated":count_found, "total ": list.length});
}

function remove_room () {
	var server = Spark.runtimeCollection("FriendRoom");
	server.remove({"playerID":playerID});
}

function get_current_rank_with_friends() {
	var currentPlayer = playerDataList.findOne({"playerID": playerID});
	var friendList = (currentPlayer && currentPlayer.facebook_friend  && currentPlayer.facebook_friend.length > 0) ? currentPlayer.facebook_friend : "";
	var friendListArr = friendList ? JSON.parse(friendList) : [];
	var myFBId = currentPlayer && currentPlayer.facebook_id ? currentPlayer.facebook_id : "";
	var playerList = convertCollectionHashToArray(playerDataList.find({"$or":[{"facebook_id":{"$exists":true,"$ne":"","$in":friendListArr}},{"facebook_id":myFBId}],"trophies":{"$ne":null}}).sort({"trophies":-1}).limit(100));
	var rank = 0;
	for (var i = 0; i < playerList.length; i++) {
		var opponent = playerList[i];
		if (opponent.playerID == playerID) {
			return (rank + 1);
		} else {
			rank++;
		}
	}
	if (rank > 0) {
		return 101;
	} else {
		return 1;
	}
}

function get_bot_player_data(isEvent) {
	var currentPlayerData = playerDataList.findOne({"playerID": playerID});
	var friendList = (currentPlayerData && currentPlayerData.facebook_friend && currentPlayerData.facebook_friend.length > 0) ? currentPlayerData.facebook_friend : "";
	var friendListArr = friendList ? JSON.parse(friendList) : [];
	var onlineMatchList = Spark.runtimeCollection("OnlineMatch");
	var online_match_data = onlineMatchList.findOne({"playerID":playerID});
	var list_ignore = online_match_data && online_match_data.list_ignore ? online_match_data.list_ignore : [];
	var opponentPlayer;
	var opponentPlayerData;
	var offsetTrophies1 = server_config.offset_trophies_1;
	var offsetTrophies2 = server_config.offset_trophies_2;
	var offsetTrophies3 = server_config.offset_trophies_3;
	// Find player has trophies around +/- 300
	var myTrophies = currentPlayerData.trophies ? currentPlayerData.trophies : 0;
	var trophiesMax = myTrophies + offsetTrophies1;
	var trophiesMin = myTrophies > offsetTrophies1 ? myTrophies - offsetTrophies1 : 0;
	if (IGNORE_HAS_RANDOM_TIME) {
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true,"$lte":trophiesMax,"$gte":trophiesMin},"facebook_id":{"$exists":true,"$nin":friendListArr}});
	} else {
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true,"$lte":trophiesMax,"$gte":trophiesMin},"facebook_id":{"$exists":true,"$nin":friendListArr},"has_random_time":true});
	}
	var opponentPlayerDataArr = convertCollectionHashToArray(opponentPlayerData);
	if (!IGNORE_HAS_RANDOM_TIME && opponentPlayerDataArr.length == 0) {
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true,"$lte":trophiesMax,"$gte":trophiesMin},"facebook_id":{"$exists":true,"$nin":friendListArr}});
		opponentPlayerDataArr = convertCollectionHashToArray(opponentPlayerData);
	}
	//Find player has trophies around +/- 500
	if (opponentPlayerDataArr.length == 0) {
		trophiesMax = myTrophies + offsetTrophies2;
		trophiesMin = myTrophies > offsetTrophies2 ? myTrophies - offsetTrophies2 : 0;
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true,"$lte":trophiesMax,"$gte":trophiesMin},"facebook_id":{"$exists":true,"$nin":friendListArr}});
		opponentPlayerDataArr = convertCollectionHashToArray(opponentPlayerData);
	}
	//Find player has trophies around +/- 800
	if (opponentPlayerDataArr.length == 0) {
		trophiesMax = myTrophies + offsetTrophies3;
		trophiesMin = myTrophies > offsetTrophies3 ? myTrophies - offsetTrophies3 : 0;
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true,"$lte":trophiesMax,"$gte":trophiesMin},"facebook_id":{"$exists":true,"$nin":friendListArr}});
		opponentPlayerDataArr = convertCollectionHashToArray(opponentPlayerData);
	}
	//Find player has trophies
	if (opponentPlayerDataArr.length == 0) {
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true},"facebook_id":{"$exists":true,"$nin":friendListArr}});
		opponentPlayerDataArr = convertCollectionHashToArray(opponentPlayerData);
	}
	var count = 0;
	while(count < 10) {
		if (opponentPlayerDataArr.length == 0) {
			break;
		}
		var r = Math.floor(Math.random() * opponentPlayerDataArr.length);
		var opponent = opponentPlayerDataArr[r];
		if (list_ignore.indexOf(opponent.playerID) == -1) {
			if(list_ignore.length == NUMBER_IGNORE_PLAYER){
				list_ignore.pop();
			}
			list_ignore.unshift(opponent.playerID);
			opponentPlayer = opponent;
			onlineMatchList.update({"playerID": playerID}, {"$set": {"list_ignore": list_ignore}}, true,false);
			break;
		}
		count++;
	}
	if (!opponentPlayer) {
		count = 0;
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true}});
		opponentPlayerDataArr = convertCollectionHashToArray(opponentPlayerData);
		while(count < 10) {
			var r = Math.floor(Math.random() * opponentPlayerDataArr.length);
			var opponent = opponentPlayerDataArr[r];
			if (list_ignore.indexOf(opponent.playerID) == -1) {
				if(list_ignore.length == NUMBER_IGNORE_PLAYER){
					list_ignore.pop();
				}
				list_ignore.unshift(opponent.playerID);
				opponentPlayer = opponent;
				onlineMatchList.update({"playerID": playerID}, {"$set": {"list_ignore": list_ignore}}, true,false);
				break;
			}
			count++;
		}
		if (!opponentPlayer) {
			var r = Math.floor(Math.random() * opponentPlayerDataArr.length);
			opponentPlayer = opponentPlayerDataArr[r];
		}
	}
	if (!opponentPlayer.rt_1 || opponentPlayer.rt_1.length == 0) {
		if (opponentPlayer.trophies <= TROPHIES_OF_EASY_BOT) {
			opponentPlayer.rt_1 = rt_1_e;
			opponentPlayer.rt_2 = rt_2_e;
			opponentPlayer.rt_3 = rt_3_e;
			opponentPlayer.rt_4 = rt_4_e;
			opponentPlayer.rt_5 = rt_5_e;
			opponentPlayer.rto_1 = rto_1_e;
			opponentPlayer.rto_2 = rto_2_e;
			opponentPlayer.rto_3 = rto_3_e;
			opponentPlayer.rto_4 = rto_4_e;
			opponentPlayer.rto_5 = rto_5_e;
		} else if (opponentPlayer.trophies > TROPHIES_OF_EASY_BOT && opponentPlayer.trophies <= TROPHIES_OF_NORMAL_BOT) {
			opponentPlayer.rt_1 = rt_1_n;
			opponentPlayer.rt_2 = rt_2_n;
			opponentPlayer.rt_3 = rt_3_n;
			opponentPlayer.rt_4 = rt_4_n;
			opponentPlayer.rt_5 = rt_5_n;
			opponentPlayer.rto_1 = rto_1_n;
			opponentPlayer.rto_2 = rto_2_n;
			opponentPlayer.rto_3 = rto_3_n;
			opponentPlayer.rto_4 = rto_4_n;
			opponentPlayer.rto_5 = rto_5_n;
		} else {
			opponentPlayer.rt_1 = rt_1_h;
			opponentPlayer.rt_2 = rt_2_h;
			opponentPlayer.rt_3 = rt_3_h;
			opponentPlayer.rt_4 = rt_4_h;
			opponentPlayer.rt_5 = rt_5_h;
			opponentPlayer.rto_1 = rto_1_h;
			opponentPlayer.rto_2 = rto_2_h;
			opponentPlayer.rto_3 = rto_3_h;
			opponentPlayer.rto_4 = rto_4_h;
			opponentPlayer.rto_5 = rto_5_h;
		}
	}
	if (isEvent) {
		opponentPlayer.trophies = opponentPlayer.event_trophies ? opponentPlayer.event_trophies : 0;
	}
	return opponentPlayer;
}

function get_bonus_trophies_win(myTrophies, oppoentTrophies, isEvent) {
	var bonus  = BONUS_TROPHIES;
	var offset = Math.abs(myTrophies - oppoentTrophies)
	var bonusByOffset = Math.floor(offset / BONUS_TROPHIES_OFFSET * BONUS_BY_TROPHIES_OFFSET);
	if (bonusByOffset > BONUS_BY_TROPHIES_OFFSET) {
		bonusByOffset = BONUS_BY_TROPHIES_OFFSET;
	}
	if (myTrophies > oppoentTrophies) {
		bonusByOffset = -bonusByOffset;
	}
	// return isEvent ? (bonus + bonusByOffset) * 2 : (bonus + bonusByOffset);
	return bonus;
}

function get_bonus_trophies_lost(myTrophies, oppoentTrophies, isEvent) {
	var bonus  = BONUS_TROPHIES;
	var offset = Math.abs(myTrophies - oppoentTrophies)
	var bonusByOffset = Math.floor(offset / BONUS_TROPHIES_OFFSET * BONUS_BY_TROPHIES_OFFSET);
	if (bonusByOffset > BONUS_BY_TROPHIES_OFFSET) {
		bonusByOffset = BONUS_BY_TROPHIES_OFFSET;
	}
	if (myTrophies > oppoentTrophies) {
		bonusByOffset = -bonusByOffset;
	}
	// return (bonus - bonusByOffset);
	// return isEvent ? Math.floor((bonus - bonusByOffset) / 2) : (bonus - bonusByOffset);
	return bonus;
}