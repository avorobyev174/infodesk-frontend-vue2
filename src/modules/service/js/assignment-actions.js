import { AssignmentStatus } from '../../../const'

const defaultAssignmentActions = [
	{
		id: 1,
		title: 'Открыть список событий',
		onClick: 'openEventList',
		icon: 'mdi-clipboard-text-search-outline',
		color: 'primary'
	},
	{
		id: 2,
		title: 'Принять поручение',
		onClick: 'acceptAssignment',
		icon: 'mdi-clipboard-account-outline',
		color: 'primary'
	},
	{
		id: 3,
		title: 'Редактировать контактные данные',
		onClick: 'editAssignmentContacts',
		icon: 'mdi-clipboard-edit-outline',
		color: 'primary'
	},
	{
		id: 4,
		title: 'Отклонить поручение',
		onClick: 'declineAssignment',
		icon: 'mdi-clipboard-minus-outline',
		color: 'primary'
	},
]

const filterAssignmentActions = ({ status, owner_id }, currentAccountId) => {
	return defaultAssignmentActions.map((action) => {
		// зарегистрировано - нельзя просматривать список событий, редактировать, отклонить
		if ([ AssignmentStatus.REGISTERED, AssignmentStatus.RE_REGISTERED ].includes(status) && [ 1, 3, 4 ].includes(action.id)) {
			return { ...action, disabled: true }
		// в работе - нельзя редактировать, отклонить если не исполнитель
		} else if (status === AssignmentStatus.IN_WORK && owner_id && [ 3, 4 ].includes(action.id) && owner_id !== currentAccountId)	{
			return { ...action, disabled: true }
		// в работе - нельзя принять, если уже принято тем жеисполнителем
		} else if (status === AssignmentStatus.IN_WORK && owner_id && [ 2 ].includes(action.id) && owner_id === currentAccountId)	{
			return { ...action, disabled: true }
		// закрыто - нельзя редактировать и принять
		} else if ([ AssignmentStatus.CLOSED, AssignmentStatus.CLOSED_AUTO ].includes(status) && [ 2, 3, 4 ].includes(action.id)) {
			return { ...action, disabled: true }
		}
		return { ...action }
	})
}

export {
	defaultAssignmentActions,
	filterAssignmentActions,
}