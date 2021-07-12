<template lang="pug">
  .text-input
    .text-input__label {{ label }}:
    input.text-input__input(:type="type" :name="name"  @input="setValue" @click="selectAll")
    span.text-input__example(v-if="example") {{ example }}

</template>

<script>
	export default {
		props: {
			label: {
				type: String
			},
			name: {
				type: String
			},
			example: {
				type: String
			},
			type:{
				type: String,
        default: 'text'
      },
      selectWhenClicked: {
			  type: Boolean,
        default: false
      }
		},
		methods: {
			setValue({ target: { value, name } }) {
				this.$emit("setValue", { property: name, value: value })
			},
      selectAll(e) {
        if (this.selectWhenClicked) e.target.select()
      }
		}
	}
</script>

<style lang="scss" scoped>

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
  }

  .text-input {
    display: flex;
    flex-direction: column;

    &__label {
      font-size: 14px;
      margin-bottom: 4px;
    }

    &__input {

      padding: 10px 10px;
      border: 1px solid #c3c5c5;
      border-radius: 4px;
      outline: none;

      /*padding: 5px;*/
      /*height: 30px;*/
      /*outline: none;*/
      /*border: 1px solid #67573E;*/
      /*border-radius: 4px;*/
      /*color: #67573E;*/

      /*&:focus {*/
      /*  cursor: pointer;*/
      /*  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);*/
      /*}*/

      /*.personal_contacts-height & {*/
      /*  @media (max-width: 450px) {*/
      /*    margin-bottom: 15px;*/
      /*    width: 97%;*/
      /*  }*/
      /*}*/
    }

    &__example {
      font-size: 14px;
      opacity: 0.6;
      margin-top: 4px;

      /*.personal_contacts-height & {*/
      /*  @media (max-width: 450px) {*/
      /*    display: none;*/
      /*  }*/
      /*}*/
    }
  }

</style>
