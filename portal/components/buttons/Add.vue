<template lang="pug">
  .add-button(@click="click")
    span.add-button__sign
      span +
</template>

<script>
	export default {
		methods: {
			click() {
				this.$emit("add")
			}
		}
	}
</script>

<style lang="scss" scoped>

  .add-button {
    border: 2px solid #938676;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.7;
    transition: ease 0.2s;
    cursor: pointer;

    &__sign {
      margin-top: -6px;
      height: 25px;
      width: 25px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 28px;
    }
  }

  .add-button:hover {
    opacity: 1;
  }

</style>
