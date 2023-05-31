import * as XLSX from 'xlsx/xlsx.mjs'
import { saveAs } from 'file-saver'

function stringToArrayBuffer(str) {
    let buf = new ArrayBuffer(str.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < str.length; i++)
        view[i] = str.charCodeAt(i) & 0xFF
    return buf
}

function validDate(x) {
    return String(x).padStart(2, '0')}

export default function saveExcelFileForPyramid(meters, getIpAddressTitle) {
    let pyramidMeterArray = []
    let pyramidIndividualArray = []
    let pyramidBusinessArray = []
    let i = 1
    meters.forEach((meter) => {
        let apartment = ''
        let address = meter.customer_address
        let apartmentIndex = address.indexOf('кв.')
        if (address && apartmentIndex !== -1) {
            apartment = address.substring(apartmentIndex + 3, address.length)
            address = address.substr(0, apartmentIndex - 2)
        }
        address = address.replaceAll('.',' ')
        const date = new Date(meter.created)
        const yesterdayDate = new Date(date.setDate(date.getDate() - 1))
        const installDate = `${ validDate(date.getDate()) }.${ validDate(date.getMonth() + 1) }.${ date.getFullYear() }`
        const releaseAndVerificationDate = `${ validDate(yesterdayDate.getDate()) }.${ validDate(yesterdayDate.getMonth() + 1) }.${ yesterdayDate.getFullYear() }`
        let user = ''
        let type = ''
        let password = ''
        switch (meter.type) {
            case 2:
            case 9:
            case 11:
            case 12:
            case 13:
            case 15:
            case 19:
                type = 'Приборы с поддержкой протокола СПОДЭС - Меркурий 204 (СПОДЭС)';
                password = '0107032222222222';
                user = 'Высокий уровень доступа (HLS)';
                break;
            case 5:
            case 20:
            case 21:
            case 22:
            case 26:
                type = 'Приборы с поддержкой протокола СПОДЭС - МИР С-04 (СПОДЭС)';
                password = '00000000';
                user = 'Высокий уровень доступа (HLS)';
                break
            case 6:
                type = 'Приборы с поддержкой протокола СПОДЭС - МИР С-05 (СПОДЭС)';
                password = '00000000';
                user = 'Высокий уровень доступа (HLS)';
                break
            case 7:
                type = 'Приборы с поддержкой протокола СПОДЭС - МИР С-07 (СПОДЭС)';
                password = '00000000';
                user = 'Высокий уровень доступа (HLS)';
                break
            case 16:
                type = 'Приборы с поддержкой протокола СПОДЭС - СЕ207 (СПОДЭС)';
                password = '1234567812345678';
                user = 'Высокий уровень доступа (HLS)';
                break
            case 18:
                type = 'Приборы с поддержкой протокола СПОДЭС - МИР С-05 (СПОДЭС)';
                password = '00000000';
                user = 'Высокий уровень доступа (HLS)';
                break
            case 23:
                type = 'МИРТЕК - МИРТЕК-212-РУ';
                password = '2843068834';
                break
            case 31:
            case 33:
                type = 'МИРТЕК - МИРТЕК-232-РУ';
                password = '2843068834';
                break
            case 25:
                type = 'Приборы с поддержкой протокола СПОДЭС - СЕ303 (СПОДЭС)';
                password = '010703';
                break
            case 27:
                type = 'Приборы с поддержкой протокола СПОДЭС - СЕ208 (СПОДЭС)';
                password = '1234567812345678';
                user = 'Высокий уровень доступа (HLS)';
                break
            case 28:
            case 29:
            case 32:
                type = 'Приборы с поддержкой протокола СПОДЭС - СЕ308 (СПОДЭС)';
                password = '1234567812345678';
                user = 'Высокий уровень доступа (HLS)';
                break
            case 30:
                type = 'Приборы с поддержкой протокола СПОДЭС - РТМ-01D(B) (СПОДЭС)';
                password = '0107032222222222';
                user = 'Высокий уровень доступа (HLS)';
                break
            default :
                type = 'Инкотекс - Меркурий 234';
                password = '010703';
                user = 'На запись';
        }

        meter.customer_type === 'ФЛ'
            ? pyramidIndividualArray.push([meter.customer, meter.customer.email, meter.customer_phone, meter.personal_account])
            : pyramidBusinessArray.push([meter.customer, meter.customer_address, meter.customer.email, meter.customer_phone, meter.personal_account])

        pyramidMeterArray.push([
            i,
            'Магнитогорский ЭУ',
            'Горэлектросеть',
            'ПС 99 35 кВ',
            '35 кВ',
            '',
            '',
            '',
            '',
            '10 кВ',
            'СШ-2',
            'яч. 26',
            'Ячейка присоединения',
            'КЛ-10кВ основная',
            '',
            '',
            '',
            '',
            '',
            'РТП-1 135 м-н',
            'СШ-1',
            'яч. T-1',
            'Ячейка ввода силового трансформатора',
            'СШ-1',
            'Яч.5',
            'Ячейка присоединения',
            'Линия 1',
            address,
            apartment,
            type,
            meter.serial_number,
            releaseAndVerificationDate,
            installDate,
            releaseAndVerificationDate,
            [16, 25, 27, 28, 29, 5, 6, 7, 18, 20, 21, 22, 23, 30].includes(meter.type) ? '' : '1',
            '5',
            meter.kftt,
            '1',
            '',
            '',
            '',
            '',
            '',
            '',
            meter.contact,
            user,
            password,
            `${ getIpAddressTitle(meter.ip_address) }:${ meter.port }`,
            '',
            meter.personal_account,
            '',
            'Двухзонный тариф'
        ])
        i++
    })

    pyramidIndividualArray = pyramidIndividualArray.map((data, index) => {
        let individualFullNameArray = data[0].split(' ')

        if (individualFullNameArray.length > 3) {
            individualFullNameArray = individualFullNameArray.filter(el => { if (el) return el })
        }

        while (individualFullNameArray.length < 3)
            individualFullNameArray.push('')

        data.shift()
        return [index + 1, ...individualFullNameArray, ...data]
    })
    pyramidBusinessArray = pyramidBusinessArray.map((data, index) => [index + 1, ...data])

    let workBook = XLSX.utils.book_new()
    let tableMeters = []
    let tableIndividuals = []
    let tableBusinesses = []
    let tableUSPD = []
    let tableTT = []
    let tableTH = []

    //Заголовки таблицы счетчиков
    tableMeters.push(['№ п/п', 'ПЭС', 'РЭС', //0-2
        'ПС', '', '', '', '', '', '', '', '', '', '',//3-13
        'РП', '', '', '', '',//14-18
        'ТП', '', '', '', '', '', '', '',//19-26
        'Адрес', '',//27-28
        'ПУ', '', '', '', '', '', '',//29-35
        'Трансформаторы', '', '', '', '', '', '', '',//36-43
        'Связь с ПУ', '', '', '',//44-47
        'УСПД', 'Абонент', 'Область видимости', 'Тариф'//48-51
    ])
    tableMeters.push(['', '', '',//0-2
        '', '',//3-4
        'Высокая сторона', '', '', '',//5-8
        'Низкая сторона', '', '', '', '',//9-13
        '', '', '', '', '',//14-18
        '',//19
        'Высокая сторона', '', '',//20-22
        'Низкая сторона', '', '', '',//23-26
        '', '',//27-28
        '', '', '', '', '', '', '',//29-35
        '', '', '', '', '', '', '', '',//36-43
        '', '', '', '',//44-47
        '', '', '', ''//48-51
    ])
    tableMeters.push(['', '', '',//0-2
        'ПС', 'Уровень напряжения ПС',//3-4
        'Уровень напряжения РУ', 'Секция шин', 'Ячейка', 'Тип ячейки',//5-8
        'Уровень напряжения РУ', 'Секция шин', 'Ячейка', 'Тип ячейки', 'Линия/фидер',//9-13
        'РП', 'Секция шин', 'Ячейка, входящая от ПС', 'Ячейка, отходящая в ТП', 'Линия/фидер',//14-18
        'ТП',//19
        'Секция шин', 'Ячейка', 'Тип ячейки',//20-22
        'Секция шин', 'Ячейка', 'Тип ячейки', 'Линия/фидер',//23-26
        'Адрес ФИАС', 'Квартира',//27-28
        'Тип ПУ', 'Серийный номер', 'Дата выпуска', 'Дата установки', 'Дата последней поверки', 'Класс точности', 'Часовой пояс',//29-35
        'Ктт', 'Ктн', 'ТТ, фаза 1', 'ТТ, фаза 2', 'ТТ, фаза 3', 'ТН, фаза 1', 'ТН, фаза 2', 'ТН, фаза 3',//36-43
        'Связной номер', 'Пользователь', 'Пароль', 'Маршрут опроса',//44-47
        '', '', '', '',//48-51
    ])
    tableMeters = tableMeters.concat(pyramidMeterArray)

    //Заголовки ЮЛ
    tableBusinesses.push(['№ п/п', '', '', 'Связь с абонентом', '', 'Номер лицевого счета'])
    tableBusinesses.push(['', 'Наименование', 'Юридический адрес', 'Эл. почта', 'Телефон', ''])
    tableBusinesses = tableBusinesses.concat(pyramidBusinessArray)

    //Заголовки ФЛ
    tableIndividuals.push(['№ п/п', 'ФИО', '', '', 'Связь с абонентом', '', 'Номер лицевого счета'])
    tableIndividuals.push(['', 'Фамилия', 'Имя', 'Отчество', 'Эл. почта', 'Телефон', ''])
    tableIndividuals = tableIndividuals.concat(pyramidIndividualArray)

    //Заголовки УСПД
    tableUSPD.push(['№ п/п', 'Место установки', 'УСПД', '', '', '', '', '', 'Связь с УСПД', '', '', '',])
    tableUSPD.push(['', '', 'Тип УСПД', 'Серийный номер', 'Дата выпуска', 'Дата установки', 'Дата последней поверки', 'Часовой пояс',
                    'Связной номер', 'Пользователь', 'Пароль', 'Маршрут опроса'])

    tableTT.push(['№ п/п', 'ТТ', '', '', '', '', '', 'Параметры ТТ'])
    tableTT.push(['', 'Тип ТТ', 'Класс точности', 'Серийный номер', 'Дата выпуска', 'Дата установки', 'Дата последней поверки',
        'I ном. перв, А', 'I ном. втор, А'])

    tableTH.push(['№ п/п', 'ТН', '', '', '', '', '', 'Параметры ТН'])
    tableTH.push(['', 'Тип ТН', 'Класс точности', 'Серийный номер', 'Дата выпуска', 'Дата установки', 'Дата последней поверки',
        'U ном. перв, В', 'U ном. втор, В'])

    workBook.SheetNames.push("ТУ");
    workBook.SheetNames.push("ФЛ");
    workBook.SheetNames.push("ЮЛ");
    workBook.SheetNames.push("ТТ");
    workBook.SheetNames.push("ТН");
    workBook.SheetNames.push("УСПД");

    let workSheetMeters = XLSX.utils.aoa_to_sheet(tableMeters)
    workBook.Sheets["ТУ"] = workSheetMeters

    let workSheetIndividual = XLSX.utils.aoa_to_sheet(tableIndividuals)
    workBook.Sheets["ФЛ"] = workSheetIndividual

    let workSheetBusiness = XLSX.utils.aoa_to_sheet(tableBusinesses)
    workBook.Sheets["ЮЛ"] = workSheetBusiness

    let workSheetUSPD = XLSX.utils.aoa_to_sheet(tableUSPD)
    workBook.Sheets["УСПД"] = workSheetUSPD

    let workSheetTT = XLSX.utils.aoa_to_sheet(tableTT)
    workBook.Sheets["ТТ"] = workSheetTT

    let workSheetTH = XLSX.utils.aoa_to_sheet(tableTH)
    workBook.Sheets["ТН"] = workSheetTH

    //Ширина и слияние колонок счетчики
    workSheetMeters['!cols'] = [
        { width: 10 }, { width: 25 }, { width: 25 }, //0-2
        { width: 15 }, { width: 15 }, //3-4
        { width: 25 }, { width: 15 }, { width: 15 }, { width: 15 },//Высокая сторона //5-8
        { width: 25 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 25 }, //Низкая сторона //9-13
        { width: 15 }, { width: 15 }, { width: 25 }, { width: 25 }, { width: 15 }, //РП //14-18
        { width: 15 }, //19
        { width: 15 }, { width: 15 }, { width: 25 }, //Высокая сторона //20-22
        { width: 15 }, { width: 15 }, { width: 25 }, { width: 15 }, //Низкая сторона //23-26
        { width: 40 }, { width: 15 }, //Адрес //27-28
        { width: 20 }, { width: 20 }, { width: 15 }, { width: 15 }, { width: 20 }, { width: 15 }, { width: 15 }, //ПУ
        { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, //Трансформаторы
        { width: 15 }, { width: 15 }, { width: 15 }, { width: 25 }, //Связь с пу
        { width: 15 }, { width: 15 }, { width: 25 }, { width: 15 },
    ]
    workSheetMeters['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 2, c: 0 }},
        { s: { r: 0, c: 1 }, e: { r: 2, c: 1 }},
        { s: { r: 0, c: 2 }, e: { r: 2, c: 2 }},

        { s: { r: 0, c: 3 }, e: { r: 0, c: 13 }}, //ПС
        { s: { r: 0, c: 14 }, e: { r: 1, c: 18 }}, //РП
        { s: { r: 0, c: 19 }, e: { r: 0, c: 26 }}, //ТП
        { s: { r: 0, c: 27 }, e: { r: 1, c: 28 }}, //Адрес
        { s: { r: 0, c: 29 }, e: { r: 1, c: 35 }}, //ПУ
        { s: { r: 0, c: 36 }, e: { r: 1, c: 43 }}, //Трансформаторы
        { s: { r: 0, c: 44 }, e: { r: 1, c: 47 }}, //Связь с ПУ

        { s: { r: 0, c: 48 }, e: { r: 2, c: 48 }},
        { s: { r: 0, c: 49 }, e: { r: 2, c: 49 }},
        { s: { r: 0, c: 50 }, e: { r: 2, c: 50 }},
        { s: { r: 0, c: 51 }, e: { r: 2, c: 51 }},

        { s: { r: 1, c: 3 }, e: { r: 1, c: 4 }},
        { s: { r: 1, c: 5 }, e: { r: 1, c: 8 }}, //Высокая сторона
        { s: { r: 1, c: 9 }, e: { r: 1, c: 13 }}, //Низкая сторона

        { s: { r: 1, c: 20 }, e: { r: 1, c: 22 }}, //Высокая сторона
        { s: { r: 1, c: 23 }, e: { r: 1, c: 26 }}, //Низкая сторона


    ]

    //Ширина и слияние колонок ЮЛ
    workSheetBusiness['!cols'] = [
        { width: 10 }, { width: 35 }, { width: 45 }, { width: 20 }, { width: 15 }, { width: 20 }
    ]
    workSheetBusiness['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 }},
        { s: { r: 0, c: 1 }, e: { r: 0, c: 2 }},
        { s: { r: 0, c: 3 }, e: { r: 0, c: 4 }},
        { s: { r: 0, c: 5 }, e: { r: 1, c: 5 }},
    ]

    //Ширина и слияние колонок ФЛ
    workSheetIndividual['!cols'] = [
        { width: 10 }, { width: 45 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 25 }
    ]
    workSheetIndividual['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 }},
        { s: { r: 0, c: 1 }, e: { r: 0, c: 3 }},
        { s: { r: 0, c: 4 }, e: { r: 0, c: 5 }},
        { s: { r: 0, c: 6 }, e: { r: 1, c: 6 }},
    ]

    workSheetUSPD['!cols'] = [
        { width: 10 }, { width: 15 }, { width: 15 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },
        { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }
    ]
    workSheetUSPD['!merges'] = [
        { s: { r: 0, c: 2 }, e: { r: 0, c: 7 }},
        { s: { r: 0, c: 8 }, e: { r: 0, c: 11 }}
    ]

    workSheetTT['!cols'] = [
        { width: 10 }, { width: 15 }, { width: 15 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },
        { width: 20 }, { width: 20 },
    ]
    workSheetTT['!merges'] = [
        { s: { r: 0, c: 1 }, e: { r: 0, c: 6 }},
        { s: { r: 0, c: 7 }, e: { r: 0, c: 8 }}
    ]

    workSheetTH['!cols'] = [
        { width: 10 }, { width: 15 }, { width: 15 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },
        { width: 20 }, { width: 20 },
    ]
    workSheetTH['!merges'] = [
        { s: { r: 0, c: 1 }, e: { r: 0, c: 6 }},
        { s: { r: 0, c: 7 }, e: { r: 0, c: 8 }}
    ]

    let workBookOut = XLSX.write(workBook, {bookType:'xlsx',  type: 'binary'})
    saveAs(new Blob([stringToArrayBuffer(workBookOut)],{type:"application/octet-stream"}), 'pyramid.xlsx')
}
