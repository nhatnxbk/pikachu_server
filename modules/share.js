var DEBUG = true;
var TIME_EXPIRE_MATCH = 600;
var TIME_EXPIRE_ROOM = 120;
var TIME_FB_INVITE = 86400000;
var NUM_LEVEL = 34;
var BONUS_TROPHIES = 30;
var PHOTON_SERVER_LIST = ["8fb86562-5e7c-41ea-82bb-5756a030edf5","819e35b8-5e82-484d-9a53-13593611119b"];
var LEADER_BOARD_GLOBAL = 1;
var LEADER_BOARD_BY_COUNTRY = 2;
var LEADER_BOARD_BY_FRIENDS = 3;
var SHORT_CODE_LB_GLOBAL = "TLBG";
var SHORT_CODE_LB_BY_COUNTRY = "TLBBC.COUNTRY.";
var LEADER_BOARD_NUMBER_ENTRY = 100;
var NUMBER_IGNORE_PLAYER = 3;
var CONFIG = {};
CONFIG.num_friend_per_energy = 500;
CONFIG.app_version = 10;
CONFIG.time_energy_recover = 1000;
CONFIG.time_change_to_bot = 30;
CONFIG.num_level = NUM_LEVEL;
CONFIG.leader_board_global = LEADER_BOARD_GLOBAL;
CONFIG.leader_board_by_country = LEADER_BOARD_BY_COUNTRY;
CONFIG.leader_board_by_friends = LEADER_BOARD_BY_FRIENDS;
CONFIG.rt_1 = [6, 6, 6, 7, 6, 7, 5, 5, 5, 5, 4, 5, 4, 3, 3, 2];//con 1 cap
CONFIG.rt_2 = [5, 5, 6, 6, 5, 5, 5, 6, 6, 5, 5, 5, 4, 3, 3, 2];// con 2 cap
CONFIG.rt_3 = [4, 5, 5, 4, 4, 5, 5, 4, 5, 4, 4, 4, 3, 3, 3, 2];// con 3 cap
CONFIG.rt_4 = [4, 4, 3, 4, 3, 4, 4, 3, 4, 4, 4, 3, 3, 3, 3, 2];// con 4 cap
CONFIG.rt_5 = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2];// con >= 5 cap
CONFIG.crt_1 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];// con 1 cap
CONFIG.crt_2 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];// con 2 cap
CONFIG.crt_3 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];// con 3 cap
CONFIG.crt_4 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];// con 4 cap
CONFIG.crt_5 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];// con >= 5 cap
CONFIG.rto_1 = [3.5, 3.5, 3.3, 3.3, 3.2, 3.1, 3.0, 3.0, 3.0, 3.0, 3.0, 2.5, 2.4, 1.5, 1.7, 0.8];
CONFIG.rto_2 = [3.2, 3.2, 3.0, 3.0, 2.5, 2.5, 2.8, 2.8, 2.8, 2.5, 2.3, 2.2, 2.1, 2.0, 2.0, 0.8];
CONFIG.rto_3 = [2.9, 2.5, 2.5, 2.5, 2.5, 2.5, 2.7, 2.7, 2.7, 2.5, 2.3, 2.2, 2.1, 2.0, 1.8, 1.0];
CONFIG.rto_4 = [2.5, 2.5, 2.3, 2.3, 2.4, 2.4, 2.4, 2.3, 2.3, 2.3, 2.2, 2.1, 2.0, 2.0, 1.2, 1.2];
CONFIG.rto_5 = [2.0, 2.0, 2.1, 2.1, 2.1, 2.2, 2.2, 2.0, 2.0, 1.8, 1.8, 1.7, 1.7, 1.7, 1.7, 1.5];
