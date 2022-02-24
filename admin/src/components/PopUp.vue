<template lang="pug">
  .test
    #popcorn
      slot
    #tooltip(v-if="!isDisabled" role="tooltip" :style="{backgroundColor: backgroundColor, color: color}")
      span {{text}}
      #arrow( data-popper-arrow)
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
      default: '#fcabae'
    },
    text: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#c62e2e'
    },
    side: {
      type: String,
      default: 'top'
    }
  },
  // computed: {
  //   cssProps() {
  //     return {
  //       '--bg-color': this.backgroundColor,
  //     }
  //   }
  // },
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
      const popcorn = document.querySelector('#popcorn')
      const tooltip = document.querySelector('#tooltip')

      const popup = this.initPopup(popcorn, tooltip)
      this.addListeners(popup, tooltip, popcorn)
    }
  }
}
</script>

<style scoped lang="scss">

#tooltip {
  display: none;
  position: absolute;
  inset: auto auto 0px 0px;
  margin: 0px;
  width: 220px;
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  z-index: 100000;
}

#arrow,
#arrow::before {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
}

#arrow {
  visibility: hidden;
}

#arrow::before {
  visibility: visible;
  content: '';
  transform: rotate(45deg);
}


#tooltip[data-show] {
  display: block;
}

</style>