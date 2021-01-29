<template lang="pug">
  .forbidden
    p.forbidden__message {{ message }}
</template>

<script>
	export default {
		props: {
			message: { type: String }
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .forbidden {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.2);

    &__message {
      font-size: 16px;
      background-color: $white;
      padding: 20px;
      color: $orange;
      border: 2px solid $orange;
      border-radius: 10px;
    }
  }

</style>
