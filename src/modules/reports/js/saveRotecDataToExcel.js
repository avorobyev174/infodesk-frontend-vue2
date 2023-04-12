import * as XLSX from 'xlsx/xlsx.mjs'
import { saveAs } from 'file-saver'

function stringToArrayBuffer(str) {
    let buf = new ArrayBuffer(str.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < str.length; i++)
        view[i] = str.charCodeAt(i) & 0xFF
    return buf
}

export default function saveRotecDataToExcelFile(serialNumbers, lastPort, ipAddress) {
    const rotecInfoArray = serialNumbers.map((serialNumber, i) => [`${ serialNumber },${ ipAddress },${ lastPort + i }`])

    let workBook = XLSX.utils.book_new()
    workBook.SheetNames.push("Счетчики РОТЕК");

    let workSheetMeters = XLSX.utils.aoa_to_sheet(rotecInfoArray)
    workBook.Sheets["Счетчики РОТЕК"] = workSheetMeters

    //Ширина и слияние колонок счетчики
    workSheetMeters['!cols'] = [
        { width: 70 },
    ]

    let workBookOut = XLSX.write(workBook, {bookType:'xlsx',  type: 'binary'})
    saveAs(new Blob([stringToArrayBuffer(workBookOut)],{type:"application/octet-stream"}), 'rotec-data.xlsx')
}
