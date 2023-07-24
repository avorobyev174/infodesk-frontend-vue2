const parseUpdateField = (updateField, getMeterTypeTitle, getLVStateTitle) => {
	if (!updateField) {
		return ''
	}
	
	let updFields = updateField.split(';');
	
	let updateFields = []
	for (let i = 0; i < updFields.length; i++) {
		let field = updFields[i].split(' ');
		let name = field[0];
		if (name === '')
			break;
		
		let newValue = field[1].substring(13, field[1].length);
		let oldValue = field[2].substring(9, field[2].length);
		switch (name) {
			case 'Type':
				name = 'Тип'
				oldValue = getMeterTypeTitle(+oldValue)
				newValue = getMeterTypeTitle(+newValue)
				break;
			case 'SerialNumber':
				name = 'Серийный номер'
				oldValue = oldValue === '0' ? 'отсутствует' : oldValue
				newValue = newValue === '0' ? 'отсутствует' : newValue
				break;
			case 'AccuracyClass':
				name = 'Класс точности'
				oldValue = oldValue === '0' ? '0.5' : '1'
				newValue = newValue === '0' ? '0.5' : '1'
				break;
			case 'PassportNumber':
				name = 'Номер паспорта'
				oldValue = oldValue === '0' || oldValue === 'null' ? 'отсутствует' : oldValue
				newValue = newValue === '0' || newValue === 'null' ? 'отсутствует' : newValue
				break;
			case 'Condition':
				name = 'Состояние';
				oldValue = oldValue === '0' ? 'Новый' : 'Б/у'
				newValue = newValue === '0' ? 'Новый' : 'Б/у'
				break;
			case 'CalibrationDate':
				name = 'Дата поверки'
				oldValue = oldValue === 'null' ? 'отсутствует' : oldValue
				newValue = newValue === 'null' ? 'отсутствует' : newValue
				break;
			case 'CalibrationInterval':
				name = 'Межповерочный интервал'
				break;
			case 'LVModem':
				name = 'Проверка LV модема'
				oldValue = getLVStateTitle(oldValue)
				newValue = getLVStateTitle(newValue)
				break;
		}
		
		updateFields.push({ name , oldValue, newValue })
	}
	
	return updateFields
}

const parseUpdateCustomField = (field, roles) => {
	if (field == null) {
		return ''
	}
	let updateMaterialsFields = []
	
	if (roles?.storage_module && roles.storage_module === 'keeper') {
		updateMaterialsFields.push({ value:  '...' })
		return updateMaterialsFields
	}
	
	let repFields = field.split(';');
	
	for (let i = 0; i < repFields.length; i++) {
		const item = repFields[i].trim()
		if (item) {
			if (item.includes('материалы'))
				continue
			if (item.includes('Статус')) {
				if (item.includes('не работает')) {
					updateMaterialsFields.push({ value: item, color: 1 })
				} else {
					updateMaterialsFields.push({ value: item, color: 2 })
				}
			} else if (item.includes('Дата')) {
				updateMaterialsFields.push({ value: item, color: 3 })
			} else {
				updateMaterialsFields.push({ value: item })
			}
		}
	}
	
	return updateMaterialsFields
}

export {
	parseUpdateField,
	parseUpdateCustomField
}