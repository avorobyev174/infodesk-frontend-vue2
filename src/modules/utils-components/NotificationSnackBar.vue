<template>
    <v-snackbar
        v-model="isShow"
        timeout="5000"
        right
        :color="color"
        transition="fab-transition"
    >
        {{ text }}
        <template v-slot:action="{ attrs }">
            <v-btn
                v-bind="attrs"
                @click="isShow = false"
                text
            >
                Закрыть
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script>
    import { mapActions, mapState, mapGetters } from "vuex"
    import { NOT_AUTHORIZATED_ERROR } from '../../const.js'

    export default {
        name: "NotificationSnackBar",
        data: () => ({
            isShow: false,
            text: '',
            color: '',
        }),
        computed: {
            ...mapState([ 'colorRed', 'colorGreen', 'colorBlue', 'colorOrange' ]),
            ...mapGetters({
	            isLogin: 'getIsLogin',
            })
        },
        methods: {
            ...mapActions([ 'logoutUser' ]),
	        /**
             * Функция показывает произвольное уведомление в правом нижем углу экрана
	         * @param {string} text текст уведомления
	         * @param {string} color цвет уведомления
	         */
            showNotification(text , color) {
                this.text = text
                this.color = color
                this.isShow = true
            },
	        /**
             * Функция показывает уведомление с текстом ошибки в правом нижем углу экрана
	         * @param {string} text текст уведомления
	         * @param {error} e предаваемая ошибка
	         */

	        showNotificationSuccess(text) {
		        this.showNotification(text, this.colorGreen)
	        },

	        showNotificationInfo(text) {
		        this.showNotification(text, this.colorBlue)
	        },

	        showNotificationError(text) {
		        this.showNotification(text, this.colorRed)
	        },

	        showNotificationWarning(text) {
		        this.showNotification(text, this.colorOrange)
	        },

            showNotificationRequestErrorWithCustomText(text, e) {
                this.createNotification(text, e)
            },

	        showNotificationRequestError(e) {
		        this.createNotification('Произошла ошибка при получении/отправке данных', e)
	        },

	        createNotification(text, e) {
		        let notificationText = ''
		        if (text) {
			        notificationText = `${ text }: `
		        }
		        if (e) {
			        if (e.response) {
				        this.showNotificationError(`${ notificationText }${ e.response.data }`)
				        if (e.response.status === NOT_AUTHORIZATED_ERROR) {
                            const isRedirectToLoginPage = this.$route.name.toLowerCase() !== 'login'
                            if (this.isLogin) {
	                            setTimeout(async () => {
		                            await this.logoutUser(isRedirectToLoginPage)
                                }, 1000)
                            }
				        }
			        } else if (e.message) {
				        this.showNotificationError(`${ notificationText }${ e.message }`,)
			        }
		        } else {
			        this.showNotificationError(notificationText ? notificationText : `Что то пошло не так...`)
		        }
	        },
        }
    }
</script>

<style scoped>

</style>