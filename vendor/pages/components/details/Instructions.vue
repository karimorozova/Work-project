<template lang="pug">
  .instructions
    .instructions__title Brief:
    .instructions__textarea
      textarea.instructions__text(disabled) {{ job.brief }}
</template>

<script>
export default {
  props: {
    job: { type: Object }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.instructions {
  padding: 0px 25px 25px 25px;

  &__title {
    font-size: 20px;
    padding: 25px 0 5px 0;
  }

  &__textarea {
    border: 2px solid rgb(197, 191, 181);
    border-radius: 4px;
  }

  &__text {
    padding: 10px 0 10px 10px;
    overflow-y: auto;
    min-height: 70px;
    border: none;
    outline: none;
    width: calc(100% - 10px);
    height: 100%;
    background: transparent;
    resize: none;
  }
}

</style>
