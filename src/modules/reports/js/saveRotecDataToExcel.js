import * as XLSX from 'xlsx/xlsx.mjs'
import { saveAs } from 'file-saver'

function stringToArrayBuffer(str) {
    let buf = new ArrayBuffer(str.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < str.length; i++)
        view[i] = str.charCodeAt(i) & 0xFF
    return buf
}

export default function saveRotecDataToExcelFile(meters, getIpAddressTitle) {
    const rotecInfoArray = meters
        .sort((a, b) => a.port - b.port)
        .map((meter) => [`${ meter.serial_number },${ getIpAddressTitle(meter.ip_address) },${ meter.port }`])

    let workBook = XLSX.utils.book_new()
    workBook.SheetNames.push("Счетчики РОТЕК");

    let workSheetMeters = XLSX.utils.aoa_to_sheet(rotecInfoArray)
    workBook.Sheets["Счетчики РОТЕК"] = workSheetMeters

    workSheetMeters['!cols'] = [ { width: 100 } ]

    let workBookOut = XLSX.utils.sheet_to_csv(workBook.Sheets["Счетчики РОТЕК"], { strip: true })
    saveAs(new Blob([ stringToArrayBuffer(workBookOut) ],{ type: 'application/octet-stream' }), 'rotec-data.csv')
}
