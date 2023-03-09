import * as XLSX from 'xlsx/xlsx.mjs'
import { saveAs } from 'file-saver'

function stringToArrayBuffer(str) {
    let buf = new ArrayBuffer(str.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < str.length; i++)
        view[i] = str.charCodeAt(i) & 0xFF
    return buf
}

export default function saveMetersDataBySerialNumberToExcelFile(data) {
    let workBook = XLSX.utils.book_new()
    let tableData = []

    console.log(data)
    //Заголовки таблицы счетчиков
    tableData.push(['Серийный номер', 'Адрес', 'IP', 'Сим карта', 'Порт'])
    tableData = tableData.concat(data)

    workBook.SheetNames.push("Данные");

    let workSheet = XLSX.utils.aoa_to_sheet(tableData)
    workBook.Sheets["Данные"] = workSheet

    //Ширина и слияние колонок счетчики
    workSheet['!cols'] = [
        { width: 20 }, { width: 50 }, { width: 15 }, { width: 20 }, { width: 10 }
    ]

    let workBookOut = XLSX.write(workBook, {bookType:'xlsx',  type: 'binary'})
    saveAs(new Blob([stringToArrayBuffer(workBookOut)],{type:"application/octet-stream"}), 'pyramid-meter-serial-number-data.xlsx')
}
