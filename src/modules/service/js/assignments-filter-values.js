const createServiceEmployeeArray = (assignments, getAccountFullNameFunction) => {
	const employeesAccIdSet = new Set(
		assignments
			.filter(({ owner_id }) => owner_id)
			.map(({ owner_id }) => owner_id)
	)
	return Array.from(employeesAccIdSet).map((accId) => ({
		title: getAccountFullNameFunction(accId),
		value: accId
	}))
}

const spliceCustomerAddress = (address, spliceCity, spliceApartment) => {
	const addressArray = address.split(',')
	const apartmentIndex = addressArray.indexOf(addressArray.find((str) => str.includes('кв')))
	const cityIndex = addressArray.indexOf(addressArray.find((str) => str.includes('Магнитогорск')))
	if (spliceApartment && apartmentIndex !== -1) {
		addressArray.splice(apartmentIndex, 1)
	}
	if (spliceCity && cityIndex !== -1) {
		addressArray.splice(cityIndex, 1)
	}
	return addressArray.join(',').trim()
}

const createBuildingArray = (assignments) => {
	const buildingsSet = new Set(
		assignments
			.filter(({ customer_address }) => customer_address)
			.map(({ customer_address }) => spliceCustomerAddress(customer_address, true, true))
	)
	return  Array.from(buildingsSet)
}

const createServiceAddressesArray = (assignments) => {
	const addressesSet = new Set(
		assignments
			.filter(({ meter_address }) => meter_address)
			.map(({ meter_address }) => meter_address)
	)
	return Array.from(addressesSet)
}

const createMeterTypesArray = (assignments, getMeterTypeTitle) => {
	const meterTypesSet = new Set(
		assignments
			.map(({ meter_type }) => meter_type)
	)
	return Array.from(meterTypesSet).map((meterType) => ({
		title: getMeterTypeTitle(meterType),
		value: meterType
	}))
}

const getFilteredAssignments = (assignments, filters) => {
	return assignments
		.filter((assignment) => filters.owners.length ? filters.owners.includes(assignment.owner_id) : true)
		.filter((assignment) => filters.statuses.length ? filters.statuses.includes(assignment.status) : true)
		.filter((assignment) => filters.buildings.length ? filters.buildings.some((building) => assignment.customer_address?.includes(building)) : true)
		.filter((assignment) => filters.addresses.length ? filters.addresses.includes(assignment.meter_address) : true)
}

export  {
	createServiceEmployeeArray,
	createBuildingArray,
	createServiceAddressesArray,
	getFilteredAssignments,
	spliceCustomerAddress,
	createMeterTypesArray
}