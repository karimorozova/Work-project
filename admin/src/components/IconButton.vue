<template lang="pug">
  PopUp(:backgroundColor="popupBg" :color="popupTextColor" :text="popupText" :side="popupSide" :isDisabled="!hasPopup" )
    .button(:class="{disabled: isDisable}" @click.stop="click")
      .button__icon
        slot
</template>

<script>
import PopUp from "./PopUp"
	export default {
    components: {
      PopUp
    },
    props: {
      isDisable: {
        type: Boolean,
        default: false
      },
      hasPopup: {
        type: Boolean,
        default: false
      },
      popupBg: {
        type: String,
      },
      popupTextColor: {
        type: String
      },
      popupText: {
        type: String,
      },
      popupSide: {
        type: String
      }
    },
		methods: {
			click() {
			  if (this.isDisable) return
				this.$emit("clicked")
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import '../assets/scss/colors';

  .button {
    min-width: 25px;
    height: 25px;
    border: 1px solid $border;
    border-radius: 4px;
    transition: .2s ease-out;
    display: flex;
    justify-content: center;
    align-items: center;

    &:not(.disabled):hover {
      .button__icon {
        color: $text;
      }
    }

    &__icon {
      font-size: 15px;
      color: $dark-border;
      margin-top: 1px;
    }

  }
  .button:not(.disabled) {
    cursor: pointer;
  }

</style>
