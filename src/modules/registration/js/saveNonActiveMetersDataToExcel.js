import * as XLSX from 'xlsx/xlsx.mjs'
import { saveAs } from 'file-saver'

function stringToArrayBuffer(str) {
    let buf = new ArrayBuffer(str.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < str.length; i++)
        view[i] = str.charCodeAt(i) & 0xFF
    return buf
}

export default function saveNonActivePyramidMetersToExcelFile(meters, getIpAddressTitle) {
    console.log(meters)
    let nonActiveMetersArray = []

    meters.forEach((meter) => {
        let address = meter.customer_address

        nonActiveMetersArray.push([
            meter.serial_number,
            getIpAddressTitle(meter.ip_address),
            meter.port,
            meter.phone,
            address,
        ])
    })

    let workBook = XLSX.utils.book_new()
    let tableMeters = []

    //Заголовки таблицы счетчиков
    tableMeters.push(['Серийный номер', 'IP', 'Порт', 'Сим карта', 'Адрес'])

    tableMeters = tableMeters.concat(nonActiveMetersArray)

    workBook.SheetNames.push("Список не активных");

    let workSheetMeters = XLSX.utils.aoa_to_sheet(tableMeters)
    workBook.Sheets["Список не активных"] = workSheetMeters

    //Ширина и слияние колонок счетчики
    workSheetMeters['!cols'] = [
        { width: 25 }, { width: 15 }, { width: 10 }, { width: 20 }, { width: 35 },
    ]

    let workBookOut = XLSX.write(workBook, {bookType:'xlsx',  type: 'binary'})
    saveAs(new Blob([stringToArrayBuffer(workBookOut)],{type:"application/octet-stream"}), 'nonActivePyramid.xlsx')
}
