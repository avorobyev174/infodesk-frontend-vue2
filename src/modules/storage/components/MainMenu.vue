<template>
    <v-menu
        open-on-hover
        bottom
        offset-y
        nudge-left="140px"
        :nudge-width="200"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                dark
                v-bind="attrs"
                v-on="on"
                height="40px"
                class="mr-0"
            >
                <v-icon size="30px">mdi-menu</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item
                v-for="(action, i) in actions"
                :key="i"
                @click="action.onClick ? $emit(action.onClick) : executeFunction(action)"
                v-show="action.visible"
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
<!--    <storage-menu-->
<!--        :menu-actions="menuActions"-->
<!--        :nudge-left="140"-->
<!--        :nudge-width="200"-->
<!--    >{{ menuActions }}</storage-menu>-->
</template>

<script>
	import { mapGetters } from "vuex"
    import Menu from "../../utils-components/menu/Menu"
	import menuActions from "../js/storage-menu"

	export default {
        name: "MainMenu",
        components: {
        	StorageMenu: Menu
        },
        data: () => ({
	        menuActions,
            actions: [
	            { id: 1, title: 'Регистрация', onClick: 'register', icon: 'mdi-plus-box', color: 'primary', visible: true },
                { id: 2, title: 'Прием/Выдача', onClick: 'acceptOrIssue', icon: 'mdi-swap-horizontal-bold', color: 'primary', visible: true },
	            { id: 3, title: 'Регистрация маршрутизатора', onClick: 'routerRegister', icon: 'mdi-plus-box', color: 'primary', visible: true },
	            { id: 4, title: 'Прием/Выдача маршрутизатора', onClick: 'routerAcceptOrIssue', icon: 'mdi-swap-horizontal-bold', color: 'primary', visible: true },
	            { id: 5, title: 'Ремонт/Прием материалов', onClick: 'repairOrMaterialsAdd', icon: 'mdi-cog', color: 'primary', visible: true },
	            { id: 6, title: 'Видимость колонок', onClick: 'showHideColumns', icon: 'mdi-eye', color: 'primary', visible: true },
	            { id: 7, title: 'Показать все счетчики', localOnClick: 'showHideAllMeters', icon: 'mdi-eye-check', color: 'primary', visible: true, type: 'show' },
            ],
        }),
		computed: {
			...mapGetters({
				roles: 'getRoles',
				staffId: 'getStaffId',
			}),
		},
        mounted() {
	        if (this.roles && this.roles.storage_module && this.roles.storage_module === 'keeper') {
		        this.actions[2].visible = false
		        this.actions[3].visible = false
		        this.actions[4].visible = false
		        this.actions[6].visible = false
	        }
	        if (this.roles && this.roles.storage_module && this.roles.storage_module === 'repairer') {
		        this.actions[0].visible = false
		        this.actions[1].visible = false
	        }
	        console.log(this.menuActions)
        },
        methods: {
	        executeFunction(action) {
		        switch(action.id) {
			        case 7: this.showHideAllMeters(action); break
		        }
	        },
	        showHideAllMeters(action) {
		        this.$emit('showHideAllMeters', action?.type)

		        if (action.icon === 'mdi-eye-remove') {
			        action.icon = 'mdi-eye-check'
			        action.title = 'Показать все счетчики'
			        action.type = 'show'
		        } else {
			        action.icon = 'mdi-eye-remove'
			        action.title = 'Скрыть все счетчики'
			        action.type = 'hide'
		        }
	        }
        }
	}
</script>

<style scoped>
    .active {
        display: none;
    }
    .hidden {
        display: flex;
    }

    .v-list-item__icon:first-child {
        margin-right: 10px !important;
    }
</style>