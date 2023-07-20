<template>
    <v-card class="m-3 px-4 pb-6" max-width="800px">
        <v-card-title><p class="text-h6 text-secondary credentials-card-title">Управление данными подключений</p></v-card-title>
        <v-card-subtitle class="pb-0">
            <p class="credentials-card-info">содержит информацию об учетных записях, которые используются в работе различных модулей</p>
        </v-card-subtitle>
        <v-card-text class="pb-3">
            <div class="credential-item">
                <p style="font-style: italic; text-decoration: underline">Ростелеком</p>
                <div style="display:flex; gap: 10px; justify-content: start; align-items: center;">
                    <v-text-field
                        v-model="rtcLogin"
                        :rules="credentialsRules"
                        label="Логин"
                        type="text"
                        clearable
                        class="credentials pt-0 pr-1"
                    />
                    <v-text-field
                        v-model="rtcPassword"
                        :rules="credentialsRules"
                        label="Пароль"
                        type="text"
                        clearable
                        class="credentials pt-0"
                    />
                    <v-btn text color="primary" @click="$refs.RTCDialog.dialogOpen()">Сохранить</v-btn>
                </div>
            </div>
        </v-card-text>
        <dialog-custom
            :max-width="900"
            ref="RTCDialog"
            title="Вы уверены что хотите изменить данные подключения Ростелекома?"
            @submit="saveRTCCredentials"
        />
    </v-card>
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
    import DialogCustom from "./utils-components/dialog/DialogCustom"

	export default {
		name: "Admin",
        data: () => ({
	        rtcLogin: '',
	        rtcPassword: '',
	        credentialsRules: [
		        v => !!v || 'Обязательно к заполнению',
	        ],
        }),
        components: {
			DialogCustom
        },
		inject: [ 'setBackgroundImage', 'showNotificationRequestError', 'showNotificationSuccess' ],
		computed: {
			...mapGetters({
				isLogin: 'getIsLogin'
			}),
		},
		mounted() {
			this.setBackgroundImage(true)
		},
        methods: {
			...mapActions('common', [
				'changeCredentials'
            ]),

	        async saveRTCCredentials() {
                try {
                	await this.changeCredentials({ name: 'rtc', login: this.rtcLogin, password: this.rtcPassword })
                    this.showNotificationSuccess('Данные подключения успешно изменены')
                } catch (e) {
                    this.showNotificationRequestError(e)
                } finally {
	                this.$refs.RTCDialog.dialogClose()
                }
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
        padding-left: 10px;
        height: 78px;
    }
</style>