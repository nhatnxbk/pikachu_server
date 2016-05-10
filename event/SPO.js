require("share");

var playerDataList = Spark.runtimeCollection("playerData"); 
var player_data = Spark.getData().player_data;
var playerID = Spark.getPlayer().getPlayerId(); 

var currentPlayer = playerDataList.findOne({
	"playerID": Spark.getPlayer().getPlayerId()
}); // search the collection data for the entry with the same id as the player

var timeNow = Date.now();
Spark.getLog().debug("Now : " + timeNow);
var time_fb_invite = 0;
if(currentPlayer.time_fb_invite !== undefined){
    time_fb_invite = currentPlayer.time_fb_invite;
}
var timeDelta = timeNow - time_fb_invite;
if(timeDelta < TIME_FB_INVITE){
    currentPlayer.can_fb_invite = false;
}else{
    currentPlayer.can_fb_invite = true;
}

if(player_data.time_fb_invite !== undefined && currentPlayer.can_fb_invite){
    player_data.time_fb_invite = Date.now();
    currentPlayer.can_fb_invite = false;
        
    playerDataList.update({
    	"playerID": playerID
    }, //Looks for a doc with the id of the current player
    {
    	"$set": player_data
    }, // Uses the $set mongo modifier to set old player data to the current player data
    true, // Create the document if it does not exist (upsert)
    false // This query will only affect a single object (multi)
    );
}else{
     player_data.time_fb_invite = time_fb_invite;
}

player_data.can_fb_invite = currentPlayer.can_fb_invite;

Spark.setScriptData("player_Data", player_data); // return the player via script-data