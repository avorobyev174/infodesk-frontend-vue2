<template>
    <div>
        <v-tabs
            background-color="colorGrey"
            fixed-tabs
            v-model="tabModel"
        >
            <v-tab href="#programming" class="p-2">Программирование</v-tab>
            <v-tab href="#storage">Склад</v-tab>
       </v-tabs>
        <v-tabs-items v-model="tabModel">
            <v-tab-item value="programming">
                <programming-charts/>
            </v-tab-item>
            <v-tab-item value="storage">
                <storage-charts/>
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
    import DictionaryMixin from "../mixins/DictionaryMixin"
    import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin"
    import ProgrammingCharts from "./components/ProgrammingCharts"
    import StorageCharts from "./components/StorageCharts"

    export default {
	    name: 'General',
	    components: {
		    StorageCharts,
		    ProgrammingCharts
	    },
	    data: () => ({
		    tabModel: null,
	    }),
	    provide: function () {
		    return {
			    getMeterTypeTitle: this.getMeterTypeTitle,
			    formatDate: this.formatDate,
		    }
	    },
	    inject: [
		    'setBackgroundImage'
	    ],
	    mixins: [DictionaryMixin, FavoriteModuleMixin],
	    async mounted() {
		    this.setBackgroundImage(false)
	    }
    }
</script>
