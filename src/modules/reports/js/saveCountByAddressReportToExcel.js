import * as XLSX from 'xlsx/xlsx.mjs'
import { saveAs } from 'file-saver'

function stringToArrayBuffer(str) {
    let buf = new ArrayBuffer(str.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < str.length; i++)
        view[i] = str.charCodeAt(i) & 0xFF
    return buf
}

export default function dataToExcelFile(data) {
    let workBook = XLSX.utils.book_new()
    let tableData = []

    //console.log(data)
    //Заголовки таблицы счетчиков
    tableData.push(['п/п', 'Принадлежность', 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'])
    tableData = tableData.concat(data)

    workBook.SheetNames.push("Принадлежность");

    let workSheet = XLSX.utils.aoa_to_sheet(tableData)
    workBook.Sheets["Принадлежность"] = workSheet

    //Ширина и слияние колонок счетчики
    workSheet['!cols'] = [
        { width: 10 }, { width: 40 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
    ]

    let workBookOut = XLSX.write(workBook, {bookType:'xlsx',  type: 'binary'})
    saveAs(new Blob([stringToArrayBuffer(workBookOut)],{type:"application/octet-stream"}), 'count-group-by-address-report.xlsx')
}
