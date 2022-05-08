<template lang="pug">
  .close(@click="close")
    img.icon(src="../assets/images/latest-version/close.svg")
</template>

<script>
export default {
  name: "Close",
  methods: {
    close() {
      this.$emit('clicked')
    }
  }
}
</script>

<style lang="scss" scoped>
.close {
  position: absolute;
  //right: 25px;
  //top: 25px;
  height: fit-content;
  width: fit-content;
  padding: 3px;
  display: flex;
  cursor: pointer;

  &:hover {
    .icon {
      opacity: 0.8;
    }
  }
}

.icon {
  height: 13px;
  width: 13px;
  opacity: 0.6;
}
</style>
