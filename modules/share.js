//Config send to user
var CONFIG = {};
var packData = Spark.metaCollection("client_config");
CONFIG = packData.findOne({server:0});

var server_config = packData.findOne({server:1});
var message_const = packData.findOne({server:2});
var DEBUG=server_config.DEBUG;
var TIME_EXPIRE_MATCH=server_config.TIME_EXPIRE_MATCH;
var TIME_EXPIRE_ROOM=server_config.TIME_EXPIRE_ROOM;
var TIME_FB_INVITE=server_config.TIME_FB_INVITE;
var NUM_LEVEL=server_config.NUM_LEVEL;
var BONUS_TROPHIES=server_config.BONUS_TROPHIES;
var BONUS_BY_TROPHIES_OFFSET=server_config.BONUS_BY_TROPHIES_OFFSET;
var BONUS_TROPHIES_OFFSET=server_config.BONUS_TROPHIES_OFFSET   ;
var PHOTON_SERVER_LIST=server_config.PHOTON_SERVER_LIST;
var PHOTON_SERVER_LIST_DEBUG =["819e35b8-5e82-484d-9a53-13593611119b"];
var PHOTON_SERVER_LIST_NEW_SERVER=server_config.PHOTON_SERVER_LIST_NEW_SERVER;
var LEADER_BOARD_GLOBAL=server_config.LEADER_BOARD_GLOBAL;
var LEADER_BOARD_BY_COUNTRY=server_config.LEADER_BOARD_BY_COUNTRY;
var LEADER_BOARD_BY_FRIENDS=server_config.LEADER_BOARD_BY_FRIENDS;
var SHORT_CODE_LB_GLOBAL=server_config.SHORT_CODE_LB_GLOBAL;
var SHORT_CODE_LB_BY_COUNTRY=server_config.SHORT_CODE_LB_BY_COUNTRY;
var LEADER_BOARD_NUMBER_ENTRY=server_config.LEADER_BOARD_NUMBER_ENTRY;
var NUMBER_IGNORE_PLAYER=server_config.NUMBER_IGNORE_PLAYER;
var USER_START_TROPHY=server_config.USER_START_TROPHY;
var IGNORE_HAS_RANDOM_TIME=server_config.IGNORE_HAS_RANDOM_TIME;
var TROPHIES_OF_EASY_BOT=server_config.TROPHIES_OF_EASY_BOT  ;
var TROPHIES_OF_NORMAL_BOT=server_config.TROPHIES_OF_NORMAL_BOT;
var DEFAULT_COIN=server_config.DEFAULT_COIN;
var SHOP_VERSION=server_config.SHOP_VERSION;
var CONFIG_VERSION = server_config.CONFIG_VERSION;
var NUM_NOTICE = server_config.NUM_NOTICE;
var NUM_NOTICE_ADMIN = server_config.NUM_NOTICE_ADMIN;
var LIST_ADMIN = server_config.LIST_ADMIN;
var BONUS_COIN_WIN = server_config.BONUS_COIN_WIN;
var NUMBER_MEMBER_PER_GROUP = server_config.NUMBER_MEMBER_PER_GROUP;
var OFFSET_TIME = server_config.DEBUG_OFFSET_TIME;
var rt_1_e=server_config.rt_1_e;
var rt_2_e=server_config.rt_2_e;
var rt_3_e=server_config.rt_3_e;
var rt_4_e=server_config.rt_4_e;
var rt_5_e=server_config.rt_5_e;
var rto_1_e=server_config.rto_1_e;
var rto_2_e=server_config.rto_2_e;
var rto_3_e=server_config.rto_3_e;
var rto_4_e=server_config.rto_4_e;
var rto_5_e=server_config.rto_5_e;
var rt_1_n=server_config.rt_1_n;
var rt_2_n=server_config.rt_2_n;
var rt_3_n=server_config.rt_3_n;
var rt_4_n=server_config.rt_4_n;
var rt_5_n=server_config.rt_5_n;
var rto_1_n=server_config.rto_1_n;
var rto_2_n=server_config.rto_2_n;
var rto_3_n=server_config.rto_3_n;
var rto_4_n=server_config.rto_4_n;
var rto_5_n=server_config.rto_5_n;
var rt_1_h=server_config.rt_1_h;
var rt_2_h=server_config.rt_2_h;
var rt_3_h=server_config.rt_3_h;
var rt_4_h=server_config.rt_4_h;
var rt_5_h=server_config.rt_5_h;
var rto_1_h=server_config.rto_1_h;
var rto_2_h=server_config.rto_2_h;
var rto_3_h=server_config.rto_3_h;
var rto_4_h=server_config.rto_4_h;
var rto_5_h=server_config.rto_5_h;
var EVENT_LEADERBOARD_NUMBER = server_config.EVENT_LEADERBOARD_NUMBER;

function getTimeNow() {
	return Date.now() + OFFSET_TIME;
}

function setTimeNow(time_now) {
	var offset = time_now - Date.now();
	packData.update({"server":1},{"$set":{"DEBUG_OFFSET_TIME":offset}}, true, false);
}

function getUrlDownloadable(code){
	var result = Spark.sendRequest({
      "@class" : ".GetDownloadableRequest",
      "shortCode" : code
    });
    return result.url;
}
