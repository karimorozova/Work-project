<template lang="pug">
  .progress-line
    .progress-line__filler(:style="[{width: currentProgress + '%'}, {'background-color': getProgressColor(status)}]")
    .progress-line__tooltip
      span.progress-line__value {{ currentProgress }}%
</template>

<script>
export default {
  props: {
    progress: {
      type: [ Number, String ]
    },
    status: {
      type: String
    }
  },
  methods: {
    getProgressColor(status) {
      return status === 'Pending Approval [DR1]' || status === 'Completed' || status === 'Closed' ? '#A9D3D1' : '#EAC0BB'
    }
  },
  computed: {
    currentProgress() {
      return !isNaN(this.progress) ? this.progress : 0
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.progress-line {
  width: 100%;
  height: 7px;
  border: 1px solid #ddd;
  position: relative;
  box-sizing: border-box;

  &__tooltip {
    position: absolute;
    width: 100%;
    opacity: 0;
    transition: all 0.2s;
    top: -1px;
    display: flex;
    justify-content: center;
  }

  &:hover {
    .progress-line__tooltip {
      opacity: 1;
    }
  }

  &__filler {
    height: 100%;
    max-width: 100%;
  }

  &__value {
    background-color: white;
    font-size: 14px;
    padding: 2px 4px;
    border-radius: 2px;
    width: 50px;
    text-align: center;
    margin-top: -3px;
  }
}

</style>
