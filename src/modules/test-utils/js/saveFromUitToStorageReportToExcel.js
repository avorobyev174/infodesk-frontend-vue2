import * as XLSX from 'xlsx/xlsx.mjs'
import { saveAs } from 'file-saver'

function stringToArrayBuffer(str) {
    let buf = new ArrayBuffer(str.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < str.length; i++)
        view[i] = str.charCodeAt(i) & 0xFF
    return buf
}

export default function saveFromUitToStorageReportToExcelFile(data) {
    let workBook = XLSX.utils.book_new()
    const tableData = []
    const groupMeterMap = new Map()
    data.forEach(d => {
        groupMeterMap.get(d.typeTitle)
            ? groupMeterMap.set(d.typeTitle, groupMeterMap.get(d.typeTitle) + 1)
            : groupMeterMap.set(d.typeTitle, 1)
    })
    console.log(groupMeterMap)
    
    //Заголовки 1 таблицы
    tableData.push(['Тип счетчика', 'Количество на складе в данный момент']);
    
    [ ...groupMeterMap.entries() ].forEach(e => {
        tableData.push([ e[0], e[1],  ])
    })
    
    tableData.push(['Всего', [ ...groupMeterMap.values() ].reduce((prev, curr) => prev + curr, 0)]);
    tableData.push([]);
    tableData.push([]);
    
    //Заголовки 2 таблицы
    const typeHeaders = [];
    [ ...groupMeterMap.keys() ].forEach(k => typeHeaders.push(k))
    
    const headers = [ ...typeHeaders ]
    headers.unshift('Дата')
    headers.push('Всего')
    
    let dateMeterMap = new Map()
    data.forEach(d => {
        if (dateMeterMap.get(d.date)) {
            const typeMap = dateMeterMap.get(d.date)
            typeMap.get(d.typeTitle)
                ? typeMap.set(d.typeTitle, typeMap.get(d.typeTitle) + 1)
                : typeMap.set(d.typeTitle, 1)
        } else dateMeterMap.set(d.date, new Map([[ d.typeTitle, 1]]))
    })
    
    //сортировка
    let dateMapEntries = [ ...dateMeterMap.entries() ].sort((a, b) => sortDates(a, b))
    
    tableData.push(headers);
    
    dateMapEntries.forEach(e => {
        const dayReturnByTypeArr = [];
    
        typeHeaders.forEach(h => {
            const typeMap = e[1]
            
            if (typeMap.has(h)) dayReturnByTypeArr.push(typeMap.get(h))
            else dayReturnByTypeArr.push('')
        })
       
        tableData.push([ e[0], ...dayReturnByTypeArr, dayReturnByTypeArr.reduce((prev, curr) => {
            return typeof curr === "number"
                ? prev + curr
                : prev
        }, 0)])
    })

    workBook.SheetNames.push("Отчет по движению уит - склад");

    let workSheet = XLSX.utils.aoa_to_sheet(tableData)
    workBook.Sheets["Отчет по движению уит - склад"] = workSheet

    //Ширина и слияние колонок счетчики
    workSheet['!cols'] = [
        { width: 20 }, { width: 40 }
    ]
    
    for (let i = 0; i < typeHeaders.length - 1; i++)
        workSheet['!cols'].push({ width: 15 })
    
    workSheet['!cols'].push({ width: 15 })
    

    let workBookOut = XLSX.write(workBook, {bookType:'xlsx',  type: 'binary'})
    saveAs(new Blob([stringToArrayBuffer(workBookOut)],{type:"application/octet-stream"}), 'uit-from-storage-report.xlsx')
}

function sortDates(a, b) {
    const aDateArr =  a[0].split('.').map(v => parseInt(v))
    const bDateArr =  b[0].split('.').map(v => parseInt(v))
    const aDate = new Date(aDateArr[2], aDateArr[1] - 1, aDateArr[0]);
    const bDate = new Date(bDateArr[2], bDateArr[1] - 1, bDateArr[0]);
    //console.log(aDate, bDate)
    //console.log(bDate - aDate)
    return bDate - aDate
}