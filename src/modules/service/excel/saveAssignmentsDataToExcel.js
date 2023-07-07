import * as XLSX from 'xlsx/xlsx.mjs'
import { formatDate } from "../../Utils.js"

export default function saveAssignmentsByOwnerToExcelFile(
    assignments,
    currentAccountId,
    getAssignmentStatusTitle,
    getAssignmentEventCloseReasonTitle,
    getAssignmentEventTypeTitle,
    getAccountFullName
) {
    const savedAssignments = assignments.map((
        {
            meter_serial_number,
            customer_address,
            meter_phone,
            customer_contacts,
            last_data_date,
            lastEvent
        }) => {
        
        const { created, description, type, owner_id } = lastEvent
        const lastEventString =
            `${ owner_id ? getAccountFullName(owner_id) : '' } \n${ formatDate(created, true) } \n${ description ? description : ''  }`
        
        return [
            meter_serial_number,
            customer_address.slice(16),
            meter_phone,
            customer_contacts,
            formatDate(last_data_date),
            lastEventString,
            '',
        ]
    })
   
    savedAssignments.unshift([ 'Серийный номер', 'Адрес', 'Сим карта', 'Контактные данные', 'Дата последнего опроса', 'Последнее событие', 'Результат обследования' ])
    const sheetName = `Список поручений ${ getAccountFullName(currentAccountId) }`
    const workBook = XLSX.utils.book_new()
    workBook.SheetNames.push(sheetName)
    const workSheet = XLSX.utils.aoa_to_sheet(savedAssignments)
    workBook.Sheets[sheetName] = workSheet
    workSheet['!cols'] = [ { width: 25 }, { width: 25 }, { width: 15 }, { width: 30 }, { width: 15 }, { width: 70 }, { width: 25 } ]
    XLSX.writeFile(workBook, `Список поручений в работе ${ formatDate((new Date())) }.xlsx`)
}
