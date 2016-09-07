//-----------------event service - controller------------------//
var test_real_time = Spark.runtimeCollection("test_real_time");
var eventMaster = Spark.runtimeCollection("event_master");
var eventGroupMember = Spark.runtimeCollection("event_group_member");
var playerDataSys = Spark.systemCollection("player");
var playerDataCollection = Spark.runtimeCollection("playerData");
var cache = Spark.getCache();

function getEventComing() {
	var now = getTimeNow();
	var event = eventMaster.findOne({"$and":[{"time_prepare":{"$lte":now}},{"time_start":{"$gt":now}}]});
    return event;
}

function getEventJustEnded() {
	var now = getTimeNow() + 10*60*1000;
	var event = eventMaster.findOne({"$and":[{"time_end":{"$lte":now}},{"time_close":{"$gt":now}}]});
    return event;
}

function getCurrentEventStart(without_cache) {
	var event = cache.get("current_event_start");
	if (!event || without_cache) {
		var now = getTimeNow();
    	event = eventMaster.findOne({"$and":[{"time_start":{"$lte": now}}, {"time_end":{"$gt":now}}]});	
    	cache.put("current_event_start", event);
	}
    return event;
}

function getCurrentEvent(without_cache) {
	var event = cache.get("current_event");
	if (!event || without_cache) {
		var now = getTimeNow();
    	event = eventMaster.findOne({"$and":[{"time_prepare":{"$lte": now}}, {"time_close":{"$gt":now}}]});
    	cache.put("current_event", event);
	}
    return event;
}

function getEventReward(event_id) {
	var rewards = eventMaster.findOne({"event_id":event_id}).rewards;
	return rewards;
}

function getAllGroupMember(event_id) {
	var group = eventGroupMember.find({"event_id":event_id}).toArray();
	return group;
}

function getGroupMember(event_id, group_id) {
	var group = eventGroupMember.findOne({"$and":[{"event_id":event_id},{"group_id":group_id}]});
	return group;
}

function getGroupMemberByPlayerID(event_id, playerID) {
	var group = eventGroupMember.findOne({"$and":[{"event_id":event_id},{"members":{"$elemMatch":{"playerID":playerID}}}]});
	return group;
}

function getGroupMemberSortByTrophies(event_id, playerID) {
	var groupMember = getGroupMemberByPlayerID(event_id, playerID);
	if (groupMember) {
		var members = groupMember.members;
		members.sort(function(a,b){
			return b.trophies - a.trophies;
		});
	}
	return groupMember;
}

function updateMemberData(event_id, member) {
	eventGroupMember.update({"$and":[{"event_id":event_id},{"members.playerID":member.playerID}]},
		{"$set":{"members.$.trophies":member.trophies,"members.$.last_rank":member.last_rank,"members.$.last_trophies":member.last_trophies}}, true, false);
}

function updateEventTrophies(event_id, playerID, trophies) {
	eventGroupMember.update({"$and":[{"event_id":event_id},{"members.playerID":playerID}]},{"$set":{"members.$.trophies":trophies}}, true, false);
}

function updateEventMemberName(event_id, playerID, userName) {
	eventGroupMember.update({"$and":[{"event_id":event_id},{"members.playerID":playerID}]},{"$set":{"members.$.userName":userName}}, true, false);
}

function getMember(event_id, playerID) {
	var groupMember = getGroupMemberByPlayerID(event_id, playerID);
	if (groupMember) {
		var members = groupMember.members;
		members.forEach(function(member){
			if(member.playerID == playerID) {
				return member;
			}
		});
	}
	return null;
}

function getPlayerRank(event_id, playerID) {
	var groupMember = getGroupMemberSortByTrophies(event_id, playerID);
	if (groupMember) {
		var members = groupMember.members;
		for (var i = 0; i < members.length; i++) {
			if (members[i].playerID == playerID) {
				return (i + 1);
			}
		}
	}
	return -1;
}

function removeCacheEvent() {
	cache.remove("current_event");
	cache.remove("current_event_start");
}
