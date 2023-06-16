function stringToArrayBuffer(str) {
	let buf = new ArrayBuffer(str.length)
	let view = new Uint8Array(buf)
	for (let i = 0; i < str.length; i++)
		view[i] = str.charCodeAt(i) & 0xFF
	return buf
}

function dateFormat(dateToFormat) {
	const date = new Date(dateToFormat)
	let day = String(date.getDate())
	let month = String(date.getMonth() + 1)
	const year = date.getFullYear()
	
	day = day.length < 2 ? day.padStart(2, '0') : day
	month = month.length < 2 ? month.padStart(2, '0') : month
	
	return `${ day }.${ month }.${ year }`
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

function getDate() {
	return dateFormat(new Date())
}

export {
	stringToArrayBuffer,
	getDate,
	dateFormat,
	formatDate
}