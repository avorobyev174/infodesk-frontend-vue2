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
                <span class="m-auto text-h5 pb-4 text-break text-center">Смена пароля</span>
            </v-card-title>

            <v-card-text>
                <v-form
                    ref="form"
                    v-model="formValid"
                    lazy-validation
                    @submit.prevent="okClick"
                    height="500px"
                >
                    <v-text-field
                        v-model="oldPass"
                        label="Старый пароль"
                        :rules="passwordRules"
                    />
                    <v-text-field
                        v-model="newPass"
                        label="Новый пароль"
                        :rules="passwordRules"
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
	import {mapActions, mapState} from "vuex";

	export default {
		name: "ChangePasswordDialog",
		data: () => ({
			formValid: true,
			dialogModel: false,
            oldPass: '',
			newPass: '',
			passwordRules: [
				v => !!v || 'Обязательно к заполнению',
				v => (v && String(v).length >= 4) || 'Должен быть меньше 4 символов'
			],
		}),
		watch: {
			dialogFormOpen(val) {
				this.dialogModel = val
			}
		},
		inject: [ 'showNotificationSuccess', 'showNotificationRequestError' ],
		methods: {
			...mapActions('profile', [ 'changePassword' ]),
			open() {
				this.dialogModel = true
			},
			close() {
				this.dialogModel = false
				this.oldPass = ''
				this.newPass = ''
			},
			async okClick() {
				if (!this.$refs.form.validate()) {
					return
				}

                try {
	                let res = await this.changePassword( { oldPassword : this.oldPass, newPassword: this.newPass })
	                if (res) {
		                this.showNotificationSuccess('Пароль успешно изменен')
	                }
                } catch (e) {
	                this.showNotificationRequestError(e)
                } finally {
	                this.close()
                }
			}
		}
	}
</script>

<style scoped>

</style>