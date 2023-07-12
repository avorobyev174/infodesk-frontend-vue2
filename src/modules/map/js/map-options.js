const mapOptions = {
	disableDefaultUi: true,
	scaleControl: true,
	streetViewControl: false,
	rotateControl: false,
	fullscreenControl: false,
	clickableIcons: true,
	scrollwheel: true,
	styles: [
		{
			featureType: 'poi.business',
			stylers: [{ visibility: 'off' }],
		},
		{
			featureType: "poi.government",
			stylers: [
				{ "visibility": "off" }
			]
		},
		{
			featureType: "poi.attraction",
			stylers: [
				{ "visibility": "off" }
			]
		},
		{
			featureType: "poi.medical",
			stylers: [
				{ "visibility": "off" }
			]
		},
		{
			featureType: "poi.place_of_worship",
			stylers: [
				{ "visibility": "off" }
			]
		},
		{
			featureType: "poi.park",
			stylers: [
				{ "visibility": "off" }
			]
		},
		{
			featureType: "poi.school",
			stylers: [
				{ "visibility": "off" }
			]
		},
		{
			featureType: "poi.sports_complex",
			stylers: [
				{ "visibility": "off" }
			]
		},
		{
			featureType: 'transit',
			elementType: 'labels.icon',
			stylers: [{ visibility: 'off' }],
		},
	]
}

const mapCenter = { lat: 53.41295, lng: 58.99823 }

export {
	mapOptions,
	mapCenter
}