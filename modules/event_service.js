//-----------------event service - controller------------------//
var test_real_time = Spark.runtimeCollection("test_real_time");
var eventMaster = Spark.metaCollection("event_master");
var eventGroupMember = Spark.runtimeCollection("event_group_member");
var playerDataSys = Spark.systemCollection("player");
var playerDataCollection = Spark.runtimeCollection("playerData");

function getEventComing() {
	var now = Date.now();
	var event = eventMaster.findOne({"$and":[{"time_prepare":{"$lte":now}},{"time_start":{"$gt":now}}]});
    return event;
}

function getEventJustEnded() {
	var now = Date.now();
	var event = eventMaster.findOne({"$and":[{"time_end":{"$lte":now}},{"time_distribute":{"$gt":now}}]});
    return event;
}

function getCurrentEventStart() {
    var now = Date.now();
    var event = eventMaster.findOne({"$and":[{"time_start":{"$lte": now}}, {"time_end":{"$gt":now}}]});
    return event;
}

function getCurrentEvent() {
	var now = Date.now();
    var event = eventMaster.findOne({"$and":[{"time_prepare":{"$lte": now}}, {"time_distribute":{"$gt":now}}]});
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

function updateEventTrophies(event_id, playerID, trophies) {
	eventGroupMember.update({"$and":[{"event_id":event_id},{"members.playerID":playerID}]},{"$set":{"members.$.trophies":trophies}}, true, false);
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
