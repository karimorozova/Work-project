<template>
  <div class="progress">
    <svg class="progress__bar" :view-box.camel="`0 0 ${size} ${size}`">
      <g fill="none" :stroke-width="strokeWidth" :transform="`rotate(-90, ${center}, ${center})`">
        <circle class="progress__circle" :cx="center" :cy="center" :r="radius" stroke="#ededed" stroke-width="6"/>
        <circle class="progress__circle" :cx="center" :cy="center" :r="radius" stroke="#4ba5a5" :stroke-width="6" :pathLength="pathLength"
                :stroke-dasharray="`${percent}, 999`"/>
      </g>
      <text :x="center" :y="center" class="progress__text" dominant-baseline="central" text-anchor="middle">{{ presentedPercent }}%</text>
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    percent: { type: Number, default: 0 }
  },
  data() {
    return {
      size: 90,
      strokeWidth: 4
    }
  },
  computed: {
    radius() {
      return this.size / 2 - this.strokeWidth
    },
    center() {
      return this.size / 2
    },
    pathLength() {
      return this.percent < 100 ? 100 : 99
    },
    presentedPercent() {
      let result = +this.percent
      return result > 0 && result < 100 ? +result.toFixed(2) : +result
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
    width: 90px;
    height: 90px;
    font-size: 14px;
    color: #333;
  }

  &__circle {
    transition: 0.5s ease-in-out all;
  }

  &__text {
    fill: $main-color;
  }
}

</style>
