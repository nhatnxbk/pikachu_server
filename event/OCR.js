
//=========Online COntroller============//
require("share");
var playerDataList = Spark.runtimeCollection("playerData"); 
var playerID = Spark.getPlayer().getPlayerId();
var data = Spark.getData().data;
if(!data) data = {};

if(data.get_server){
	var response= {};
	
	var index = 0;
	var found = false;
	while(index < PHOTON_SERVER_LIST.length && !found){
		var server = Spark.runtimeCollection("PhotonServer");
		var numberUser = server.count({"server_id": index});
		if(numberUser  < 20) {
			response.server = PHOTON_SERVER_LIST[index];
			response.numberUser = numberUser;
			response.server_id = index;

			var timeNow = Date.now();
			server.update({"playerID": playerID},{"playerID": playerID,"timeCreate": timeNow,"server_id":index},true,false);
			var theScheduler = Spark.getScheduler();
			theScheduler.inSeconds("remove_online_player", TIME_EXPIRE_MATCH, {"playerID" : playerID});

			if(data.game_type == "friend"){
				var currentPlayerData = playerDataList.findOne({"playerID": playerID});
				if(!currentPlayerData) currentPlayerData = {"trophies":0};
				var friendRoomDB = Spark.runtimeCollection("FriendRoom");
				var timeNow = Date.now();
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

			found = true;
		}else{
			response.error = "Not enough server";
		}
		index ++;
	}
	Spark.setScriptData("data",response);
}

if(data.get_bot_player){
	var opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"facebook_id":{"$ne":""},"has_random_time":true});
	var opponentPlayerDataArr = opponentPlayerData.toArray();
	if (opponentPlayerDataArr.length == 0) {
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"has_random_time":0});
		opponentPlayerDataArr = opponentPlayerData.toArray();
	}
	if (opponentPlayerDataArr.length == 0) {
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID}});
		opponentPlayerDataArr = opponentPlayerData.toArray();
	}
	var r = Math.floor(Math.random() * opponentPlayerDataArr.length);
	Spark.setScriptData("botData",opponentPlayerDataArr[r]);
}

if(data.online_match_start  && data.game_type != "friend"){
	var currentPlayerData = playerDataList.findOne({"playerID": playerID});
	var currentPlayer = Spark.getPlayer();
	if(!currentPlayer) currentPlayer = {};
	if(!currentPlayerData) currentPlayerData = {"trophies":0};
	if(!currentPlayerData.trophies) currentPlayerData.trophies = 0;
	var my_total_match_on = (currentPlayer.getPrivateData("total_match_on")?currentPlayer.getPrivateData("total_match_on"):0) + 1;

	var opponentPlayerData = playerDataList.findOne({"playerID": data.opponent_id});
	var opponentPlayer = Spark.loadPlayer(data.opponent_id);
	if(!opponentPlayer) opponentPlayer = {};
	if(!opponentPlayerData) opponentPlayerData = {"trophies":0};
	if(!opponentPlayerData.trophies) opponentPlayerData.trophies = 0;	
	if(opponentPlayer.getPrivateData)
		var op_total_match_on = (opponentPlayer.getPrivateData("total_match_on")?opponentPlayer.getPrivateData("total_match_on"):0) + 1;
	
	var timeNow = Date.now();
	var response = {
		"player_id_1": playerID,"player_id_2":data.opponent_id,
		"time": timeNow,
		"player1_total_match_on": my_total_match_on,
		"player2_total_match_on": op_total_match_on,
		"player_1_trophy": currentPlayerData.trophies,"player_2_trophy": opponentPlayerData.trophies,
		"bot_enable": data.bot_enable
	};
	var onlineMatchList = Spark.runtimeCollection("OnlineMatch");
	onlineMatchList.insert(response);
	
	currentPlayer.setPrivateData("total_match_on",my_total_match_on);
	currentPlayerData.trophies = currentPlayerData.trophies > BONUS_TROPHIES ? (currentPlayerData.trophies - BONUS_TROPHIES) : 0;
	playerDataList.update({"playerID": playerID}, {"$set": currentPlayerData}, true,false);
	
	if(!data.bot_enable){
		opponentPlayer.setPrivateData("total_match_on",op_total_match_on);
		opponentPlayerData.trophies = opponentPlayerData.trophies > BONUS_TROPHIES ? (opponentPlayerData.trophies - BONUS_TROPHIES) : 0;
		playerDataList.update({"playerID": data.opponent_id}, {"$set": opponentPlayerData}, true,false);
	}
	Spark.setScriptData("data", response);
}

if(data.online_match_end ){
	var my_score = data.my_score;
	var op_score = data.opponent_score;
	var op_id = data.opponent_id;
	var currentPlayerData = playerDataList.findOne({"playerID": playerID});
	var bonus = -BONUS_TROPHIES;
	var server = Spark.runtimeCollection("PhotonServer");
	server.remove({"playerID":playerID});
	server.remove({"playerID":op_id});
	if(data.game_type != "friend"){
		if(my_score > op_score){
			var currentPlayer = Spark.getPlayer();
			bonus = BONUS_TROPHIES;
			if(!currentPlayerData.trophies) currentPlayerData.trophies = 0;
			currentPlayerData.trophies += bonus*2;
			playerDataList.update({"playerID": playerID}, {"$set": currentPlayerData}, true,false);
			var onlineMatchList = Spark.runtimeCollection("OnlineMatch");
			var save_data = {"winner":{"id":playerID,"score":my_score},"loser":{"id":op_id,"score":op_score}};
			onlineMatchList.update({$or:[{"player_id_1": playerID,"player1_total_match_on":currentPlayer.getPrivateData("total_match_on")},{"player_id_2": playerID,"player2_total_match_on":currentPlayer.getPrivateData("total_match_on")}]}, 
				{"$set": save_data}, true,false);
		}
		Spark.setScriptData("data", {"bonus" : bonus,"trophies": currentPlayerData.trophies});
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
	var response = friendRoomDB.find({}).toArray();
	var timeNow = Date.now();
	for (var i = 0; i < response.length; i++) {
		response[i].timeout = TIME_EXPIRE_ROOM - parseInt((timeNow - response[i].timeCreate) /1000) ;
	};
	Spark.setScriptData("data", response);

}

if(data.join_room){
	var room_id = data.room_id;
	var index = data.server_id;
	var server = Spark.runtimeCollection("FriendRoom");

	if(server.find({"room_id":room_id})){
		var response = true;
		server.remove({"room_id":room_id});
		var timeNow = Date.now();
		server.update({"playerID": playerID},{"playerID": playerID,"timeCreate": timeNow,"server_id":index},true,false);
		var theScheduler = Spark.getScheduler();
		theScheduler.inSeconds("remove_online_player", TIME_EXPIRE_MATCH, {"playerID" : playerID});
	}else{
		var response = false;
	}
	Spark.setScriptData("data", response);
}

function remove_room () {
	var server = Spark.runtimeCollection("FriendRoom");
	server.remove({"playerID":playerID});
}