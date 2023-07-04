import { formatDate } from '../../Utils.js'
import { AssignmentEventTypes } from '../../../const.js'

const assignmentToState = (
	{
		created,
		customer_address,
		customer_contacts,
		customer_personal_account,
		owner_id,
		id,
		last_data_date,
		meter_ip_address,
		meter_phone,
		meter_serial_number,
		meter_sim_status,
		meter_type,
		status,
		status_reason
	}) => ({
		id,
		created: formatDate(created),
		customerAddress: customer_address,
		customerContacts: customer_contacts,
		customerPersonalAccount: customer_personal_account,
		lastDataDate: formatDate(last_data_date),
		ownerId: owner_id,
		meterIpAddress: meter_ip_address,
		meterPhone: meter_phone,
		meterSerialNumber: meter_serial_number,
		meterSimStatus: meter_sim_status,
		meterType: meter_type,
		status,
		statusReason: status_reason
	})

const assignmentEventToState = (
	{
		id,
		type,
		created,
		owner_id,
		description,
		assignment_id
	}) => ({
		id,
		type: formatDate(type),
		created: formatDate(created),
		ownerId: owner_id,
		description,
		assignment_id
	})

function f() {

}

export {
	assignmentToState
}