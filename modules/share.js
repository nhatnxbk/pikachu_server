var TIME_EXPIRE_MATCH = 600;
var TIME_EXPIRE_ROOM = 120;
var TIME_FB_INVITE = 86400000;
var NUM_LEVEL = 34;
var BONUS_TROPHIES = 30;
var PHOTON_SERVER_LIST = ["8fb86562-5e7c-41ea-82bb-5756a030edf5","819e35b8-5e82-484d-9a53-13593611119b"];
var CONFIG = {};
CONFIG.num_friend_per_energy = 500;
CONFIG.app_version = 10;
CONFIG.time_energy_recover = 1000;
CONFIG.time_change_to_bot = 30;
CONFIG.num_level = NUM_LEVEL;
CONFIG.default_random_time_1 = [6, 6, 6, 6, 5, 5, 4, 4, 4, 4, 4, 3, 3, 3, 2, 2];//con 1 cap
CONFIG.default_random_time_2 = [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 3, 3, 2, 2, 2];// con 2 cap
CONFIG.default_random_time_3 = [4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 1];// con 3 cap
CONFIG.default_random_time_4 = [3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1];// con 4 cap
CONFIG.default_random_time_5 = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1];// con >= 5 cap
CONFIG.default_count_random_time_1 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];// con 1 cap
CONFIG.default_count_random_time_2 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];// con 2 cap
CONFIG.default_count_random_time_3 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];// con 3 cap
CONFIG.default_count_random_time_4 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];// con 4 cap
CONFIG.default_count_random_time_5 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];// con >= 5 cap
CONFIG.default_random_time_offset_1 = [2.5, 2.5, 2.3, 2.3, 2.2, 2.1, 2.0, 2.0, 2.0, 2.0, 2.0, 1.5, 1.4, 1.2, 1.0, 0.8];
CONFIG.default_random_time_offset_2 = [2.2, 2.2, 2.0, 2.0, 1.5, 1.5, 1.8, 1.8, 1.8, 1.5, 1.3, 1.2, 1.1, 1.0, 1.0, 0.8];
CONFIG.default_random_time_offset_3 = [1.9, 1.5, 1.5, 1.5, 1.5, 1.5, 1.7, 1.7, 1.7, 1.5, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8];
CONFIG.default_random_time_offset_4 = [1.5, 1.5, 1.3, 1.3, 1.4, 1.4, 1.4, 1.3, 1.3, 1.3, 1.2, 1.1, 1.0, 1.0, 0.8, 0.7];
CONFIG.default_random_time_offset_5 = [1.0, 1.0, 1.1, 1.1, 1.1, 1.2, 1.2, 1.0, 1.0, 0.8, 0.8, 0.7, 0.7, 0.7, 0.7, 0.5];
