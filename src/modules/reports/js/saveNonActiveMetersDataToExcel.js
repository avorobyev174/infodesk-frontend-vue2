import * as XLSX from 'xlsx/xlsx.mjs'
import { saveAs } from 'file-saver'

function stringToArrayBuffer(str) {
    let buf = new ArrayBuffer(str.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < str.length; i++)
        view[i] = str.charCodeAt(i) & 0xFF
    return buf
}

export default function saveNonActivePyramidMetersToExcelFile(meters) {
    let workBook = XLSX.utils.book_new()
    let tableMeters = []
    let date = new Date()
    let strDate = `${ date.getHours() }-${ date.getMinutes() }-${ date.getDate() }-${ String(date.getMonth() + 1).padStart(2, '0') }-${ date.getFullYear() }`
    //Заголовки таблицы счетчиков
    tableMeters.push(['Серийный номер', 'IP', 'Порт', 'Сим карта', 'Адрес', 'Дата последнего опроса'])

    tableMeters = tableMeters.concat(meters)

    workBook.SheetNames.push("Список не активных");

    let workSheetMeters = XLSX.utils.aoa_to_sheet(tableMeters, { cellDates: true })
    workBook.Sheets["Список не активных"] = workSheetMeters

    //Ширина и слияние колонок счетчики
    workSheetMeters['!cols'] = [
        { width: 25 }, { width: 15 }, { width: 10 }, { width: 20 }, { width: 40 }, { width: 35 }
    ]

    let workBookOut = XLSX.write(workBook, {bookType: 'xlsx',  type: 'binary', dateNF: 'dd.mm.yyyy;@', cellDates: true } )
    XLSX.writeFile(workBook, `non-active-in-pyramid-report-${ strDate }.xlsx`)
    //saveAs(new Blob([stringToArrayBuffer(workBookOut)],{type:"application/octet-stream"}), 'non-active-in-pyramid-report.xlsx')
}
