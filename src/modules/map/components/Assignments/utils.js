import { AssignmentStatus } from "../../../../const"
import { spliceCustomerAddress } from "../../../service/js/assignments-filter-values"
const colorBlue = 'rgba(66, 165, 245)'
const colorGreen = 'rgba(102, 187, 106)'
const colorGrey = 'rgba(125, 125, 125)'

const getMarkerColor = (apartments) => {
	let color = colorGrey
	if (apartments.some((apartment) => apartment.status === AssignmentStatus.IN_WORK)) {
		color = colorBlue
	}
	if (apartments.every((apartment) => [ AssignmentStatus.CLOSED, AssignmentStatus.CLOSED_AUTO ].includes(apartment.status))) {
		color = colorGreen
	}
	return color
}

const isShowDecline = (status, owner_id, currentAccountId) => {
	return [ AssignmentStatus.REGISTERED, AssignmentStatus.RE_REGISTERED ].includes(status) ||
		currentAccountId !== owner_id && status === AssignmentStatus.IN_WORK
}

const isShowAccept = (status, owner_id, currentAccountId) => {
	return status === AssignmentStatus.IN_WORK && currentAccountId === owner_id
}

const createApartment = ({ address, owner_id, status, id, created, meter_serial_number }, currentAccountId) => ({
	address,
	owner_id,
	status,
	id,
	created,
	meter_serial_number,
	isShowAcceptButton: isShowDecline(status, owner_id, currentAccountId),
	isShowDeclineButton: isShowAccept(status, owner_id, currentAccountId)
})

const groupAssignmentsByBuilding = (filteredAssignments, currentAccountId) => {
	return filteredAssignments
		//добавляем поле с домом addressSpliced
		.map(({ id, lat, lng, customer_address, owner_id, status, created, meter_serial_number }) => ({
			addressSpliced: customer_address ? spliceCustomerAddress(customer_address, true, true) : 'неизвестно',
			address: customer_address ? spliceCustomerAddress(customer_address, true, false) : 'неизвестно',
			position: { lat, lng },
			owner_id,
			status,
			id,
			created,
			meter_serial_number
		}))
		//группировка по дому
		.reduce((assignments, currentAssignment) => {
			const foundAddress = assignments.find(({ addressSpliced }) => addressSpliced === currentAssignment.addressSpliced)
			if (foundAddress) {
				foundAddress.count += 1
				foundAddress.apartments.push(createApartment(currentAssignment, currentAccountId))
			} else {
				currentAssignment.count = 1
				currentAssignment.apartments = [ createApartment(currentAssignment, currentAccountId) ]
				assignments.push(currentAssignment)
			}
			return assignments
		}, [])
		//цвет маркера в зависимости от статуса поручений внутри дома
		.map((assignment) => ({
			...assignment,
			color: getMarkerColor(assignment.apartments)
		}))
}

export {
	getMarkerColor,
	groupAssignmentsByBuilding,
	isShowDecline,
	isShowAccept
}