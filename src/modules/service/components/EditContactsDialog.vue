<template>
    <v-dialog v-model="dialogModel" max-width="500px">
        <v-card>
            <v-card-title>
                <span class="mx-auto text-h5 text-center text-break">Редактирование контактных данных</span>
            </v-card-title>
            <v-card-text class="pt-2 pb-1">
                <v-text-field
                    v-model="contacts"
                    label="Контактные данные"
                ></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    text
                    color="primary"
                    @click="saveContacts"
                >
                    Сохранить
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
	import DialogMixin from "../../mixins/DialogMixin"
	import { mapActions } from "vuex"

	export default {
		name: "EditContactsDialog",
        mixins: [ DialogMixin ],
        data: () => ({
	        contacts: ''
        }),
		inject: [ 'showNotificationStandardError' ],
        props: {
	        assignment: Object
        },
        watch: {
	        assignment(val) {
	        	this.contacts = val.customer_contacts
            }
        },
        methods: {
	        ...mapActions('service', [ 'saveAssignmentContacts', ]),

			async saveContacts() {
				try {
					const updatedAssignment = await this.saveAssignmentContacts({
						assignmentId: this.assignment?.id,
						contacts: this.contacts
					})
					this.$emit('updateAssignment', updatedAssignment)
				} catch (e) {
					this.showNotificationStandardError(e)
				} finally {
					this.dialogClose()
				}
            }
        }
	}
</script>

<style scoped>

</style>