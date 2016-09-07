require("share");
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
var event = getCurrentEvent(true);
if (currentPlayer === null){
    currentPlayer = {};
}
if(!("trophies" in currentPlayer)){
  currentPlayer.trophies = USER_START_TROPHY + parseInt(Math.random()*100);
  currentPlayer.online_win = 0;
  currentPlayer.online_match_start = 0;
  currentPlayer.highest_trophy = currentPlayer.trophies;
  //new user join event
  if (event) {
    joinEvent();
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
    var item_shop_data = packItemMaster.find().toArray();
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

// check admin
var is_admin = isAdmin();
currentPlayer.is_admin = isAdmin();

// get new message
var numNewMessage = getNumberNewMessgae(is_admin);
currentPlayer.new_message = numNewMessage;

//get event
if (event) {
  var event_data = {
    "trophies" : 0
  }
  if (event.time_prepare <= timeNow && timeNow < event.time_start) {
    event_data.status = 1;
    event_data.time = event.time_start - timeNow;
    event_data.event_name = (currentPlayer.location && currentPlayer.location.country == "VN")
        ? message_const.event_prepare_status.vi
        : message_const.event_prepare_status.en;
  } else if (event.time_start <= timeNow && timeNow < event.time_end) {
    event_data.status = 2;
    event_data.time = event.time_end - timeNow;
    event_data.event_name = (currentPlayer.location && currentPlayer.location.country == "VN")
        ? message_const.event_ongoing_status.vi
        : message_const.event_ongoing_status.en;
  } else if (event.time_end <= timeNow) {
    event_data.status = 3;
    event_data.time = event.time_close - timeNow;
    event_data.event_name = (currentPlayer.location && currentPlayer.location.country == "VN")
        ? message_const.event_ended_status.vi
        : message_const.event_ended_status.en;
  }
  var groupMember = getGroupMemberSortByTrophies(event.event_id, playerID);
  if (groupMember) { // nam trong 1 group nao day roi
    var members = groupMember.members;
    var rewards = event.rewards;
    if (rewards && rewards.length > 0) {
      for (var i = 0; i < members.length; i++) {
        if (members[i].playerID == playerID) {
          event_data.trophies = members[i].trophies;
          if (i < rewards.length) {
            if (event.time_end <= timeNow && event_data.trophies == 0) {
              event_data.rewards = {
                "reward_coin" : 0,
                "reward_trophies" : 0 
              }
            } else {
              event_data.rewards = rewards[i];
            }
          }
          break;
        }
      }
    }
  }
  currentPlayer.event_data = event_data;
}

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
  var notice = userNotice.find({$or:[{"playerID":"all"},{"playerID":playerID}]}).limit(NUM_NOTICE).sort({"time":-1}).toArray();
  var feedbacks;
  var limit = isAdmin ? NUM_NOTICE_ADMIN : NUM_NOTICE;
  if (isAdmin) {
    feedbacks = userFeedbackData.find().limit(limit).sort({"response":1,"time":-1}).toArray();
  } else {
    feedbacks = userFeedbackData.find({"playerID":playerID}).limit(limit).sort({"time":-1}).toArray();  
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

function joinEvent() {
  var member = {
    "playerID": playerID,
    "userName": currentPlayer.userName ? currentPlayer.userName : playerID,
    "trophies": 0,
    "last_rank": 1,
    "last_trophies": 0
  }
  if (event.is_match_group) {
    var lastGroup = eventGroupMember.find({"event_id":event.event_id}).sort({"group_id":-1}).limit(1).toArray()[0];
    if (lastGroup.members.length < NUMBER_MEMBER_PER_GROUP) {
      member.last_rank = lastGroup.members.length;
      lastGroup.members.push(member);
      eventGroupMember.update({"event_id":event.event_id, "group_id":lastGroup.group_id},{"$set":lastGroup}, true, false);
    } else {
      var newGroupMember = {
        "event_id" : event.event_id,
        "group_id" : lastGroup.group_id + 1,
        "members"  : [ member ]
      }
      eventGroupMember.insert(newGroupMember);
    }
  }
}