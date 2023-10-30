<template>
    <v-card>
        <v-data-table
            :loading="loading"
            sort-by="id"
            class="elevation-1"
            height="80vh"
            @contextmenu:row="actionMenuOpen"
            single-select
            :item-key="itemKey"
            :items-per-page="25"
            :footer-props="{
            showFirstLastPage: true,
                'items-per-page-text': 'объектов на странице',
                'items-per-page-options': [ 25, 50, 100 ]
            }"
            loading-text="Идет загрузка объектов..."
            fixed-header
            :headers="headers"
            :items="objects"
            @click:row="initializeObjectInfo"
            :search="search"
        >
            <template v-slot:no-results>
                <span>Нет данных...</span>
            </template>
            <template v-slot:no-data>
                <p class="pt-4">Нет данных...</p>
            </template>
            <template v-slot:top>
                <v-toolbar flat height="70px">
                    <v-select
                        v-model="objectType"
                        :items="objectTypes"
                        @change="objectTypeChanged"
                        item-text="text"
                        item-value="value"
                        label="Тип объекта"
                        required
                        class="mt-6 pr-5"
                        style="max-width: 250px"
                    />
                    <v-text-field
                        v-model="search"
                        label="Поиск"
                        class="mt-6"
                        style="max-width: 250px"
                    />
                    <v-spacer/>
                    <objects-menu
                        :menuActions="menuActions"
                        @update="getObjects"
                        @showHideColumns="$refs.ShowHideColumnsDialog.dialogOpen()"
                        @addOrEdit="$refs.AIISAddOrEditDialog.open()"
                    />
                </v-toolbar>
            </template>
        </v-data-table>
        <action-menu
            ref="ActionMenu"
            :actions="defaultObjectsActions"
            @edit="$refs.AIISAddOrEditDialog.edit(selectedObject)"
            @delete="$refs.ObjectDeleteDialog.dialogOpen()"
        />
        <dialog-custom
            ref="ObjectDeleteDialog"
            :max-width="600"
            title="Вы уверены что хотите удалить этот объект?"
            @submit="objectDelete"
        />
        <show-hide-columns-dialog
            ref="ShowHideColumnsDialog"
            :headers="headers"
            :selectedHeaders="selectedHeaders"
            @changeColumns="changeColumnsVisibility"
            module="objects"
        />
        <a-i-i-s-add-or-edit-dialog
            :objects="objects"
            ref="AIISAddOrEditDialog"
        />
    </v-card>
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import ObjectsMixin from "./mixins/ObjectsMixin"
	import ColumnVisibilityMixin from "../mixins/ColumnVisibilityMixin"
	import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin"
	import ActionMenu from "../utils-components/menu/ActionMenu"
    import DialogCustom from "../utils-components/dialog/DialogCustom"
    import Menu from "../utils-components/menu/Menu"
	import ShowHideColumnsDialog from "../utils-components/show-hide-columns/ShowHideColumnsDialog"
    import AIISAddOrEditDialog from "./components/AIISAddOrEditDialog"

	export default {
		name: "Objects",
        components: {
			ActionMenu,
	        DialogCustom,
	        ObjectsMenu: Menu,
	        ShowHideColumnsDialog,
	        AIISAddOrEditDialog
        },
        data: () => ({
	        module: 'objects',
	        selectedObject: null,
	        objectsActions: [],
	        search: '',
            objectType: 'aiis',
	        objectTypes: [
                { text: 'АИИС', value: 'aiis' },
                { text: 'Сим карты', value: 'sim' },
                { text: 'Матрица', value: 'matrix' },
            ],
	        itemKey: 'id'
        }),
		mixins: [ ColumnVisibilityMixin, FavoriteModuleMixin, ObjectsMixin ],
		inject: [ 'showNotificationRequestError', 'showNotificationSuccess' ],
		computed: {
			...mapGetters({
				isLogin: 'getIsLogin'
			}),
		},
        methods: {
			...mapActions('common', [
				''
            ]),

	        actionMenuOpen(e, { item }) {
		        e.preventDefault()
		        this.selectedObject = item
		        this.$refs.ActionMenu.open(e.clientX, e.clientY)
	        },

	        async initializeObjectInfo(item, row) {
		        row.select(true)
		        //this.$refs.ServiceEventList.open(item, this.currentAccountId)
	        },

            async objectTypeChanged() {
	            await this.getObjects()
            }
        }
	}
</script>

<style scoped>
    .credentials {
        max-width: 200px;
    }

    .credentials-card-title {
        margin-bottom: 0px !important;
        color: rgba(0, 0, 0, 0.87) !important;
    }

    .credentials-card-info {
        font-size: 11px;
    }

    .credential-item {
        border-left: 5px solid #1976d2;
        padding-left: 12px;
        height: 78px;
        border-radius: 7px;
    }
</style>