<template lang="pug">
  .add-button(@click="click")
    .add-button__icon
      i.fas.fa-plus
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
  @import '../assets/scss/colors';

  .add-button {
    width: 25px;
    height: 25px;
    border: 1px solid $border;
    border-radius: 4px;
    cursor: pointer;
    /*transition: .1s cubic-bezier(.12,0,.39,0);*/
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    /*    &:hover{
          background: $table-list;
        }*/
    &__icon {
      font-size: 16px;
      color: $border;
    }

  }

</style>
