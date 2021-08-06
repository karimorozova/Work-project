<template lang="pug">
  .progress-line
    .progress-line__filler2(:style="{width: lastProgress + '%'}")
    .progress-line__filler(:style="{width: (+currentProgress) - (+lastProgress) + '%'}")
    .progress-line__tooltip
      span.progress-line__value {{ currentProgress }}%
</template>

<script>
	export default {
		props: {
			progress: {
				type: [ Number, String ]
			},
			lastProgress: {
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
    height: 10px;
    border: 1px solid $border;
    position: relative;
    box-sizing: border-box;
    display: flex;
    border-radius: 2px;

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

    &__filler2 {
      background-color: #AAAAAA;
      height: 100%;
      max-width: 100%;
    }

    &__value {
      background-color: white;
      font-size: 14px;
      padding: 2px 4px;
      border-radius: 4px;
      width: 50px;
      text-align: center;
      margin-top: -3px;
    }
  }

</style>
