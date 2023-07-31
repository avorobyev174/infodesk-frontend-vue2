export default {
	chart: {
		type: 'bar',
		height: 950,
		stacked: true,
		toolbar: {
			show: false
		}
	},
	plotOptions: {
		bar: {
			horizontal: true,
			dataLabels: {
				total: {
					enabled: true,
					offsetX: 0,
					style: {
						fontSize: '13px',
						fontWeight: 900
					}
				}
			}
		},
	},
	stroke: {
		width: 1,
		colors: ['#fff']
	},
	dataLabels: {
		enabled: true,
	},
	tooltip: {
		y: {
			formatter: function (val) {
				return val + " шт."
			}
		}
	},
	xaxis: {
		categories: []
	},
	fill: {
		opacity: 1
	},
	legend: {
		position: 'top',
		horizontalAlign: 'left',
		offsetX: 40
	},
	noData: {
		text: "Загрузка...",
		align: 'center',
		verticalAlign: 'top',
		offsetX: 0,
		offsetY: 0,
		style: {
			color: "#000000",
			fontSize: '18px',
			fontFamily: "Helvetica"
		}
	},
}