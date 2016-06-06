// ====================================================================================================
//
// Cloud Code for analytic, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("share");
var data = Spark.getData().data;
var response= {};
if(data.level_data){
	var playerDataList = Spark.runtimeCollection("playerData");
	for(var i = 1; i <= NUM_LEVEL ;i++){
		response["level" + i] = playerDataList.count({"level":i});
	}
}
if(data.level_data_passed){
	var playerDataList = Spark.runtimeCollection("playerData");
	var sum = 0;
	for(var i = NUM_LEVEL; i >= 1 ;i--){
		sum += playerDataList.count({"level":i});
		response["level" + i] = sum;
	}
}
Spark.setScriptData("data", response);