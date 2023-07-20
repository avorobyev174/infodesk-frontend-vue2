export default {
	chart: {
		locales: [{
			name: 'en',
			options: {
				months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
				shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Май', 'Июнь', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
				shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
				toolbar: {
					download: 'Download SVG'
				}
			}
		}],
		type: 'area',
		height: 350,
		foreColor: "#000000",
		stacked: true,
		dropShadow: {
			enabled: true,
			enabledSeries: [0],
			top: -2,
			left: 2,
			blur: 5,
			opacity: 0.06
		},
		toolbar: {
			show: false
		},
		zoom: {
			enabled: false,
		}
	},
	colors: ['#005bac', '#0090FF'],
	stroke: {
		curve: "smooth",
		width: 3
	},
	dataLabels: {
		enabled: false
	},
	markers: {
		size: 0,
		strokeColor: "#fff",
		strokeWidth: 3,
		strokeOpacity: 1,
		fillOpacity: 1,
		hover: {
			size: 6
		}
	},
	legend: {
		position: 'top',
		horizontalAlign: 'center'
	},
	fill: {
		type: "solid",
		fillOpacity: 0.7
	},
	yaxis: {
		labels: {
			offsetX: 14,
			offsetY: -5
		},
		tooltip: {
			enabled: true
		}
	},
	xaxis: {
		type: "datetime",
		axisBorder: {
			show: false
		},
		axisTicks: {
			show: false
		},
		tooltip: {
			enabled: false
		}
	},
	tooltip: {
		x: {
			// format: "d MMM yyyy",
			formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
				const date = new Date(value)
				return date.toLocaleDateString()
			}
		},
		
	},
	grid: {
		padding: {
			left: -5,
			right: 5
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