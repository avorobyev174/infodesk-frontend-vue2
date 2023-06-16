import * as XLSX from 'xlsx/xlsx.mjs'
import { saveAs } from 'file-saver'
import { stringToArrayBuffer } from "../../Utils"

export default function saveDeletedMeterDataFromStekToExcelFile(meters, getMeterTypeTitle) {
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
    tableMeters.push([ 'Тип', 'Серийный номер', 'Адрес' ])

    tableMeters = tableMeters.concat(deletedMetersArray)

    workBook.SheetNames.push("Список счетчиков для удаления")

    let workSheetMeters = XLSX.utils.aoa_to_sheet(tableMeters)
    workBook.Sheets[ 'Список счетчиков для удаления' ] = workSheetMeters

    //Ширина и слияние колонок счетчики
    workSheetMeters['!cols'] = [
        { width: 25 }, { width: 15 }, { width: 35 },
    ]
    
    const workBookOut = XLSX.write(workBook, { bookType: 'xlsx',  type: 'binary' })
    saveAs(new Blob(
        [ stringToArrayBuffer(workBookOut) ],
        { type: 'application/octet-stream' }),
        'deleteToPyramid.xlsx'
    )
}
