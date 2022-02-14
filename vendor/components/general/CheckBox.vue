<template lang="pug">
  .checkbox(:class="customClass")
    .checkbox__brown(v-if="!isDisabled")
      img.checkbox__image(v-if="!isChecked" src="../../assets/images/final/checkbox-brown-0.svg" @click.stop="check")
      img.checkbox__image(v-else src="../../assets/images/final/checkbox-brown-1.svg" @click.stop="uncheck")
    .checkbox__brown(v-else)
      img.checkbox__image(style="opacity: 0.5; cursor: " v-if="!isChecked" src="../../assets/images/final/checkbox-brown-0.svg")
      img.checkbox__image(style="opacity: 0.5; cursor: " v-else src="../../assets/images/final/checkbox-brown-1.svg")

</template>

<script>
export default {
  props: {
    isChecked: { type: Boolean },
    customClass: { type: String },
    isWhite: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false }
  },
  methods: {
    check() {
      this.$emit('check')
    },
    uncheck() {
      this.$emit('uncheck')
    }
  }
}
</script>

<style lang="scss" scoped>

.checkbox {
  height: 18px;
  width: 18px;

  &__image {
    background-color: white;
    height: 18px;
    width: 18px;
  }
}

.checkbox.size-small {
  height: 15px;
  width: 15px;

  img {
    width: 15px;
  }
}

</style>
