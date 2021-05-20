<template lang="pug">
  .text-radio(:class="{'text-radio_shadow': isChecked}" @click="check")
    CustomRadio(:isChecked="isChecked")
    .text-radio__text
      .text-radio__head {{ title }}
      .text-radio__inner {{ text }}
</template>

<script>
	import CustomRadio from "~/components/CustomRadio"

	export default {
		props: {
			isChecked: { type: Boolean },
			title: { type: String },
			text: { type: String }
		},
		methods: {
			check() {
				this.$emit('check')
			}
		},
		components: {
			CustomRadio
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .text-radio {
    width: 310px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    border: 2px solid #f4f2f1;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    color: $main-color;

    &__text {
      display: flex;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
    }

    &__head {
      font-size: 14px;
      margin: 5px;
    }

    &__inner {
      text-align: center;
      font-size: 12px;
      opacity: 0.6;
    }

    &_shadow {
      background: #f4f2f1;
    }
  }

</style>