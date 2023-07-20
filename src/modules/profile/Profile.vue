<template>
    <div class="m-3 px-4 pb-4">
        <div class="profile">
            <v-avatar
                class="user-avatar"
                width="100%"
                rounded="xl"
                height="100%"
                max-height="300px"
                max-width="250px"
            >
                <v-img :src="photoUrl" lazy-src="@/assets/no-user-image.png"></v-img>
            </v-avatar>
            <div class="pl-5">
                <p class="text-h5 profile__full-name mb-1"> {{ fullName }} </p>
                <p class="job-title">{{ jobTitle }}</p>
                <v-btn color="primary" @click="$refs.PasswordChangeDialog.dialogOpen()">Сменить пароль</v-btn>
            </div>
        </div>
       <dialog-with-data-slot
           ref="PasswordChangeDialog"
           title="Сменя пароля"
           @submit="passwordChange"
           :width="400"
       >
           <template v-slot:fields>
               <v-text-field
                   v-model="oldPassword"
                   label="Старый пароль"
                   :rules="passwordRules"
               />
               <v-text-field
                   v-model="newPassword"
                   label="Новый пароль"
                   :rules="passwordRules"
               />
           </template>
       </dialog-with-data-slot>
    </div>
</template>
<script>
	import { mapActions, mapGetters } from "vuex"
    import DialogWithDataSlot from "../utils-components/dialog/DialogWithDataSlot"

    export default {
        name: 'Profile',
        components: {
	        DialogWithDataSlot
        },
        data: () => ({
            photoUrl: '',
            fullName: 'неизвестно',
            jobTitle: 'неизвестно',
	        oldPassword: '',
	        newPassword: '',
	        passwordRules: [
		        v => !!v || 'Обязательно к заполнению',
		        v => (v && String(v).length >= 4) || 'Должен быть меньше 4 символов'
	        ],
        }),
	    inject: [ 'showNotificationError', 'showNotificationRequestError', 'showNotificationSuccess' ],
        computed: {
	        ...mapGetters({
		        isLogin: 'getIsLogin'
	        }),
        },
        mounted() {
            if (!this.isLogin) {
	            return
            }

            this.setProfileData()
        },
        methods: {
            ...mapActions('profile', [ 'getProfileData', 'changePassword' ]),
            async setProfileData() {
            	try {
                    const info = await this.getProfileData()
                    if (!info) {
                        return this.showNotificationError('Данные о профиле не найдены')
                    }
                    const { photo_url, full_name, job_title } = info
                    this.photoUrl = this.$store.state.serverUrl + `/images/${ photo_url }`
                    this.fullName = full_name
                    this.jobTitle = job_title
	            } catch (e) {
                    this.showNotificationRequestError(e)
	            }
            },


	        async passwordChange() {
		        try {
			        const { id } = await this.changePassword({ oldPassword : this.oldPassword, newPassword: this.newPassword })
			        if (id) {
				        this.showNotificationSuccess('Пароль успешно изменен')
			        }
		        } catch (e) {
			        this.showNotificationRequestError(e)
		        } finally {
			        this.$refs.PasswordChangeDialog.dialogClose()
			        this.oldPassword = ''
			        this.newPassword = ''
		        }
	        }
        }
    }
</script>

<style>
    .profile {
        display: flex;
    }

    .job-title {
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
    }
</style>

