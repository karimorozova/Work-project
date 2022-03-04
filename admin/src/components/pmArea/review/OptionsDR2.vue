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
    border-right: 1px solid $border;
  }

  .options {
    display: flex;
    align-items: center;
    border: 1px solid $border;
    background-color: $table-list;
    border-radius: 2px;
    box-sizing: border-box;
    font-size: 14px;
    overflow: hidden;

    &__item {
      width: 140px;
      padding: 7px 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #3333;
    }

    &_brown {
      background-color: white;
      color: $text;
    }
  }

</style>
