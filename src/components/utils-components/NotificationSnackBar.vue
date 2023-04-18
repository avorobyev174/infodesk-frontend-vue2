<template>
    <v-snackbar
        v-model="isShow"
        timeout="5000"
        right
        :color="color"
        transition="slide-x-reverse-transition"
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
    import {mapActions, mapState} from "vuex";

    export default {
        name: "NotificationSnackBar",
        data: () => ({
            isShow: false,
            text: '',
            color: '',
        }),
        computed: {
            ...mapState(['colorRed'])
        },
        methods: {
            ...mapActions(['logoutUser']),
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
            showNotificationError(text, e) {
                if (text && e) {
                    if (e.response) {
                        this.showNotification(`${ text }: ${ e.response.data }`, this.colorRed)
                        if (e.response.status === 401) {
                            setTimeout(this.logoutUser, 3500)
                        }
                    } else {
                        this.showNotification(`${ text }: ${ e.message }`, this.colorRed)
                    }
                } else if (text) {
	                this.showNotification(`${ text }`, this.colorRed)
                } else {
                    this.showNotification(`Что то пошло не так, возможно не отвечает сервер`, this.colorRed)
                }
            }
        }
    }
</script>

<style scoped>

</style>