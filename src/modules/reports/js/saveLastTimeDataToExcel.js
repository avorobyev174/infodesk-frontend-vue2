import * as XLSX from 'xlsx/xlsx.mjs'
import { saveAs } from 'file-saver'

function stringToArrayBuffer(str) {
    let buf = new ArrayBuffer(str.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < str.length; i++)
        view[i] = str.charCodeAt(i) & 0xFF
    return buf
}

export default function saveLastTimeDataToExcelFile(data) {
    let workBook = XLSX.utils.book_new()
    let tableData = []

    let dataArray = []

    dataArray = data.map(row => {
        let date = new Date(row.DAT)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        
        delete row.SYB_RNK
        delete row.UNITID
        delete row.DEVID
        
        row.DAT = `${ day }.${ month }.${ year }`
        return Object.values(row)
    })

    //console.log(dataArray)
    //Заголовки таблицы счетчиков
    tableData.push(['Серийный номер', 'Тип', 'Объект', 'Фидер', 'Дата'])
    tableData = tableData.concat(dataArray)

    workBook.SheetNames.push("Данные");

    let workSheet = XLSX.utils.aoa_to_sheet(tableData)
    workBook.Sheets["Данные"] = workSheet

    //Ширина и слияние колонок счетчики
    workSheet['!cols'] = [
        { width: 20 }, { width: 15 }, { width: 20 }, { width: 30 }, { width: 30 }
    ]

    let workBookOut = XLSX.write(workBook, {bookType:'xlsx',  type: 'binary'})
    saveAs(new Blob([stringToArrayBuffer(workBookOut)],{type:"application/octet-stream"}), 'alpha-centr-last-time-data.xlsx')
}
