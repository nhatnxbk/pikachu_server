require("share");
// ====================================================================================================
//
// Cloud Code for AuthenticationResponse, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
var playerID = Spark.getPlayer().getPlayerId();
var playerData = Spark.runtimeCollection("playerData"); // get the collection data
var currentPlayer = playerData.findOne({
	"playerID": playerID
}); // search the collection data for the entry with the same id as the player
if (currentPlayer === null){
    currentPlayer = {};
}
if(!("trophies" in currentPlayer)){
  currentPlayer.trophies = USER_START_TROPHY + parseInt(Math.random()*100);
  currentPlayer.online_win = 0;
  currentPlayer.online_match_start = 0;
  currentPlayer.highest_trophy = currentPlayer.trophies;
//   var result = Spark.sendRequest({
//     "@class": ".LogEventRequest",
//     "eventKey": "TLB",
//     "trophies": currentPlayer ? currentPlayer.trophies : 0,
//     "COUNTRY": currentPlayer && currentPlayer.location && currentPlayer.location.country ? currentPlayer.location.country : "VN",
//     "CITY": ""
// });
}

if (!currentPlayer.player_coin) {
    currentPlayer.player_coin = DEFAULT_COIN;
}
//======== Caculate time can request and receive energy or not=========//
var timeNow = Date.now();
Spark.getLog().debug("Now : " + timeNow);
var time_fb_invite = 0;
if( "time_fb_invite" in currentPlayer){
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

var itemShopData;
if (!currentPlayer.shop_version || currentPlayer.shop_version < SHOP_VERSION) {
    var packItemMaster = Spark.metaCollection("pack_item_master");
    var item_shop_data = packItemMaster.find().toArray();
    itemShopData = {
      "item_shop_data" : item_shop_data
    }
    currentPlayer.shop_version = SHOP_VERSION;
}

var config;
if (!currentPlayer.config_version || currentPlayer.config_version < CONFIG_VERSION) {
    config = CONFIG;
    currentPlayer.config_version = CONFIG_VERSION;
}

var response = Spark.sendRequest({"@class":".AccountDetailsRequest"});
currentPlayer.location =  response.location;
playerData.update({"playerID": playerID}, {"$set": currentPlayer}, true,false);
delete currentPlayer.time_fb_invite;
delete currentPlayer.last_fb_friend_number;
delete currentPlayer.online_button_click;
delete currentPlayer.offline_button_click;
delete currentPlayer.rt_1;
delete currentPlayer.rt_2;
delete currentPlayer.rt_3;
delete currentPlayer.rt_4;
delete currentPlayer.rt_5;
delete currentPlayer.crt_1;
delete currentPlayer.crt_2;
delete currentPlayer.crt_3;
delete currentPlayer.crt_4;
delete currentPlayer.crt_5;
delete currentPlayer.rto_1;
delete currentPlayer.rto_2;
delete currentPlayer.rto_3;
delete currentPlayer.rto_4;
delete currentPlayer.rto_5;

// get new message
var numNewMessage = getNumberNewMessgae();
currentPlayer.new_message = numNewMessage;

// check admin
currentPlayer.is_admin = isAdmin();

Spark.setScriptData("player_Data", currentPlayer); // return the player via script-data
if (config !== undefined) {
  Spark.setScriptData("config", CONFIG); // return the player via script-data
}
if (itemShopData !== undefined) {
  Spark.setScriptData("item_shop_data", itemShopData); // return the player via script-data
}

function getNumberNewMessgae() {
  var lastTimeRead = currentPlayer.time_last ? currentPlayer.time_last : 0;
  var userFeedbackData = Spark.runtimeCollection("user_feedback");
  var userNotice = Spark.runtimeCollection("user_notice");
  var notice = userNotice.find({$or:[{"playerID":"all"},{"playerID":playerID}]}).limit(NUM_NOTICE).sort({"time":-1}).toArray();
  var feedback = userFeedbackData.find({"playerID":playerID}).limit(NUM_NOTICE).sort({"time":-1}).toArray();
  var allMessage = notice.concat(feedback);
  allMessage.sort(function(a,b){
    return a.time - b.time;
  });
  var numNewMessage = 0;
  for (var i = 0; i < allMessage.length; i++) {
    if (i < NUM_NOTICE) {
      if (allMessage[i].time >= lastTimeRead) {
        numNewMessage++;
      }
    } else {
      return numNewMessage;
    }
  }
  return numNewMessage;
}

function isAdmin() {
  if (LIST_ADMIN.indexOf(playerID) != -1) {
    return 1;
  }
  return 0;
}