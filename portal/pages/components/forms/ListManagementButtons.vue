<template lang="pug">
  .buttons
    .buttons__button(@click="moveAll")
      .icon
        i.fas.fa-angle-double-right
    .buttons__button(@click="removeAll")
      .icon
        i.fas.fa-angle-double-left
</template>

<script>
export default {

  methods: {
    moveAll() {
      this.$emit('moveAll')
    },
    removeAll() {
      this.$emit('removeAll')
    }
  }

}
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/colors';

.buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__button {
    display: flex;
    border-radius: 2px;
    line-height: 34px;
    background-color: $border;
    color: white;
    font-size: 14px;
    height: 32px;
    width: 28px;
    justify-content: center;
    transition: .2s ease-out;

    &:hover {
      cursor: pointer;
      box-shadow: $box-shadow;
    }

    &:active {
      transform: scale(.97);
    }
  }
}
</style>
