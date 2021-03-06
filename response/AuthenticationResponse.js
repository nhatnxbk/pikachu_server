require("share");
require("common");
require("event_service");
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
var timeNow = getTimeNow();
if (currentPlayer === null){
  currentPlayer = {};
}
if(!("trophies" in currentPlayer)){
  currentPlayer.trophies = USER_START_TROPHY + parseInt(Math.random()*100);
  currentPlayer.online_win = 0;
  currentPlayer.online_match_start = 0;
  currentPlayer.highest_trophy = currentPlayer.trophies;

  if (!currentPlayer.get_first_coin) {// Tang cho user 5k coin dau tien
    currentPlayer.get_first_coin = true;
    currentPlayer.bonus_coin = 5000;
    currentPlayer.bonus_message = "First time login reward!";
  }
}

if (!currentPlayer.player_coin) {
  currentPlayer.player_coin = DEFAULT_COIN;
}

//======== Caculate time can request and receive energy or not=========//
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
  var item_shop_data = convertCollectionHashToArray(packItemMaster.find());
  itemShopData = {
    "item_shop_data" : item_shop_data
  }
  currentPlayer.shop_version = SHOP_VERSION;
}

var config;
if(!currentPlayer.app_version) currentPlayer.app_version = 1;
if (!currentPlayer.config_version || currentPlayer.config_version < CONFIG_VERSION || currentPlayer.app_version <= 17) {
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
delete currentPlayer.get_first_coin;

// check admin
var is_admin = isAdmin();
currentPlayer.is_admin = isAdmin();

// get new message
var numNewMessage = getNumberNewMessgae(is_admin);
currentPlayer.new_message = numNewMessage;

Spark.setScriptData("player_Data", currentPlayer); // return the player via script-data
if (config !== undefined) {
  Spark.setScriptData("config", CONFIG); // return the player via script-data
}
if (itemShopData !== undefined) {
  Spark.setScriptData("item_shop_data", itemShopData); // return the player via script-data
}

function getNumberNewMessgae(isAdmin) {
  var lastTimeRead = currentPlayer.last_read ? currentPlayer.last_read : 0;
  var userFeedbackData = Spark.runtimeCollection("user_feedback");
  var userNotice = Spark.runtimeCollection("user_notice");
  var notice = convertCollectionHashToArray(userNotice.find({$or:[{"playerID":"all"},{"playerID":playerID}]}).limit(NUM_NOTICE).sort({"time":-1}));
  var feedbacks;
  var limit = isAdmin ? NUM_NOTICE_ADMIN : NUM_NOTICE;
  if (isAdmin) {
    feedbacks = convertCollectionHashToArray(userFeedbackData.find().limit(limit).sort({"response":1,"time":-1}));
  } else {
    feedbacks = convertCollectionHashToArray(userFeedbackData.find({"playerID":playerID}).limit(limit).sort({"time":-1}));  
  }
  var allMessage = notice.concat(feedbacks);
  allMessage.sort(function(a,b){
    return b.time - a.time;
  });
  var numNewMessage = 0;
  for (var i = 0; i < allMessage.length; i++) {
    if (i < limit) {
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

function isVN() {
  return (currentPlayer.location && currentPlayer.location.country == "VN") ? true : false;
}