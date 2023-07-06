<script>
	export default {
		name: "NotificationMixin",
        methods: {
	        showNotification(text, color) {
		        this.$refs.notificationManager.showNotification(text, color)
	        },

	        showNotificationInfo(text) {
		        this.$refs.notificationManager.showNotificationInfo(text)
	        },

	        showNotificationSuccess(text) {
		        this.$refs.notificationManager.showNotificationSuccess(text)
	        },

	        showNotificationWarning(text) {
		        this.$refs.notificationManager.showNotificationWarning(text)
	        },

	        showNotificationError(text) {
		        this.$refs.notificationManager.showNotificationError(text)
	        },

	        showNotificationRequestError(e) {
		        this.$refs.notificationManager.showNotificationRequestError(e)
	        },

	        showNotificationRequestErrorWithCustomText(text, e) {
		        this.$refs.notificationManager.showNotificationRequestErrorWithCustomText(text, e)
	        },
        }
	}
</script>
