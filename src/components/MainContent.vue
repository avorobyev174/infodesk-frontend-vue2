<template>
    <v-main :class="background">
        <router-view/>
    </v-main>
</template>
<script>
    export default {
        name: "MainContent",
        data: () => ({
            isSetBackground: false
        }),
	    computed: {
		    background() {
			    return this.isSetBackground ? 'main-background' : ''
		    }
	    },
	    provide: function () {
		    return {
			    setBackgroundImage: this.setBackgroundImage
		    }
	    },
	    methods: {
		    setBackgroundImage(isSetBackground) {
			    this.isSetBackground = isSetBackground
		    },
	    },
    }
</script>

<style scoped>
    .main-background {
        position: relative;
    }

    .main-background:before {
        content: ' ';
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0.25;
        background: url("../assets/background.png");
        background-size: cover;
    }
</style>