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

    //console.log(data)
    //Заголовки таблицы счетчиков
    tableData.push(['п/п', 'Адрес МКД', 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь',	'октябрь', 'ноябрь', 'декабрь'])
    tableData.push(['', '', 'интеграция', 'интеграция', 'интеграция', 'интеграция', 'интеграция', 'интеграция', 'интеграция', 'интеграция', 'интеграция', 'интеграция', 'интеграция', 'интеграция',])
    tableData = tableData.concat(data)

    workBook.SheetNames.push("Интеграция");

    let workSheet = XLSX.utils.aoa_to_sheet(tableData)
    workBook.Sheets["Интеграция"] = workSheet

    //Ширина и слияние колонок счетчики
    workSheet['!cols'] = [
        { width: 10 }, { width: 40 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
    ]
    workSheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 }},
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 }},
    ]

    let workBookOut = XLSX.write(workBook, {bookType:'xlsx',  type: 'binary'})
    saveAs(new Blob([stringToArrayBuffer(workBookOut)],{type:"application/octet-stream"}), 'pyramid-loaded-group-by-address.xlsx')
}
