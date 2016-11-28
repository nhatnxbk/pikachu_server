//-------------run every minute------------//
require("share");
require("event_service");
require("common");
var enable = true;

if (enable) {
    // test_real_time.insert({"time":getTimeNow()});
    var eventComing = getEventComing();
    var eventJustEnded = getEventJustEnded();
    var eventOnGoing = getCurrentEventStart();

    // match group for event coming
    if (eventComing && !eventComing.is_prepare) {
        eventMaster.update({"event_id":eventComing.event_id},{"$set":{"is_prepare":1}}, true, false);
        removeCacheEvent();
        var titlePN = message_const.title_event_start;
        var time = Math.ceil((eventComing.time_start - getTimeNow()) / 86400000);
        var messagePN = {
            "en" : message_const.message_event_start.en.concat(time).concat(message_const.message_event_start2.en),
            "vi" : message_const.message_event_start.vi.concat(time).concat(message_const.message_event_start2.vi)
        };
        SendNewNotification(server_config.ONE_SIGNAL_APP_ID.pikachu_online, [], ["All"], [], titlePN, messagePN, {"actionSelected":server_config.REDIRECT_TO.EVENT});
        SendNewNotification(server_config.ONE_SIGNAL_APP_ID.pikachu_online_2p, [], ["All"], [], titlePN, messagePN, {"actionSelected":server_config.REDIRECT_TO.EVENT});
    }

    //push notification when event start
    if (eventOnGoing && !eventOnGoing.is_push_start) {
        eventMaster.update({"event_id":eventOnGoing.event_id},{"$set":{"is_push_start":1}}, true, false);
        removeCacheEvent();
        var titlePN = message_const.title_event_start;
        var messagePN = message_const.message_event_started;
        SendNewNotification(server_config.ONE_SIGNAL_APP_ID.pikachu_online, [], ["All"], [], titlePN, messagePN, {"actionSelected":server_config.REDIRECT_TO.EVENT});
        SendNewNotification(server_config.ONE_SIGNAL_APP_ID.pikachu_online_2p, [], ["All"], [], titlePN, messagePN, {"actionSelected":server_config.REDIRECT_TO.EVENT});
    }

    // distribute reward for user after event ended
    if (eventJustEnded && !eventJustEnded.is_distribute_reward) {
        var listPlayerPNPikachu = [];
        var listPlayerPNPikachu2p = [];
        var groupMembers = getAllGroupMember(eventJustEnded.event_id);
        var rewards = eventJustEnded.rewards;
        if (rewards && rewards.length > 0) {
            groupMembers.forEach(function(groupMember){
                var members = groupMember.members;
                members.sort(function(a, b) {
                  return b.trophies - a.trophies;
                });
                for (var i = 0; i < members.length; i++) {
                    if (i < rewards.length && members[i].trophies > 0) {
                       var reward = rewards[i];
                       reward.is_received = 0;
                       reward.event_id = eventJustEnded.event_id;
                       var playerCus = playerDataCollection.findOne({"playerID":members[i].playerID});
                       if (playerCus && playerCus.one_signal_player_id) {
                            if (playerCus.store_id == server_config.STORE_ID.pikachu_2p_android) {
                                listPlayerPNPikachu2p.push(playerCus.one_signal_player_id);
                            } else {
                                listPlayerPNPikachu.push(playerCus.one_signal_player_id);
                            }
                       }
                       playerDataCollection.update({"playerID":members[i].playerID},{"$set":{"event_rewards":reward}}, true, false);
                    } else {
                        break;
                    }
                }
            });
        }
        eventMaster.update({"event_id":eventJustEnded.event_id},{"$set":{"is_distribute_reward":1}},true, false);
        var titlePN = {
            "en" : server_config.title_event_reward.en,
            "vi" : server_config.title_event_reward.vi
        }
        var messagePN = {
            "en" : message_const.message_event_reward.en,
            "vi" : message_const.message_event_reward.vi
        }
        SendNewNotification(server_config.ONE_SIGNAL_APP_ID.pikachu_online, listPlayerPNPikachu, [], [], titlePN, messagePN, {"actionSelected":server_config.REDIRECT_TO.EVENT});
        SendNewNotification(server_config.ONE_SIGNAL_APP_ID.pikachu_online_2p, listPlayerPNPikachu2p, [], [], titlePN, messagePN, {"actionSelected":server_config.REDIRECT_TO.EVENT});
    }
}