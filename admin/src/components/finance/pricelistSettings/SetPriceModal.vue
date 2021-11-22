<template lang="pug">
  .modal
    div(v-if="!!length")
      .modal__count Updated {{ i }} of {{ length }}
    div(v-else)
      .modal__close(@click="close")
        i.fas.fa-times
      .modal__input
        input(type="number" :placeholder="isPercent ? '0' : '0.000'" v-model="price" ref="input" @click="selectAll()")
        //.euro
        //  span(v-if="!isPercent") &euro;
        //  span(v-else) %
      .modal__button
        Button(value="Confirm" @clicked="setPrice")

</template>

<script>
	import Button from "../../Button"

	export default {
		props: {
			isPercent: {
				type: Boolean,
				default: false
			},
			i: {
				type: Number
			},
			length: {
				type: Number
			}
		},
		data() {
			return {
				price: 0
			}
		},
		methods: {
			selectAll() {
				this.$refs.input.select()
			},
			close() {
				this.$emit('close')
			},
			setPrice() {
				this.$emit('setPrice', this.price)
			}
		},
		components: { Button }
	}
</script>

<style lang="scss" scoped>
  @import '../../../assets/scss/colors';

  .modal {
    z-index: 8;
    position: absolute;
    background: white;
    width: 250px;
    padding: 20px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    box-shadow: $box-shadow;

    &__close {
      position: absolute;
      right: 10px;
      top: 10px;
      font-size: 16px;
      cursor: pointer;
      opacity: 0.8;
      transition: .1s ease-out;

      &:hover {
        opacity: 1;
      }
    }

    &__input {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
      align-items: center;
      position: relative;
    }

    &__count {
      text-align: center;
    }

    &__button {
      display: flex;
      justify-content: center;
    }
  }

  .euro {
    position: absolute;
    right: 35px;
  }

  input {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
  }
</style>