<template lang="pug">
  .buttons
    .buttons__button(@click="moveAll")
      .icon
        i.fas.fa-angle-double-right
    .buttons__button(@click="removeAll")
      .icon
        i.fas.fa-angle-double-left
</template>

<script>
	export default {

		methods: {
			moveAll() {
				this.$emit('moveAll')
			},
			removeAll() {
				this.$emit('removeAll')
			}
		}

	}
</script>

<style lang="scss" scoped>
  @import '../assets/scss/colors';

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;

    &__button {
      display: flex;
      border-radius: 4px;
      align-items: center;
      background-color: $red;
      color: white;
      font-size: 13px;
      height: 24px;
      width: 32px;
      justify-content: center;
      transition: .2s ease-out;

      &:hover {
        cursor: pointer;
        box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
      }

      &:active {
        transform: scale(.97);
      }
    }
  }
</style>
