<template>
    <v-menu
        v-model="show"
        :position-x="x"
        :position-y="y"
        absolute
        offset-y
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
            actions: [
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
                    title: 'Закрыть поручение',
                    onClick: 'saveExcelRefreshDataToPyramid',
                    icon: 'mdi-clipboard-remove-outline',
                    color: 'primary'
                },
            ],
        }),
        methods: {
            open({ item }, accId, x, y) {
                this.currentItem = item
	            this.actions = this.actions.map((action) => {
	            	if (!item.emp_id && [ 1, 3 ].includes(action.id)) {
	            		return { ...action, disabled: true }
                    } else if (item.emp_id && [ 3 ].includes(action.id) && item.emp_id !== accId) {
	            		return { ...action, disabled: true }
                    }
	            	return { ...action, disabled: false }
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