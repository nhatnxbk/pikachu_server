var DEBUG = false;
var TIME_EXPIRE_MATCH = 600;
var TIME_EXPIRE_ROOM = 120;
var TIME_FB_INVITE = 86400000;
var NUM_LEVEL = 34;
var BONUS_TROPHIES = 25;
var BONUS_BY_TROPHIES_OFFSET = 15;
var BONUS_TROPHIES_OFFSET    = 400;
var PHOTON_SERVER_LIST = ["8fb86562-5e7c-41ea-82bb-5756a030edf5","819e35b8-5e82-484d-9a53-13593611119b"];
var PHOTON_SERVER_LIST_NEW_SERVER = ["2a7ef45c-ff88-4b4b-9819-e36ea45e7b4a","819e35b8-5e82-484d-9a53-13593611119b","8fb86562-5e7c-41ea-82bb-5756a030edf5"];
var LEADER_BOARD_GLOBAL = 1;
var LEADER_BOARD_BY_COUNTRY = 2;
var LEADER_BOARD_BY_FRIENDS = 3;
var SHORT_CODE_LB_GLOBAL = "TLBG";
var SHORT_CODE_LB_BY_COUNTRY = "TLBBC.COUNTRY.";
var LEADER_BOARD_NUMBER_ENTRY = 100;
var NUMBER_IGNORE_PLAYER = 5;
var USER_START_TROPHY = 50;
var IGNORE_HAS_RANDOM_TIME = true;
var TROPHIES_OF_EASY_BOT   = 150;
var TROPHIES_OF_NORMAL_BOT = 250;
var DEFAULT_COIN = 100;
var SHOP_VERSION = 1;
//easy
var rt_1_e = [2, 5, 6, 6, 7, 8, 9, 8, 9, 9, 8, 9, 8, 8, 8, 7];//con 1 cap
var rt_2_e = [2, 4, 4, 5, 6, 7, 8, 7, 9, 8, 7, 8, 8, 7, 6, 6];// con 2 cap
var rt_3_e = [1, 2, 3, 3, 4, 5, 4, 6, 4, 5, 5, 6, 5, 4, 4, 3];// con 3 cap
var rt_4_e = [1, 2, 3, 3, 4, 3, 5, 4, 5, 3, 4, 4, 3, 4, 3, 3];// con 4 cap
var rt_5_e = [1, 2, 2, 3, 2, 3, 2, 3, 4, 3, 4, 3, 3, 3, 3, 2];// con >= 5 cap
var rto_1_e = [0.8, 1.7, 1.5, 2.4, 2.5, 3.0, 3.1, 3.0, 3.2, 3.1, 3.2, 3.3, 3.3, 3.5, 3.5, 3.3];
var rto_2_e = [0.8, 2.0, 2.0, 2.1, 2.2, 2.3, 2.5, 2.8, 2.8, 2.5, 2.5, 3.0, 3.0, 3.0, 3.2, 3.2];
var rto_3_e = [1.0, 1.8, 2.0, 2.1, 2.2, 2.3, 2.5, 2.7, 2.7 ,2.7, 2.5, 2.5, 2.5, 2.5, 2,6, 2.9];
var rto_4_e = [1.2, 1.2, 2.1, 2.2, 2.3, 2.3, 2.4, 2.3, 2.3 ,2.4 ,2.4, 2.4, 2.4 ,2.5, 2.3, 2.4];
var rto_5_e = [1.5, 1.7, 1.8, 1.8, 1.8, 1.8, 1.8, 2.0, 2.2, 2.1, 2.1, 2.2, 2.2, 2.1, 2.2, 2.2];
//normal
var rt_1_n = [2, 4, 5, 6, 7, 8, 9, 8, 9, 9, 8, 8, 8, 8, 8, 6];//con 1 cap
var rt_2_n = [2, 3, 4, 5, 6, 7, 8, 7, 8, 8, 6, 7, 7, 7, 6, 5];// con 2 cap
var rt_3_n = [1, 2, 3, 3, 4, 5, 4, 5, 4, 5, 5, 4, 5, 4, 4, 3];// con 3 cap
var rt_4_n = [1, 2, 3, 3, 4, 3, 4, 4, 4, 3, 4, 4, 3, 4, 3, 3];// con 4 cap
var rt_5_n = [1, 2, 2, 3, 2, 3, 2, 3, 3, 3, 2, 3, 2, 3, 3, 2];// con >= 5 cap
var rto_1_n = [0.8, 1.7, 1.5, 2.4, 2.5, 3.0, 3.1, 3.0, 3.2, 3.1, 3.2, 3.3, 3.3, 3.5, 3.5, 3.3];
var rto_2_n = [0.8, 2.0, 2.0, 2.1, 2.2, 2.3, 2.5, 2.8, 2.8, 2.5, 2.5, 3.0, 3.0, 3.0, 3.2, 3.2];
var rto_3_n = [1.0, 1.8, 2.0, 2.1, 2.2, 2.3, 2.5, 2.7, 2.7 ,2.7, 2.5, 2.5, 2.5, 2.5, 2,6, 2.9];
var rto_4_n = [1.2, 1.2, 2.0, 2.0, 2.1, 2.2, 2.3, 2.3, 2.3 ,2.3 ,2.4, 2.4, 2.4 ,2.5, 2.3, 2.4];
var rto_5_n = [1.5, 1.7, 1.7, 1.7, 1.8, 1.8, 1.8, 2.0, 2.0, 2.1, 2.1, 2.2, 2.1, 2.1, 2.2, 2.2];
//hard
var rt_1_h = [2, 4, 5, 6, 7, 6, 7, 7, 6, 7, 6, 7, 6, 7, 6, 6];//con 1 cap
var rt_2_h = [2, 3, 4, 5, 6, 6, 7, 6, 7, 7, 6, 6, 7, 7, 6, 5];// con 2 cap
var rt_3_h = [1, 2, 3, 3, 4, 5, 4, 5, 4, 5, 5, 4, 5, 4, 4, 3];// con 3 cap
var rt_4_h = [1, 2, 3, 3, 4, 3, 4, 3, 4, 3, 4, 4, 3, 4, 3, 3];// con 4 cap
var rt_5_h = [1, 2, 2, 3, 2, 3, 2, 3, 3, 3, 2, 3, 2, 3, 3, 2];// con >= 5 cap
var rto_1_h = [0.8, 1.7, 1.5, 2.4, 2.5, 3.0, 3.1, 3.0, 3.2, 3.1, 3.2, 3.3, 3.3, 3.5, 3.5, 3.3];
var rto_2_h = [0.8, 2.0, 2.0, 2.1, 2.2, 2.3, 2.5, 2.8, 2.8, 2.5, 2.5, 3.0, 3.0, 3.0, 3.2, 3.2];
var rto_3_h = [1.0, 1.8, 2.0, 2.1, 2.2, 2.3, 2.5, 2.7, 2.7 ,2.7, 2.5, 2.5, 2.5, 2.5, 2,6, 2.9];
var rto_4_h = [1.2, 1.2, 2.0, 2.0, 2.1, 2.2, 2.3, 2.3, 2.3 ,2.3 ,2.4, 2.4, 2.4 ,2.5, 2.3, 2.4];
var rto_5_h = [1.5, 1.7, 1.7, 1.7, 1.8, 1.8, 1.8, 2.0, 2.0, 2.1, 2.1, 2.2, 2.1, 2.1, 2.2, 2.2];

//Config send to user
var CONFIG = {};
CONFIG.num_friend_per_energy = 500;
CONFIG.app_version_ios = 12;
CONFIG.app_version_android = 13;
CONFIG.time_energy_recover = 900;
CONFIG.time_change_to_bot = 30;
CONFIG.num_level = NUM_LEVEL;
CONFIG.leader_board_global = LEADER_BOARD_GLOBAL;
CONFIG.leader_board_by_country = LEADER_BOARD_BY_COUNTRY;
CONFIG.leader_board_by_friends = LEADER_BOARD_BY_FRIENDS;
CONFIG.network_ping_url   = "http://google.com";
CONFIG.network_ping_count = 3;
CONFIG.network_ping_time  = 5;
CONFIG.num_energy_lite = 60;
CONFIG.num_random_lite = 30;
CONFIG.num_hint_lite = 30;
CONFIG.num_energy_normal = 150;
CONFIG.num_random_normal = 75;
CONFIG.num_hint_normal = 75;
CONFIG.num_energy_big = 360;
CONFIG.num_random_big = 180;
CONFIG.num_hint_big = 180;
CONFIG.max_energy_offline = 5;
CONFIG.PhotonPR = 2;//CloudRegionCode
CONFIG.PhotonHO = 1;//HostingOption

var packData = Spark.metaCollection("client_config");
CONFIG = packData.findOne({server:0});
var con = packData.findOne({server:1});

DEBUG=con.DEBUG;
TIME_EXPIRE_MATCH=con.TIME_EXPIRE_MATCH;
TIME_EXPIRE_ROOM=con.TIME_EXPIRE_ROOM;
TIME_FB_INVITE=con.TIME_FB_INVITE;
NUM_LEVEL=con.NUM_LEVEL;
BONUS_TROPHIES=con.BONUS_TROPHIES;
BONUS_BY_TROPHIES_OFFSET=con.BONUS_BY_TROPHIES_OFFSET;
BONUS_TROPHIES_OFFSET=con.BONUS_TROPHIES_OFFSET   ;
PHOTON_SERVER_LIST=con.PHOTON_SERVER_LIST;
PHOTON_SERVER_LIST_NEW_SERVER=con.PHOTON_SERVER_LIST_NEW_SERVER;
LEADER_BOARD_GLOBAL=con.LEADER_BOARD_GLOBAL;
LEADER_BOARD_BY_COUNTRY=con.LEADER_BOARD_BY_COUNTRY;
LEADER_BOARD_BY_FRIENDS=con.LEADER_BOARD_BY_FRIENDS;
SHORT_CODE_LB_GLOBAL=con.SHORT_CODE_LB_GLOBAL;
SHORT_CODE_LB_BY_COUNTRY=con.SHORT_CODE_LB_BY_COUNTRY;
LEADER_BOARD_NUMBER_ENTRY=con.LEADER_BOARD_NUMBER_ENTRY;
NUMBER_IGNORE_PLAYER=con.NUMBER_IGNORE_PLAYER;
USER_START_TROPHY=con.USER_START_TROPHY;
IGNORE_HAS_RANDOM_TIME=con.IGNORE_HAS_RANDOM_TIME;
TROPHIES_OF_EASY_BOT=con.TROPHIES_OF_EASY_BOT  ;
TROPHIES_OF_NORMAL_BOT=con.TROPHIES_OF_NORMAL_BOT;
DEFAULT_COIN=con.DEFAULT_COIN;
SHOP_VERSION=con.SHOP_VERSION;
rt_1_e=con.rt_1_e;
rt_2_e=con.rt_2_e;
rt_3_e=con.rt_3_e;
rt_4_e=con.rt_4_e;
rt_5_e=con.rt_5_e;
rto_1_e=con.rto_1_e;
rto_2_e=con.rto_2_e;
rto_3_e=con.rto_3_e;
rto_4_e=con.rto_4_e;
rto_5_e=con.rto_5_e;
rt_1_n=con.rt_1_n;
rt_2_n=con.rt_2_n;
rt_3_n=con.rt_3_n;
rt_4_n=con.rt_4_n;
rt_5_n=con.rt_5_n;
rto_1_n=con.rto_1_n;
rto_2_n=con.rto_2_n;
rto_3_n=con.rto_3_n;
rto_4_n=con.rto_4_n;
rto_5_n=con.rto_5_n;
rt_1_h=con.rt_1_h;
rt_2_h=con.rt_2_h;
rt_3_h=con.rt_3_h;
rt_4_h=con.rt_4_h;
rt_5_h=con.rt_5_h;
rto_1_h=con.rto_1_h;
rto_2_h=con.rto_2_h;
rto_3_h=con.rto_3_h;
rto_4_h=con.rto_4_h;
rto_5_h=con.rto_5_h;
