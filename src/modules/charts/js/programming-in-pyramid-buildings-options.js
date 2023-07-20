export default {
	chart: {
		type: 'bar',
		toolbar: {
			show: false
		},
	},
	plotOptions: {
		bar: {
			horizontal: true,
		}
	},
	dataLabels: {
		enabled: false,
	},
	yaxis: {
		labels: {
			style: {
				fontSize: '10'
			},
		},
	},
	xaxis: {
		labels: {
			style: {
				fontSize: '10'
			}
		},
	},
	legend: {
		show: false
	},
	tooltip: {
		y: {
			title: {
				formatter: (seriesName) => 'Количество счетчиков:',
			},
		},
	},
	noData: {
		text: "Загрузка...",
		align: 'top',
		verticalAlign: 'top',
		offsetX: 0,
		offsetY: 0,
		style: {
			color: "#000000",
			fontSize: '18px',
			fontFamily: "Helvetica"
		}
	},
	colors: ['#229efd'],
}