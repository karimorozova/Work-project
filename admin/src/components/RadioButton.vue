<template lang="pug">
  .radio__wrapper
    .radio__buttom(@click.stop="toggle")
      .radio__inside-circle(:class="{'radio_checked': isSelected}")
    .radio__text(@click.stop="toggle") {{ name }}
</template>

<script>
export default {
  props: {
    selected: {
      type: String,
      default: true
    },
    name: {
      type: String,
      default: ""
    }
  },
  methods: {
    toggle() {
      this.$emit('toggleRadio', {value: this.name})
    }
  },
  computed: {
    isSelected() {
      return this.name === this.selected
    },
  }
}
</script>

<style scoped lang="scss">

.radio {
  &__text{
    margin-left: 5px;
    cursor: pointer;
  }
  &__wrapper{
    display: flex;
  }
  &__buttom{
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid #67573E;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  &__inside-circle {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  &_checked {
    background-color: #67573E;
  }
}

</style>
