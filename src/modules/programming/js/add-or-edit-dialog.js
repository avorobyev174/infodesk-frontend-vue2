const editedItem = {
	serial_number: '',
	type: 1,
	phase: 1,
	icc: '',
	address: 'МЭК',
	port: null,
	contact: null,
	ip_address: 1,
	parent_id: null,
	gateway: ''
}
const defaultItem = {
	serialNumber: '',
		type: 1,
		phase: 1,
		icc: '',
		address: 'МЭК',
		port: null,
		contact: null,
		ip_address: 1,
		parent_id: null,
		gateway: ''
}
const serialNumberRules = [
	v => !!v || 'Обязательно к заполнению',
	v => v && String(v).length >= 8 || 'Должно быть не меньше 8 символов',
]

const iccRules = [
	v => !!v || 'Обязательно к заполнению',
	v => v && parseFloat(v) % 1 === 0 || 'Должно быть целым числом',
	v => v && String(v).length <= 20 || 'Должно быть меньше 20 символов'
]

const gateWayRules = [
	v => !!v || 'Обязательно к заполнению',
	v => v && parseFloat(v) % 1 === 0 || 'Должно быть целым числом',
	v => v && String(v).length >= 6 || 'Должно быть меньше 6 символов'
]
const portRules = [
	v => !!v || 'Обязательно к заполнению',
	v => v && parseFloat(v) % 1 === 0 || 'Должно быть целым числом',
	v => v && v >= 0 || 'Должно быть больше или равно нулю',
]
const contactRules = [
	v => v === null || v === '' ? true : v && parseFloat(v) % 1 === 0 || 'Должно быть целым числом'
]
const parentRules = [
	v => !!v || 'Должен быть выбран родитель',
]

function getContactBySerialNumber(serialNumber, meterType) {
	let contact = 0
	switch (meterType) {
		//Меркурий 234
		case 133:
		case 134:
		case 136:
		case 137:
		case 126:
		case 127:
		case 128:
		case 138:
		case 145:
			contact = parseInt(serialNumber.substr(-3));
			if (contact < 17) {
				while (contact < 17)
					contact += 10;
			} else if (contact > 127) {
				contact = parseInt(contact.toString().substr(1, 2))
				if (contact < 17) {
					while (contact < 17) {
						contact += 10
					}
				}
			}
			break
		//МИР
		case 139:
		case 143:
		case 105:
		case 144:
		case 140:
		case 141:
		case 142:
			contact = serialNumber.substr(-4)
			if (contact.length < 4) {
				contact = contact.padStart(5, '1000')
			}
			break
		//ЭНЕРГОМЕРА
		case 116:
			contact = serialNumber.substr(-9)
			break
		case 107:
		case 113:
		case 114:
		case 115:
		case 122:
		case 149:
		case 150:
		case 151:
			contact = 16;
			break
		case 111:
		case 119:
		case 120:
		case 124:
			contact = serialNumber.substr(-5);
			break
		case 117:
			contact = parseInt(serialNumber.substr(-4)) + 1000;
			break
		default:
			contact = parseInt(serialNumber.substr(-3));
			if (contact > 255) {
				contact = contact.toString().substr(1, 2)
			} else if (contact === 0) {
				contact = 1
			}
	}
	
	return contact
}

export {
	editedItem,
	defaultItem,
	serialNumberRules,
	iccRules,
	gateWayRules,
	portRules,
	contactRules,
	parentRules,
	getContactBySerialNumber
}