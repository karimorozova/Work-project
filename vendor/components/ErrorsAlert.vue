<template lang="pug">
  .errors
    .errors__close
      span.errors__icon(@click="closeErrors") +
    .errors__title Errors occured:    
    ul.errors__list
      li.errors__item(v-for="error in errors") {{ error }}
</template>

<script>
	export default {
		props: {
			errors: {
				type: Array
			}
		},
		methods: {
			closeErrors() {
				this.$emit("closeErrors")
			}
		}
	}
</script>

<style lang="scss" scoped>

  .errors {
    display: flex;
    flex-direction: column;
    align-items: center;
    /*border-radius: px;*/
    width: 331px;
    padding: 20px;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    position: fixed;
    z-index: 100;
    background-color: #FFF;
    top: calc(50% - 200px);
    left: calc(50% - 165px);
    @media all and (orientation: portrait) and (max-width: 767px) {
      box-shadow: none;
      width: auto;
      left: 0;
      border: 1px solid #D15F45;
    }
    @media all and (orientation: landscape) and (max-width: 1000px) {
      box-shadow: none;
      width: auto;
      left: 0;
      top: 40px;
      border: 1px solid #D15F45;
    }
    /*@media (max-width: 450px) {*/
    /*  width: 268px;*/
    /*  left: calc(50% - 135px);*/
    /*  padding: 20px 15px;*/
    /*}*/
    /*@media (max-width: 460px) {*/
    /*  width: 248px;*/
    /*}*/

    &__close {
      position: relative;
      width: 100%;
    }

    &__icon {
      position: absolute;
      top: -15px;
      right: -10px;
      transform: rotate(45deg);
      font-size: 30px;
      transition: all 0.2s;
      cursor: pointer;
      opacity: 0.8;

      &:hover {
        opacity: 1;
      }

/*      @media (max-width: 450px) {
        top: -20px;
        right: -3px;
      }*/
    }

    &__title {
      font-size: 20px;
      text-transform: uppercase;
    }

    &__list {
      display: flex;
      flex-direction: column;
    }

    &__item {
      color: #D15F45;
    }
  }

</style>
