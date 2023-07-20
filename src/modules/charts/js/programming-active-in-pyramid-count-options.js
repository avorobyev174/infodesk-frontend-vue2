export default {
	chart: {
		type: 'pie',
	},
	dataLabels: {
		enabled: false
	},
	fill: {
		type: "solid",
		fillOpacity: 0.7
	},
	legend: {
		position: 'left',
		horizontalAlign: 'center',
		formatter: function(val, opts) {
			return val + " - " + opts.w.globals.series[opts.seriesIndex]
		}
	},
	noData: {
		text: "Загрузка...",
		align: 'top',
		verticalAlign: 'middle',
		offsetX: 0,
		offsetY: 0,
		style: {
			color: "#000000",
			fontSize: '18px',
			fontFamily: "Helvetica"
		}
	}
}