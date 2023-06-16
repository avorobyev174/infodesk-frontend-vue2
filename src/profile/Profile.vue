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
                <v-btn color="primary" @click="changePasswordDialogOpen">Сменить пароль</v-btn>
            </div>
        </div>
        <change-password-dialog
            ref="reportDialog"
        />
    </div>
</template>

<script>
    import { mapActions } from "vuex"
    import ChangePasswordDialog from "./components/ChangePasswordDialog"

    export default {
        name: 'Profile',
        components: {
	        ChangePasswordDialog
        },
        inject: [ 'showNotificationError', 'checkAuth' ],
        data: () => ({
            photoUrl: '',
            fullName: 'неизвестно',
            jobTitle: 'неизвестно',
        }),
        mounted() {
            if (!this.checkAuth()) {
	            return
            }
            this.setProfileData()
        },
        methods: {
            ...mapActions('profile', [ 'getProfileData' ]),

            async setProfileData() {
            	try {
                    const info = await this.getProfileData()
                    if (!info) {
                        return
                    }
                    const { photo_url, full_name, job_title } = info
                    this.photoUrl = this.$store.state.serverUrl + `/images/${ photo_url }`
                    this.fullName = full_name
                    this.jobTitle = job_title
	            } catch (e) {
                    this.showNotificationError(e)
	            }
            },

	        changePasswordDialogOpen() {
            	this.$refs.reportDialog.open()
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

