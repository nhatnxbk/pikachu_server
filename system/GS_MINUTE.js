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
    	var playerMasterArr = playerDataSys.find().sort({"lastSeen.data.numberLong":-1}).toArray();
        var numberPlayer = playerMasterArr.length;
    	var numberGroup = Math.ceil(numberPlayer / NUMBER_MEMBER_PER_GROUP);
    	var groupMemeber = [];
        var listPlayerPN_VN = [];
        var listPlayerPN_OTHER = [];
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
                    if (playerCus.location && playerCus.location.country == "VN") {
                        listPlayerPN_VN.push(playerCus.one_signal_player_id);    
                    } else {
                        listPlayerPN_OTHER.push(playerCus.one_signal_player_id);
                    }
                }
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
        var titlePN = "Picachu Tournament";
        var time = Math.ceil((eventComing.time_start - getTimeNow()) / 86400000);
        var messagePN_OTHER = "Event will start after " + time + " hour";
        var messagePN_VN = "Giải đấu sẽ diễn ra sau " + time + " giờ nữa";
        SendNewNotification(listPlayerPN_OTHER, [], [], titlePN, messagePN_OTHER, null);
        SendNewNotification(listPlayerPN_VN, [], [], titlePN, messagePN_VN, null);
    }

    // distribute reward for user after event ended
    if (eventJustEnded && !eventJustEnded.is_distribute_reward) {
        var listPlayerPN_VN = [];
        var listPlayerPN_OTHER = [];
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
                            if (playerCus.location && playerCus.location.country == "VN") {
                                listPlayerPN_VN.push(playerCus.one_signal_player_id);    
                            } else {
                                listPlayerPN_OTHER.push(playerCus.one_signal_player_id);
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
        var titlePN_OTHER = "Picachu Tournament End";
        var titlePN_VN = "Giải đấu kết thúc";
        var messagePN_OTHER = "You got some reward from Tournament, you can receive now";
        var messagePN_VN = "Bạn đã nhận được một số phần thưởng của giải đấu. Kiểm tra ngay nhé!";
        SendNewNotification(listPlayerPN_OTHER, [], [], titlePN_OTHER, messagePN_OTHER, null);
        SendNewNotification(listPlayerPN_VN, [], [], titlePN_VN, messagePN_VN, null);
    }
}
