<template>
    <v-menu
        v-model="show"
        :position-x="x"
        :position-y="y"
        absolute
        offset-y
        @click:outside="actions = defaultActions"
    >
        <v-list>
            <v-list-item
                v-for="(action, i) in actions"
                :key="i"
                @click="$emit(action.onClick, currentItem)"
                :class="action.disabled ? 'hidden' : 'active'"
            >
                <v-list-item-icon>
                    <v-icon
                        v-text="action.icon"
                        :color="action.color"
                    ></v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>{{ action.title }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
    export default {
        name: "ActionMenu",
        data: () => ({
	        show: false,
            currentItem: {},
	        x: 0,
	        y: 0,
            defaultActions: [
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
            ],
            actions: []
        }),
        methods: {
            open(item, currentAccountId, x, y) {
                this.currentItem = item
	            this.actions = this.defaultActions.map((action) => {
	            	// зарегистрировано - нельзя просматривать список событий и редактировать
	            	if (item.status === 1 && !item.owner_id && [ 1, 3 ].includes(action.id)) {
	            		return { ...action, disabled: true }
                    // в работе - нельзя редактировать, если не исполнитель
                    } else if (item.status === 2 &&
                                item.owner_id &&
                                [ 3 ].includes(action.id) &&
                                item.owner_id !== currentAccountId)	{
	            		return { ...action, disabled: true }
                    // в работе - нельзя принять, если уже принято тем жеисполнителем
                    } else if (item.status === 2 &&
			            item.owner_id &&
			            [ 2 ].includes(action.id) &&
			            item.owner_id === currentAccountId)	{
			            return { ...action, disabled: true }
			            // закрыто - нельзя редактировать и принять
		            } else if (item.status === 3 && [ 2, 3 ].includes(action.id)) {
			            return { ...action, disabled: true }
                    }
	            	return { ...action }
                })
                this.x = x
                this.y = y
                this.show = true
            }
        }
    }
</script>

<style scoped>
    .hidden {
        display: none;
    }

    .v-list-item__icon:first-child {
        margin-right: 10px !important;
    }
</style>