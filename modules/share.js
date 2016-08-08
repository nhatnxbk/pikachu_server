<<<<<<< HEAD
=======
<<<<<<< 5df06772480d4a872bafaa7e3c6b10d26b44c3b7
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
var CONFIG_VERSION = 1;
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

=======
>>>>>>> Xoa phan khai bao thua
>>>>>>> 3ebecc69650c0149f10b76e6a1faf4864266bdde
//Config send to user
var CONFIG = {};
var packData = Spark.metaCollection("client_config");
CONFIG = packData.findOne({server:0});

var server_config = packData.findOne({server:1});
var DEBUG=server_config.DEBUG;
var TIME_EXPIRE_MATCH=server_config.TIME_EXPIRE_MATCH;
var TIME_EXPIRE_ROOM=server_config.TIME_EXPIRE_ROOM;
var TIME_FB_INVITE=server_config.TIME_FB_INVITE;
var NUM_LEVEL=server_config.NUM_LEVEL;
var BONUS_TROPHIES=server_config.BONUS_TROPHIES;
var BONUS_BY_TROPHIES_OFFSET=server_config.BONUS_BY_TROPHIES_OFFSET;
var BONUS_TROPHIES_OFFSET=server_config.BONUS_TROPHIES_OFFSET   ;
var PHOTON_SERVER_LIST=server_config.PHOTON_SERVER_LIST;
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
