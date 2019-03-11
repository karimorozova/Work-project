<template>
    <div class="progress">
        <svg class="progress__bar" :view-box.camel="`0 0 ${size} ${size}`">
            <g fill="none" :stroke-width="strokeWidth" :transform="`rotate(-90, ${center}, ${center})`">
            <circle class="progress__circle" :cx="center" :cy="center" :r="radius" stroke="#938676" stroke-width="2"/>
            <circle class="progress__circle" :cx="center" :cy="center" :r="radius" stroke="#d15f45" :stroke-width="strokeWidth" pathLength="100" :stroke-dasharray="`${percent}, 999`"/>
            </g>
            <text :x="center" :y="center" class="progress__text" dominant-baseline="central" text-anchor="middle">{{ percent }}%</text>
        </svg>
    </div>
</template>

<script>
export default {
    props: {
        percent: {type: Number, default: 0}
    },
    data() {
        return {
            size: 60,
            strokeWidth: 5
        }
    },
    computed: {
        radius () {
            return this.size / 2 - this.strokeWidth
        },
        center () {
            return this.size / 2
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.progress {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    align-content: center;
    justify-content: center;
    &__bar {
        width: 70px;
        height: 70px;
        font-size: 12px;
    }
    &__circle {
        transition: 0.5s ease-in-out all;
    }
    &__text {
        fill: $main-color;
    }
}

</style>
