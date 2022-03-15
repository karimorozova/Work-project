<template lang="pug">
  .test
    .popcorn(:class="{seted: isDisabled}")
      slot
    .tooltip(v-if="!isDisabled" role="tooltip" :style="{backgroundColor: backgroundColor, color: color}")
      span {{text}}
      .arrow( data-popper-arrow)
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
      default: '#eceff1'
    },
    text: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#666666'
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

.tooltip {
  display: none;
  position: absolute;
  inset: auto auto 0px 0px;
  word-break: break-word;
  white-space: nowrap;
  text-align: center;
  border-radius: 2px;
  padding: 6px 10px;
  z-index: 100000;
  margin-left: -4px !important;
  text-align: center;

  //text-overflow: ellipsis;
  //overflow: hidden;
  //max-width: 300px;
}

.arrow,
.arrow::before {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  margin-top: 1px;
}

.arrow {
  visibility: hidden;
}

.arrow::before {
  visibility: visible;
  content: '';
  transform: rotate(45deg);
}


.tooltip[data-show] {
  display: block;
}

</style>