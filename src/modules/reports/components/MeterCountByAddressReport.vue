<template>
    <v-dialog
        v-model="dialogModel"
        max-width="400px"
        @keydown.enter="okClick"
        @keydown.esc="close"
        @click:outside="close"
    >
        <v-card>
            <v-card-title>
                <span class="m-auto text-h5 pb-4 text-break text-center">{{ title }}</span>
            </v-card-title>

            <v-card-text>
                <v-form
                    ref="form"
                    v-model="formValid"
                    lazy-validation
                    @submit.prevent="okClick"
                    height="500px"
                >
                    <v-select
                        v-model="sortBy"
                        label="Выборка по"
                        required
                        :items="sortItems"
                    />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="close"
                >
                    Отмена
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="okClick"
                >
                    ОК
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
	export default {
		name: "NonActiveInPyramidReport",
		components: {},
        data: () => ({
	        formValid: true,
	        dialogModel: false,
	        sortItems: [ { text: 'Время создания записи', value: 0 },
		                 { text: 'Время загрузки в пирамиду', value: 1 }
                        ],
	        sortBy: 0
        }),
        props: {
            title: {
		        type: String,
		        required: true
	        },
        },
		watch: {
			dialogFormOpen(val) {
				this.dialogModel = val
			}
		},
        methods: {
			open() {
				this.dialogModel = true
            },
	        close() {
		        this.dialogModel = false
	        },
            okClick() {
	            this.$emit('okButtonClickEvent', this.sortBy )
	            this.dialogModel = false
            }
        }
	}
</script>

<style scoped>

</style>