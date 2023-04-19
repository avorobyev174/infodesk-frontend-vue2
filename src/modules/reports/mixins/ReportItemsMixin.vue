<template>    
</template>
<script>
	import {mapGetters, mapState} from "vuex";

	export default {
        name: 'ReportItemsMixin',
		data: () => ({
			role: ''
		}),
	    mounted() {
		    if (this.roles && this.roles.report_module) {
			    this.role = this.roles.report_module
		    }
	    },
		computed: {
			...mapGetters({
				roles: 'getRoles',
			}),
		},
        data: () => ({
	        alphaReport: {
		        name: 'Последний опрос',
		        download: true,
		        description: 'Последний опрос комплекса Альфа Центр',
		        func: 'getAlphaReport',
		        loading: false,
		        show: false,
Lj	        },
	        pyramidLoadedByCustomerAddressReport: {
		        name: 'Выполнение плана установки по месяцам (дома)',
		        download: true,
		        description: 'Количество загруженных в пирамиду счетчиков сгруппированных по адресам входящих в план',
		        func: 'getPyramidLoadedByCustomerAddressReport',
		        loading: false,
		        show: false
	        },
	        notInPyramidReport: {
		        name: 'Счетчики не загруженные в пирамиду',
		        download: true,
		        description: `Отчет содержит информацию по не загруженным в пирамиду счетчикам:`,
		        columns: `- серийный номер\n- тип\n- принадлежность\n- номер сим карты\n- дата регистрации в модуле "регистрация счетчиков"\n- признак наличия счетчика в данный момент на складе`,
		        func: 'getNotInPyramidReport',
		        loading: false,
		        show: false,
	        },
	        pyramidNonActiveMeters: {
		        name:  'Не активные счетчики',
		        download: true,
		        description: 'Отчет содержит информацию по счетчикам которые не передают данные за определенный\nпериод времени:',
		        columns: `- серийный номер\n- ip\n- порт\n- номер сим карты\n- адрес`,
		        params: `Параметры:\n   0 - счетчики вообще не имеющие данных\n   n - количество дней без передачи данных`,
		        func: 'reportDialogOpen',
		        loading: false,
		        show: false,
	        },
	        planProgressByAddress: {
		        name:  'Выполнение плана по месяцам (принадлежность)',
		        download: true,
		        description: 'Количество созданных / загруженных в пирамиду счетчиков сгруппированных по принадлежности',
		        func: 'reportCountByAddressDialogOpen',
		        loading: false,
		        show: false,
	        },
	        meterFromRepairToStorageCountReport: {
		        name: 'Текущее количество счетчиков на складе после программирования',
		        download: true,
		        description: 'Текущее количество счетчиков на складе принятых после программирования УИТ',
		        func: 'getMeterFromRepairToStorageCountReport',
		        loading: false,
		        show: false,
	        },
	        rotecReport: {
		        name: 'Информация по счетчикам Ротек',
		        download: true,
		        description: 'Список счетчиков Ротек из модуля Склад и дополнительная информация в формате csv',
		        func: 'getRotecReport',
		        loading: false,
		        show: false,
	        },
	        storageLocationReport: {
                id: 1,
                name: 'Местонахождение приборов учета',
                download: false,
                description: 'Текущее количество счетчиков сгруппированных по местонахождению',
                func: 'showLocationStorageReport',
                loading: false,
                show: false,
                open: true,
            },
	        storageOwnerReport: {
		        id: 2,
		        name: 'Владелец приборов учета',
		        download: false,
		        description: 'Текущее количество счетчиков сгруппированных по сотруднику',
		        func: 'showOwnerStorageReport',
		        loading: false,
		        show: false,
		        open: true,
	        },
	        storageMeterReport: {
		        id: 3,
		        name: 'Движение выбранного прибора учета',
		        download: false,
		        description: 'Список всех логов текущего счетчика',
		        func: 'getStorageReport',
		        loading: false,
		        show: false,
		        open: true,
	        },
	        storageLogsReport: {
		        id: 4,
		        name: 'Информация за период',
		        download: false,
		        description: 'Информация по всему комплексу за выбранный период',
		        func: 'getStorageReport',
		        loading: false,
		        show: false,
		        open: true,
	        },
	        storageInOutByLocationReport: {
		        id: 5,
		        name: 'Движение приборов учета за период по местонахождению (общее количество)',
		        download: false,
		        description: 'Информация по количеству полученных и отданных приборов учета за выбранный период по местонахождению',
		        func: 'getStorageReport',
		        loading: false,
		        show: false,
		        open: true,
	        },
	        storageInOutByEmployeeReport: {
		        id: 6,
		        name: 'Движение приборов учета за период по сотруднику (общее количество)',
		        download: false,
		        description: 'Информация по количеству полученных и отданных приборов учета за выбранный период по сотруднику',
		        func: 'getStorageReport',
		        loading: false,
		        show: false,
		        open: true,
	        },
	        storageLogsByLocationReport: {
		        id: 7,
		        name: 'Движение приборов учета за период по местонахождению',
		        download: false,
		        description: 'Информация по логам полученных и отданных приборов учета за выбранный период по местонахождению',
		        func: 'getStorageReport',
		        loading: false,
		        show: false,
		        open: true,
	        },
	        storageLogsByEmployeeReport: {
		        id: 8,
		        name: 'Движение приборов учета за период по сотруднику',
		        download: false,
		        description: 'Информация по логам полученных и отданных приборов учета за выбранный период по сотруднику',
		        func: 'getStorageReport',
		        loading: false,
		        show: false,
		        open: true,
	        },
        }),
        methods: {
            getReportItems() {
            	if (this.role === 'admin') {
            		return [
			            {
				            name: 'Альфа Центр',
				            children: [ this.alphaReport ],
			            },
			            {
				            name: 'Пирамида',
				            children: [
				            	this.pyramidLoadedByCustomerAddressReport,
				            	this.notInPyramidReport,
				            	this.pyramidNonActiveMeters,
				            	this.planProgressByAddress,
                            ],
			            },
			            {
				            name: 'Программирование',
				            children: [
					            this.meterFromRepairToStorageCountReport,
					            this.rotecReport,
				            ],
			            },
			            {
				            name: 'Склад',
				            children: [
					            this.storageLocationReport,
					            this.storageOwnerReport,
					            this.storageMeterReport,
					            this.storageLogsReport,
					            this.storageInOutByLocationReport,
					            this.storageInOutByEmployeeReport,
					            this.storageLogsByLocationReport,
					            this.storageLogsByEmployeeReport,
				            ],
			            },
                    ]
                }
	            if (this.role === 'keeper') {
		            return [
			            {
				            name: 'Склад',
				            children: [
					            this.storageLocationReport,
					            this.storageOwnerReport,
					            this.storageMeterReport,
					            this.storageLogsReport,
					            this.storageInOutByLocationReport,
					            this.storageInOutByEmployeeReport,
					            this.storageLogsByLocationReport,
					            this.storageLogsByEmployeeReport,
				            ],
			            },
		            ]
	            }
	            if (this.role === 'repairer') {
		            return [
			            {
				            name: 'Склад',
				            children: [

				            ],
			            },
		            ]
	            }

	            return []
            }
        }
    }
</script>