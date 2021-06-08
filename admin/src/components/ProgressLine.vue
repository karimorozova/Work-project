<template lang="pug">
  .progress-line
    .progress-line__filler(:style="{width: currentProgress + '%'}")
    .progress-line__tooltip
      span.progress-line__value {{ currentProgress }}%
</template>

<script>
	export default {
		props: {
			progress: {
				type: [ Number, String ]
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
    height: 14px;
    border: 1px solid #938676;
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
      background-color: $green;
      height: 100%;
      max-width: 100%;
    }

    &__value {
      background-color: $white;
      color: $main-color;
      font-size: 14px;
      padding: 0 3px;
    }
  }

</style>
