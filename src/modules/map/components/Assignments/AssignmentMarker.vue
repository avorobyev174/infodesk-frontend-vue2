<template>
    <v-tooltip top :color="colorGrey">
        <template v-slot:activator="{ on, attrs }">
            <div
                class="assignment-marker"
                v-bind="attrs"
                v-on="on"
            >
                <v-icon
                    large
                    :color="marker.color"
                >
                    mdi-clipboard-text
                </v-icon>
                <span
                    class="count"
                    v-if="marker.count > 1"
                    :class="markerCountClass"
                >{{ marker.count }}</span>
            </div>
        </template>
        <div>
            <div
                v-for="({ address, owner, status }, index) in marker.apartments"
                :key="index"
                class="marker"
            >
                <span class="tooltip-span">{{ `Адрес: ${ address }` }}</span>
                <span class="tooltip-span">{{ `Исполнитель: ${ owner }` }}</span>
                <span class="tooltip-span">{{ `Статус: ${ getAssignmentStatusTitle(status) }` }}</span>
            </div>
        </div>
    </v-tooltip>
</template>

<script>
	import { mapState } from "vuex"

	export default {
		name: "AssignmentMarker",
		inject: [ 'getAssignmentStatusTitle' ],
		props: {
			marker: {
				type: Object,
				required: true
			},
		},
		computed: {
			...mapState([ 'colorGrey' ]),
            markerCountClass() {
				return this.marker?.count >= 10 ? 'count-more-10' : 'count-less-10'
            }
		},
	}
</script>

<style scoped>
    .assignment-marker {
        position: relative;
    }

    .marker {
        font-size: 12px;
    }

    .count {
        font-weight: bold;
        font-size: 16px;
        position: absolute;
        color: rgba(0, 0, 0, 0.8);
        top: 8px;
    }

    .count-less-10 {
        left: 13px;
    }

    .count-more-10 {
        left: 9px;
    }

    .tooltip-span {
        display: block;
        color: rgba(0, 0, 0, 0.8);
        font-weight: 600;
    }

    .marker {
        border: 1px solid rgba(0, 0, 0, 0.4);
        text-align: left;
        padding: 5px;
        margin: 5px;
        border-radius: 3px;
    }
</style>