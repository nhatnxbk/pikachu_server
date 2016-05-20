//======Leader board======//
require("share");
var playerID = Spark.getPlayer().getPlayerId();
var playerData = Spark.runtimeCollection("playerData");
var currentPlayer = playerData.findOne({"playerID": playerID});
var data = Spark.getData().data;
if(!data) data = {};

if (data.leader_board_type == LEADER_BOARD_GLOBAL) {
	//leader board global
	var dataResponse = RQLeaderBoard(SHORT_CODE_LB_GLOBAL, playerID);
	if (dataResponse.myPlayerRank === undefined) {
		dataResponse.myPlayerRank = RQMyPlayerRank(SHORT_CODE_LB_GLOBAL, playerID);
	}
	Spark.setScriptData("data", dataResponse);
}

if (data.leader_board_type == LEADER_BOARD_BY_COUNTRY) {
	//leader board by country
	var country = (currentPlayer.location && currentPlayer.location.country) ? currentPlayer.location.country : "VN";
	if (country == "") country = "VN";
	var dataResponse = RQLeaderBoard(SHORT_CODE_LB_BY_COUNTRY + country, playerID);
	if (dataResponse.myPlayerRank === undefined) {
		dataResponse.myPlayerRank = RQMyPlayerRank(SHORT_CODE_LB_BY_COUNTRY + country, playerID);
	}
	Spark.setScriptData("data", dataResponse);
}

if (data.leader_board_type == LEADER_BOARD_BY_FRIENDS) {
	//leader board by friends
	var friendList = (currentPlayer && currentPlayer.facebook_friend) ? currentPlayer.facebook_friend : [];
	var playerList = playerData.find().sort({"trophies":-1}).limit(100).toArray();
	var listRank = [];
	var myPlayerRank;
	for (var i = 0; i < playerList.length; i++) {
		var opponent = playerList[i];
		if (opponent.playerID == playerID) {
			myPlayerRank = {
				"rank"     : (listRank.length + 1),
				"trophies" : opponent.trophies,
				"userName" : opponent.userName,
				"userId"   : opponent.playerID
			};
			listRank.push(myPlayerRank);
		} else if (opponent.facebook_id && friendList.indexOf(opponent.facebook_id) != -1) {
			var rank = {
				"rank"     : (listRank.length + 1),
				"trophies" : opponent.trophies,
				"userName" : opponent.userName,
				"userId"   : opponent.playerID
			};
			listRank.push(rank);
		}
	}
	if (!myPlayerRank) {
		myPlayerRank = {
			"rank"     : 1,
			"trophies" : currentPlayer.trophies,
			"userName" : currentPlayer.userName,
			"userId"   : currentPlayer.playerID
		};
	}
	var dataResponse = {
		"listRank" 	   : listRank,
		"myPlayerRank" : myPlayerRank
	};
	Spark.setScriptData("data", dataResponse);
}

function RQMyPlayerRank(shortCode) {
	var request = new SparkRequests.AroundMeLeaderboardRequest();
	request.dontErrorOnNotSocial = false;
	request.entryCount = 1;
	request.includeFirst = 0;
	request.includeLast = 0;
	request.inverseSocial = false;
	request.leaderboardShortCode = shortCode;
	request.social = false;
	var response = request.Send();
	var data = response.data;
	if (!data) data = [];
	var myPlayerRank;
	for (var i = 0; i < data.length; i++) {
		var opponent = data[i];
		if (playerID == opponent.userId) {
			myPlayerRank = {
				"rank"     : opponent.rank,
				"trophies" : opponent.trophies,
				"userName" : opponent.userName,
				"userId"   : opponent.userId
			};
		}
		return myPlayerRank;
	}
	return myPlayerRank;
}

function RQLeaderBoard(shortCode) {
	var request = new SparkRequests.LeaderboardDataRequest();
	request.dontErrorOnNotSocial = true;
	request.entryCount = LEADER_BOARD_NUMBER_ENTRY;
	request.friendIds = [""];
	request.includeFirst = 0;
	request.includeLast = 0;
	request.inverseSocial = false;
	request.leaderboardShortCode = shortCode;
	request.offset = 0;
	request.social = false;

	var response = request.Send();
	var data = response.data;
	if (!data) data = [];
	var listRank = [];
	var myPlayerRank;
	for (var i = 0; i < data.length; i++) {
		var opponent = data[i];
		var rank = {
			"rank"     : opponent.rank,
			"trophies" : opponent.trophies,
			"userName" : opponent.userName,
			"userId"   : opponent.userId
		};
		listRank.push(rank);
		if (playerID == opponent.userId) {
			myPlayerRank = rank;
		}
	}
	var dataResponse = {
		"listRank" 	   : listRank,
		"myPlayerRank" : myPlayerRank
	};
	return dataResponse;
}