//-------------run every minute------------//
require("share");
require("event_service");
require("common");
var enable = true;

if (enable) {
    // test_real_time.insert({"time":getTimeNow()});
    var eventComing = getEventComing();
    var eventJustEnded = getEventJustEnded();

    // match group for event coming
    if (eventComing && !eventComing.is_match_group) {
        removeCacheEvent();
    	var playerMasterArr = playerDataSys.find().sort({"lastSeen.data.numberLong":-1}).toArray();
        var numberPlayer = playerMasterArr.length;
    	var numberGroup = Math.ceil(numberPlayer / NUMBER_MEMBER_PER_GROUP);
    	var groupMemeber = [];
        var listPlayerPN = [];
    	for (var i = 0; i < numberGroup; i++) {
    		var group = {
    			"group_id" : i + 1,
    			"event_id" : eventComing.event_id
    		};
            var members = [];
    		var idxStart = i * NUMBER_MEMBER_PER_GROUP;
    		var idxEnd = idxStart + NUMBER_MEMBER_PER_GROUP < numberPlayer ? idxStart + NUMBER_MEMBER_PER_GROUP : numberPlayer;
    		for (var j = idxStart; j < idxEnd; j++) { 
                var playerID = playerMasterArr[j]._id.$oid;
                var playerCus = playerDataCollection.findOne({"playerID":playerID});
                var playerName = playerCus && playerCus.userName ? playerCus.userName : playerID;
                if (playerCus && playerCus.one_signal_player_id) {
                    listPlayerPN.push(playerCus.one_signal_player_id);
                }
                playerDataCollection.update({"playerID":playerID},{"$set":{"event_trophies":0}}, true, false);
                var member = {
                    "playerID" : playerID,
                    "userName" : playerName,
                    "trophies" : 0,
                    "last_rank" : members.length,
                    "last_trophies" : 0
                };
                members.push(member);
    		}
            group.members = members;
            groupMemeber.push(group);
    	}
        eventGroupMember.insert(groupMemeber);
        eventMaster.update({"event_id":eventComing.event_id},{"$set":{"is_match_group":1}},true, false);
        var titlePN = {"en" : "Picachu Tournament"};
        var time = Math.ceil((eventComing.time_start - getTimeNow()) / 86400000);
        var messagePN = {
            "en" : "Event will start after ".concat(time).concat(" hours"),
            "vi" : "Giai dau se dien ra sau ".concat(time).concat(" gio nua")
        };
        SendNewNotification(listPlayerPN, [], [], titlePN, messagePN, null);
    }

    // distribute reward for user after event ended
    if (eventJustEnded && !eventJustEnded.is_distribute_reward) {
        var listPlayerPN = [];
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
                       var playerCus = playerDataCollection.findOne({"playerID":members[i].playerID});
                       if (playerCus && playerCus.one_signal_player_id) {
                            listPlayerPN.push(playerCus.one_signal_player_id);
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
            "en" : "Picachu Tournament End",
            "vi" : "Giải đấu kết thúc"
        }
        var messagePN = {
            "en" : "You got some reward from Tournament, you can receive now",
            "vi" : "Bạn đã nhận được một số phần thưởng của giải đấu. Kiểm tra ngay nhé!"
        }
        SendNewNotification(listPlayerPN, [], [], titlePN, messagePN, null);
    }
}
