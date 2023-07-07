const AssignmentEventType = {
	REGISTERED: 1,
	IN_WORK: 2,
	CLOSE: 3,
	ACTION: 4,
	RE_REGISTRED: 5,
	SYSTEM_ACTION: 6,
	CLOSE_AUTO: 7,
	DECLINE: 8,
}

const AssignmentStatus = {
	REGISTERED: 1,
	IN_WORK: 2,
	CLOSED: 3,
	RE_REGISTERED: 4,
	CLOSED_AUTO: 5,
}

const MapViewTypes = {
	RESEARCH: 1,
	ASSIGNMENT: 2,
}

const NOT_AUTHORIZATED_ERROR = 401

export {
	AssignmentEventType,
	NOT_AUTHORIZATED_ERROR,
	MapViewTypes,
	AssignmentStatus
}