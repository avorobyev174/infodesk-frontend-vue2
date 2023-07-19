import * as XLSX from 'xlsx/xlsx.mjs'

function stringToArrayBuffer(str) {
	let buf = new ArrayBuffer(str.length)
	let view = new Uint8Array(buf)
	for (let i = 0; i < str.length; i++)
		view[i] = str.charCodeAt(i) & 0xFF
	return buf
}

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

const isJsonValid = (str) => {
	try {
		JSON.parse(str)
	} catch (e) {
		return false
	}
	return true
}

export {
	stringToArrayBuffer,
	isJsonValid,
	formatDate,
	saveDataToExcelFile
}