import * as XLSX from 'xlsx/xlsx.mjs'

function formatDate(dateToFormat, withTime) {
	if (!dateToFormat) {
		return 'отсутствует'
	}
	
	const date = new Date(dateToFormat)
	let day = String(date.getDate())
	let month = String(date.getMonth() + 1)
	const year = date.getFullYear()
	
	day = day.length < 2 ? day.padStart(2, '0') : day
	month = month.length < 2 ? month.padStart(2, '0') : month
	
	if (withTime) {
		let hours = date.getHours()
		let minutes = date.getMinutes()
		let seconds = date.getSeconds()
		
		if (hours < 10) hours = '0' + hours
		if (minutes < 10) minutes = '0' + minutes
		if (seconds < 10) seconds = '0' + seconds
		
		return `${ day }.${ month }.${ year } ${ hours }:${ minutes }:${ seconds }`
	}
	
	return `${ day }.${ month }.${ year }`
}

function saveDataToExcelFile(dataArray, sheetName, colsWidthArray, fileName) {
	const workBook = XLSX.utils.book_new()
	workBook.SheetNames.push(sheetName)
	const workSheet = XLSX.utils.aoa_to_sheet(dataArray)
	workBook.Sheets[sheetName] = workSheet
	workSheet['!cols'] = colsWidthArray
	XLSX.writeFile(workBook, `${ fileName }.xlsx`)
}

const createEmployeeArray = (objects, getAccountFullNameFunction) => {
	const employeesAccIdSet = new Set(objects.map(({ owner_id }) => owner_id).sort((a, b) => a - b))
	
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

const createBuildingArray = (objects) => {
	const buildingsSet = new Set(
		objects
			.filter(({ customer_address }) => customer_address)
			.map(({ customer_address }) => spliceCustomerAddress(customer_address, true, true))
	)
	return  Array.from(buildingsSet)
}

const createCustomerAddressesArray = (objects) => {
	const buildingsSet = new Set(
		objects
			.filter(({ customer_address }) => customer_address)
			.map(({ customer_address }) => spliceCustomerAddress(customer_address, true, false))
	)
	return  Array.from(buildingsSet)
}

const createAddressesArray = (objects) => {
	const addressesSet = new Set(
		objects
			.filter(({ meter_address }) => meter_address)
			.map(({ meter_address }) => meter_address)
	)
	return Array.from(addressesSet)
}

const createMeterTypesArray = (objects, getMeterTypeTitle) => {
	const meterTypesSet = new Set(objects.map(({ type }) => type))
	
	return Array.from(meterTypesSet).map((meterType) => ({
		title: getMeterTypeTitle(meterType),
		value: meterType
	}))
}

const isJsonValid = (str) => {
	try {
		JSON.parse(str)
	} catch (e) {
		return false
	}
	return true
}

export {
	isJsonValid,
	formatDate,
	saveDataToExcelFile,
	createMeterTypesArray,
	createAddressesArray,
	createCustomerAddressesArray,
	createBuildingArray,
	spliceCustomerAddress,
	createEmployeeArray
}