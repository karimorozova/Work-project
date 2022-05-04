<template lang="pug">
  .wrapper
    .popcorn(:class="{seted: isDisabled}")
      slot
    .tooltip(v-if="!isDisabled" role="tooltip" :style="{backgroundColor: backgroundColor, color: color}")
      .text {{text}}
      .text(v-html="html" )
      #arrow
</template>

<script>
import { createPopper } from '@popperjs/core'

export default {
  name: "PopUp",
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    },
    backgroundColor: {
      type: String,
      default: '#fff'
    },
    text: {
      type: String,
      default: ''
    },
    html: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#333'
    },
    side: {
      type: String,
      default: 'top'
    }
  },
  methods: {
    initPopup(element, tooltip) {
      return createPopper(element, tooltip, {
        placement: this.side,
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [ 0, 10 ]
            }
          }
        ]

      })
    },
    addListeners(popup, tooltip, element) {
      const showEvents = [ 'mouseenter', 'focus' ]
      const hideEvents = [ 'mouseleave', 'blur' ]

      tooltip.classList.add('seted')
      element.classList.add('seted')

      showEvents.forEach((event) => {
        element.addEventListener(event, () => this.show(tooltip, popup))
      })

      hideEvents.forEach((event) => {
        element.addEventListener(event, () => this.hide(tooltip))
      })
    },
    show(tooltip, popup) {
      tooltip.setAttribute('data-show', '')
      popup.update()
    },
    hide(tooltip) {
      tooltip.removeAttribute('data-show')
    }
  },
  mounted() {
    if (!this.isDisabled) {
      const popcorn = document.querySelector('.popcorn:not(.seted)')
      const tooltip = document.querySelector('.tooltip:not(.seted)')

      const popup = this.initPopup(popcorn, tooltip)
      this.addListeners(popup, tooltip, popcorn)
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/scss/colors";

.wrapper {
  width: fit-content;
  position: relative;
}

.tooltip {
  display: none;
  position: absolute;
  inset: auto auto 0px 0px;
  word-break: break-word;
  white-space: nowrap;
  text-align: center;
  border-radius: 2px;
  padding: 7px 15px;
  z-index: 100000;
  text-align: center;
  border: 1px solid $border;
}

.text {
  font-family: Myriad400;
  font-size: 14px !important;
  font-weight: normal !important;
}

.tooltip[data-show] {
  display: block;
}

#arrow {
  width: 0;
  height: 0;
  position: absolute;
}

.tooltip[data-popper-placement^='top'] > #arrow {
  bottom: -8px;
  right: calc(50% - 8px);
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid $border;

}

.tooltip[data-popper-placement^='bottom'] > #arrow {
  top: -8px;
  right: calc(50% - 8px);
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 7px solid $border;
}

.tooltip[data-popper-placement^='left'] > #arrow {
  top: calc(50% - 7px);
  right: -8px;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 7px solid $border;
}

.tooltip[data-popper-placement^='right'] > #arrow {
  top: calc(50% - 7px);
  left: -8px;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-right: 7px solid $border;
}

</style>