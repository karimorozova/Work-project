<template lang="pug">
  .options
    .options__item.border(:class="{'options_brown': isReadyForDelivery}" @click="(e) => toggle(e, 'isReadyForDelivery')") Ready for Delivery
    .options__item.border(:class="{'options_brown': isNotify}" @click="(e) => toggle(e, 'isNotify')") Notify Client
    .options__item(:class="{'options_brown': isDeliver}" @click="(e) => toggle(e, 'isDeliver')") Deliver to Client
</template>

<script>
	export default {
		props: {
			isDeliver: { type: Boolean, default: false },
			isNotify: { type: Boolean, default: false },
			isReadyForDelivery: { type: Boolean, default: false }
		},
		methods: {
			toggle(e, prop) {
				this.$emit("toggleOption", { prop })
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .border {
    border-right: 2px solid #938676;
  }

  .options {
    display: flex;
    align-items: center;
    border: 2px solid #938676;
    border-radius: 8px;
    box-sizing: border-box;
    font-size: 14px;
    overflow: hidden;

    &__item {
      width: 120px;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: $main-color;
      // &:first-child {
      //     border-right: 1px solid $main-color;
      // }
    }

    &_bordered {
      border-right: 2px solid #938676;
      border-left: 2px solid #938676;
    }

    &_brown {
      background-color: #938676;
      color: $white;

      &:first-child {
        border-right-color: $white;
        border-left-color: $white;
      }
    }
  }

</style>
