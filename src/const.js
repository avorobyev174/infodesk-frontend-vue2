const AssignmentEventType = {
	REGISTERED: 1,
	IN_WORK: 2,
	CLOSED: 3,
	ACTION: 4,
	RE_REGISTRED: 5,
	SYSTEM_ACTION: 6,
	CLOSED_AUTO: 7,
	DECLINE: 8,
}

const AssignmentStatus = {
	REGISTERED: 1,
	IN_WORK: 2,
	CLOSED: 3,
	RE_REGISTERED: 4,
	CLOSED_AUTO: 5,
}

const MapViewType = {
	RESEARCH: 1,
	ASSIGNMENT: 2,
}

const NOT_AUTHORIZATED_ERROR = 401

const Difference = {
	KFTT: 0,
	PERSONAL_ACCOUNT: 1,
	ADDRESS: 2,
	NOT_EXIST: 3,
}

export {
	AssignmentEventType,
	NOT_AUTHORIZATED_ERROR,
	MapViewType,
	AssignmentStatus,
	Difference
}