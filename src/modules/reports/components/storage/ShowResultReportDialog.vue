<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="width"
        @keydown.esc="close"
        @click:outside="close"
    >
        <v-card>
            <v-card-title style="display: flex; flex-direction: column">
                <p class="m-auto text-h5 text-break text-center pb-1 d-block">{{ report.dialogTitle }}</p>
                <p class="m-auto text-h5 text-break text-center pb-3 d-block">{{ report.additional }}</p>
            </v-card-title>

            <v-card-text class="pb-0">
                <v-simple-table
                    fixed-header
                    class="mb-0 result-table"
                    :height="height"
                >
                    <template v-slot:default>
                        <thead>
                        <tr>
                            <th v-for="title of report.titles" class="text-center text-wrap">
                                {{ title }}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="row in report.data">
                            <td v-for="value in row"
                                class="text-center text-wrap"
                                :width="`${ 100 / Object.keys(row).length }%`">
                            {{ value }}
                            </td>
                        </tr>
                        </tbody>
                    </template>
                </v-simple-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="dataToExcelFile"
                >
                    Скачать excel файл
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="print"
                >
                    Печать
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import { stringToArrayBuffer, getDate } from "../../../Utils"
    import * as XLSX from 'xlsx/xlsx.mjs'
    import { saveAs } from 'file-saver'
    import { mapState } from "vuex"

    export default {
        name: "ShowResultReportDialog",
        data: () => ({
            dialogModel: false,
            report: {},
	        width: 800,
	        height: 500
        }),
	    inject: ['showNotification', 'showNotificationError', 'checkAuth', 'setBackgroundImage'],
	    computed: {
		    ...mapState(['colorGreen', 'colorRed',]),
	    },
        methods: {
        	open(report, height, width) {
        		this.report = report
                if (height) {
	                this.height = height
                }
                if (width) {
	                this.width = width
                }
		        this.dialogModel = true
            },

            close() {
            	this.dialogModel = false
            },

            print() {
	            const newWindow = window.open("МЭК")
	            const tableHtml = document.querySelector('.result-table .v-data-table__wrapper table')

	            newWindow.document.write("<html>")
	            newWindow.document.write('<style type = "text/css">')
	            newWindow.document.write('table { border: 1px solid black; border-collapse: collapse; width: 100%; }')
	            newWindow.document.write('td, th { text-align: center; border: 1px solid black; padding: 5px }')
	            newWindow.document.write('th { background-color: #F7F7F7; font-weight: bold; word-break: break-word; }')
	            newWindow.document.write('h3 { text-align: center; margin: 10px }')
	            newWindow.document.write('</style>')
	            newWindow.document.write('</head>')
	            newWindow.document.write('<body>')
	            newWindow.document.write(`<h3 style="${ !this.report.additional ? 'margin-bottom: 20px' : '' }">${ this.report.dialogTitle }</h3>`)
                if (this.report.additional) {
	                newWindow.document.write(`<h3 style="margin-bottom: 20px" >${ this.report.additional }</h3>`)
                }
	            newWindow.document.write(tableHtml.outerHTML)
	            newWindow.document.write('</body>')
	            newWindow.document.write('</html>')
	            newWindow.document.close()
	            newWindow.print()
	            newWindow.close()
            },

	        dataToExcelFile() {
                if (!this.report && !this.report.titles && !this.report.titles.length) {
                	return this.showNotification('В отчете отсутсвуют заголовки', this.colorRed)
                }

		        if (!this.report.data) {
			        return this.showNotification('В отчете отсутсвуют данные', this.colorRed)
		        }

		        if (!this.report.dialogTitle) {
			        return this.showNotification('Отсутсвует название отчета', this.colorRed)
		        }

		        const workBook = XLSX.utils.book_new()
		        workBook.SheetNames.push('Отчет')
		        const data = this.report.data.map((row) => Object.values(row))
                data.unshift(this.report.titles)

		        const workSheet = XLSX.utils.aoa_to_sheet(data)
		        workBook.Sheets['Отчет' ] = workSheet
		        workSheet[ '!cols' ] =this.report.titles.map((title) => ({ width: 35 }))

		        const workBookOut = XLSX.write(workBook, { bookType:'xlsx',  type: 'binary' })
		        saveAs(new Blob([ stringToArrayBuffer(workBookOut) ],{ type:"application/octet-stream" }),
                                                                      `${ this.report.dialogTitle } ${ getDate() }.xlsx`)
	        }

        }
    }
</script>

<style scoped>

</style>
