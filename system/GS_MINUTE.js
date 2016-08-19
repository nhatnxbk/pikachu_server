//-------------run every minute------------//
require("share");
require("event_service");
var enable = false;

if (enable) {
    // test_real_time.insert({"time":Date.now()});
    var eventComing = getEventComing();
    var eventJustEnded = getEventJustEnded();

    // match group for event coming
    if (eventComing && !eventComing.is_match_group) {
    	var playerMasterArr = playerDataSys.find().sort({"lastSeen.data.numberLong":-1}).toArray();
        var numberPlayer = playerMasterArr.length;
    	var numberGroup = Math.ceil(numberPlayer / NUMBER_MEMBER_PER_GROUP);
    	var groupMemeber = [];
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
                var member = {
                    "playerID" : playerID,
                    "userName" : playerName,
                    "trophies" : 0
                };
                members.push(member);
    		}
            group.members = members;
            groupMemeber.push(group);
    	}
        eventGroupMember.insert(groupMemeber);
        eventMaster.update({"event_id":eventComing.event_id},{"$set":{"is_match_group":1}},true, false);
    }

    // distribute reward for user after event ended
    if (eventJustEnded && !eventJustEnded.is_distribute_reward) {

    }
}
