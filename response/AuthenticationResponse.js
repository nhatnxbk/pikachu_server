require("share");
// ====================================================================================================
//
// Cloud Code for AuthenticationResponse, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
var playerData = Spark.runtimeCollection("playerData"); // get the collection data
var currentPlayer = playerData.findOne({
	"playerID": Spark.getPlayer().getPlayerId()
}); // search the collection data for the entry with the same id as the player
if (currentPlayer == null) currentPlayer = {};

//======== Caculate time can request and receive energy or not=========//
var timeNow = Date.now();
Spark.getLog().debug("Now : " + timeNow);
var time_fb_invite = 0;
if( currentPlayer.time_fb_invite !== undefined){
    time_fb_invite = currentPlayer.time_fb_invite;
}
if(!currentPlayer.userName && currentPlayer.facebook_name){
    currentPlayer.userName = currentPlayer.facebook_name;
    var result = Spark.sendRequest(
    {
    	"@class" : ".ChangeUserDetailsRequest",
    	"displayName" : currentPlayer.facebook_name
    });
}
var timeDelta = timeNow - time_fb_invite;
if(timeDelta < TIME_FB_INVITE){
    currentPlayer.can_fb_invite = false;
}else{
    currentPlayer.can_fb_invite = true;
}
delete currentPlayer.time_fb_invite;
delete currentPlayer.last_fb_friend_number;
delete currentPlayer.online_button_click;
delete currentPlayer.offline_button_click;
delete currentPlayer.online_match_start;
delete currentPlayer.online_bot_start;
var response = Spark.sendRequest({"@class":".AccountDetailsRequest"});
currentPlayer.location =  response.location;
Spark.setScriptData("player_Data", currentPlayer); // return the player via script-data
Spark.setScriptData("config", CONFIG); // return the player via script-data