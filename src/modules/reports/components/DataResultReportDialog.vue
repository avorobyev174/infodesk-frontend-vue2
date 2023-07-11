<template>
    <dialog-with-table-slot
        :max-width="width"
        :height="height"
        :dialog-title="dialogTitle"
        :dialog-additional-title="additionalTitle"
        :count="count"
        :table-headers="headers"
        submit-button-title="Скачать excel файл"
        reject-button-title="Печать"
        @reject="print"
        @submit="saveDataToExcelFile"
        ref="DataResultDialog"
        table-class="result-dialog-table"
    >
        <template v-slot:table-data>
            <tr v-for="row in dialogData">
                <td v-for="value in row"
                    class="text-center text-wrap"
                    :width="`${ 100 / Object.keys(row).length }%`">
                    {{ value }}
                </td>
            </tr>
        </template>
    </dialog-with-table-slot>
</template>

<script>
    import * as XLSX from 'xlsx/xlsx.mjs'
    import DialogWithTableSlot from "../../utils-components/dialog/DialogWithTableSlot"

    export default {
        name: "DataResultReportDialog",
        components: {
	        DialogWithTableSlot
        },
        data: () => ({
	        width: 800,
	        height: 500,
            count: '',
            dialogTitle: '',
            additionalTitle: '',
            dialogData: null,
            headers: [],
        }),

	    inject: [ 'showNotificationError' ],
        methods: {
        	open(report, height, width) {
                const { dialogTitle, additionalTitle, headers, data } = report
                this.dialogTitle = dialogTitle
                this.additionalTitle = additionalTitle
                this.headers = headers
                this.dialogData = data
                if (height) {
	                this.height = height
                }
                if (width) {
	                this.width = width
                }
                this.count = this.dialogData?.length
		        this.$refs.DataResultDialog.dialogOpen()
            },

            print(repairTableHtml, materialTableHtml, title) {
	            const newWindow = window.open("МЭК")
	            const table = document.querySelector('.result-dialog-table .v-data-table__wrapper table')

	            newWindow.document.write("<html>")
	            newWindow.document.write('<style type = "text/css">')
	            newWindow.document.write('table { border-collapse: collapse; width: 100%; }')
	            newWindow.document.write('td, th { border: 1px solid black; text-align: center; border: 1px solid black; padding: 5px }')
	            newWindow.document.write('th { background-color: #F7F7F7; font-weight: bold; word-break: break-word; }')
                if (!repairTableHtml) {
	                newWindow.document.write('h3 { text-align: center; margin: 10px }')
                }
	            newWindow.document.write('</style>')
	            newWindow.document.write('</head>')
	            newWindow.document.write('<body>')
	            if (repairTableHtml) {
		            newWindow.document.write(`<h3 style="text-align: center">${ title }</h3>`)
	            } else {
		            newWindow.document.write(`<h3 style="${ !this.dialogTitle ? 'margin-bottom: 20px' : '' }">${ this.dialogTitle }</h3>`)
		            if (this.additionalTitle) {
			            newWindow.document.write(`<h3 style="margin-bottom: 20px" >${ this.additionalTitle }</h3>`)
		            }
                }

                if (repairTableHtml) {
	                newWindow.document.write(repairTableHtml)
                } else {
	                newWindow.document.write(table.outerHTML)
                }
	            newWindow.document.write('<br>')
                if (materialTableHtml) {
	                newWindow.document.write(materialTableHtml)
                }
	            newWindow.document.write('</body>')
	            newWindow.document.write('</html>')
	            newWindow.document.close()
	            newWindow.print()
                if (!repairTableHtml) {
	                newWindow.close()
                }
            },

	        saveDataToExcelFile() {
                if (!this.headers?.length) {
                	return this.showNotificationError('В отчете отсутсвуют заголовки')
                }
		        if (!this.dialogData) {
			        return this.showNotificationError('В отчете отсутсвуют данные')
		        }
		        if (!this.dialogTitle) {
			        return this.showNotificationError('Отсутсвует название отчета')
		        }

		        const workBook = XLSX.utils.book_new()
		        workBook.SheetNames.push('Отчет')
		        const data = this.dialogData.map((row) => Object.values(row))
                data.unshift(this.headers)
		        const workSheet = XLSX.utils.aoa_to_sheet(data)
		        workBook.Sheets['Отчет' ] = workSheet
		        workSheet[ '!cols' ] = this.headers.map((title) => ({ width: 35 }))
		        XLSX.writeFile(workBook, `${ this.dialogTitle } ${ this.formatDate(new Date()) }.xlsx`)
	        }
        }
    }
</script>

<style scoped>

</style>
