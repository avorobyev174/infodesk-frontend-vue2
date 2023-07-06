<template>
    <div>
        <v-chip
            v-for="({ title, color }, index) in legend"
            :key="index"
            :color="color"
        >
            {{ title }}
        </v-chip>
    </div>
</template>

<script>
	export default {
		name: "FilterLegend",
        props: {
	        legend: {
	        	type: Array,
                required: true
            }
        }
	}
</script>

<style scoped>

</style>