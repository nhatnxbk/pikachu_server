require("share");
var playerDataList = Spark.runtimeCollection("playerData");
var playerID = Spark.getPlayer().getPlayerId();
var playerData = playerDataList.findOne({"playerID":playerID});
var itemPackMaster = Spark.metaCollection("pack_item_master");
var logPurchaserData = Spark.runtimeCollection("user_purchaser_log");
var data = Spark.getData().data;
if(!data) data = {};

//add coin
if (data.add_player_coin) {
	var response;
	var playerCoin = playerData.player_coin ? playerData.player_coin : 0;
	var coin = data.number_coin ? data.number_coin : 0;
	playerData.player_coin = playerCoin + coin;
	playerDataList.update({"playerID":playerID},{"$set":{"player_coin":playerData.player_coin}});
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

function getItemName(item_id) {
	switch(item_id) {
		case 0 :return "Item Hint";
		case 1 : return "Item Random";
		case 2 : return "Item Energy";
	}
	return "";
}