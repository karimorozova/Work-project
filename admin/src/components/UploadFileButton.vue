<template lang="pug">
  .upload-file
    span.upload-file__label(v-if="label") {{ label }}
    .upload-file__button
      i.fas.fa-upload(aria-hidden='true')
      slot
    span.upload-file__comment(v-if="comment") {{ comment }}
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: ""
    },
    text: {
      type: String
    },
    comment: {
      type: String
    }
  },
  data() {
    return {
      files: []
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.upload-file {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__button {
    position: relative;
    width: 60px;
    height: 30px;
    color: $text;
    font-size: 14px;
    border-radius: 3px;
    text-align: center;
    display: flex;
    border: 1px solid $border;
    justify-content: center;
    align-items: center;
    transition: .2s ease-out;

    &:hover {
      cursor: pointer;
      border: 1px solid $border-focus;
    }

    &:active {
      transform: scale(.98);
    }

    .tasks-data & {
      z-index: 999999;
      cursor: pointer !important;
    }
  }

  &__button-text {
    z-index: 1;
    position: relative;
    color: $text;
    font-size: 15px;
    font-family: Myriad400;
    text-align: center;

    .tasks-data & {
      padding-top: 7px;
    }
  }

  &__label {
    font-size: 12px;
  }

  &__comment {
    font-size: 12px;
    opacity: 0.6;
  }

  input {
    top: 0;
    right: 0;
    z-index: 200;
    position: absolute;
    cursor: pointer;
    opacity: 0;
    filter: alpha(opacity=0);
    font-size: 30px;
    font-family: Myriad400;
    width: 60px;
    height: 30px;
  }
}
</style>
