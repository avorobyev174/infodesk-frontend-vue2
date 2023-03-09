import * as XLSX from 'xlsx/xlsx.mjs'
import { saveAs } from 'file-saver'

function stringToArrayBuffer(str) {
    let buf = new ArrayBuffer(str.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < str.length; i++)
        view[i] = str.charCodeAt(i) & 0xFF
    return buf
}

export default function saveNotLoadedInPyramidReportToExcelFile(data) {
    let workBook = XLSX.utils.book_new()
    let tableData = []

    //console.log(data)
    //Заголовки таблицы счетчиков
    tableData.push(['Серийный номер', 'Тип', 'Принадлежность', 'Сим карта', 'Дата регистрации'])
    tableData = tableData.concat(data)

    workBook.SheetNames.push("Не загруженные");

    let workSheet = XLSX.utils.aoa_to_sheet(tableData)
    workBook.Sheets["Не загруженные"] = workSheet

    //Ширина и слияние колонок счетчики
    workSheet['!cols'] = [
        { width: 20 }, { width: 35 }, { width: 20 }, { width: 15 }, { width: 20 }
    ]

    let workBookOut = XLSX.write(workBook, {bookType:'xlsx',  type: 'binary'})
    saveAs(new Blob([stringToArrayBuffer(workBookOut)],{type:"application/octet-stream"}), 'pyramid-not-loaded.xlsx')
}
