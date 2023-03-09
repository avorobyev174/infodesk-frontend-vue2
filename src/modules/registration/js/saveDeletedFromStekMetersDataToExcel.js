import * as XLSX from 'xlsx/xlsx.mjs'
import { saveAs } from 'file-saver'

function stringToArrayBuffer(str) {
    let buf = new ArrayBuffer(str.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < str.length; i++)
        view[i] = str.charCodeAt(i) & 0xFF
    return buf
}

export default function saveDeletedMeterDataFromStekToExcelFile(meters, getMeterTypeTitle) {
    console.log(meters)
    let deletedMetersArray = []

    meters.forEach((meter) => {
        let address = meter.oldAddress

        deletedMetersArray.push([
            getMeterTypeTitle(meter.type),
            meter.serial_number,
            address,
        ])
    })

    let workBook = XLSX.utils.book_new()
    let tableMeters = []

    //Заголовки таблицы счетчиков
    tableMeters.push(['Тип', 'Серийный номер', 'Адрес'])

    tableMeters = tableMeters.concat(deletedMetersArray)

    workBook.SheetNames.push("Список счетчиков для удаления")

    let workSheetMeters = XLSX.utils.aoa_to_sheet(tableMeters)
    workBook.Sheets["Список счетчиков для удаления"] = workSheetMeters

    //Ширина и слияние колонок счетчики
    workSheetMeters['!cols'] = [
        { width: 25 }, { width: 15 }, { width: 35 },
    ]

    let workBookOut = XLSX.write(workBook, {bookType:'xlsx',  type: 'binary'})
    saveAs(new Blob([stringToArrayBuffer(workBookOut)],{type:"application/octet-stream"}), 'deleteToPyramid.xlsx')
}
