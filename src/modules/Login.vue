<template>
    <v-sheet
        class="mx-auto login-container"
    >
        <div class="form" >
            <v-img
                src="@/assets/login_logo_mec.webp"
                max-width="300px"
                class="mx-auto bounce"
            />
            <v-form
                class="my-16 mx-auto login-form slideUp"
                ref="form"
                lazy-validation
            >
                <v-text-field
                    v-model="name"
                    :rules="loginRules"
                    required
                    class="mt-4"
                    placeholder="Имя"
                    autocomplete
                ></v-text-field>
                <v-text-field
                    autocomplete
                    v-model="password"
                    type="password"
                    hide-spin-buttons
                    placeholder="Пароль"
                    :rules="loginRules"
                    class="mt-2"
                    required
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPassword ? 'text' : 'password'"
                    @click:append="showPassword = !showPassword"
                    @keydown.enter="submit"
                ></v-text-field>
                <v-btn
                    color="primary"
                    class="form-login-button"
                    dark
                    large
                    text
                    @click="submit"
                >
                    <v-icon dark>mdi-login</v-icon>
                    Вход
                </v-btn>
            </v-form>
        </div>
    </v-sheet>
</template>

<script>
    import { mapActions, mapState } from "vuex"
    import axios from "axios"

    export default {
        name: "Login",
        data: () => ({
            name: null,
            password: null,
            loginRules: [
            	v => !!v || 'Обязательно к заполнению'
            ],
            showPassword: false,
        }),
        inject: [ 'showNotificationSuccess', 'showNotificationRequestError', 'setBackgroundImage'],
        mounted() {
            if ($cookies.get('auth_token')) {
	            this.$router.push('/')
            }

	        this.setBackgroundImage(true)
        },
        computed: {
	        ...mapState([ 'serverUrl' ]),
        },
        methods: {
            ...mapActions([ 'loginUser' ]),

            async submit() {
                if (!this.$refs.form.validate()) {
                    return
                }

                try {
                    const response = await axios.post(this.serverUrl + '/login', {
                        name: this.name,
                        password: this.password
                    });
                    const { authToken, roleToken, cookies } = response.data
                    this.showNotificationSuccess('Успешный вход')
                    this.loginUser({ authToken, roleToken, cookies })
                } catch (e) {
                    console.log(e)
                    this.showNotificationRequestError(e)
                }
            },
        }
    }
</script>

<style scoped>
    .login-form {
        text-align: center;
        width: 300px;
    }

    .form-login-button {
        margin-top: 25px;
        font-size: 20px;
        font-weight: bold;
    }

    .login-container {
        background: none !important;
        display: grid;
        grid-template-rows: 1fr 4fr;
    }

    .form {
        grid-row: 2 / 3;
    }

    @import "../assets/animate.css";
</style>