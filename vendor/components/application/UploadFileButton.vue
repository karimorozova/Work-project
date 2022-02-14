<template lang="pug">
  .upload-file
    span.upload-file__label {{ label }}
    .upload-file__button
      .upload-file__button-text {{ btnText }}
      input.upload-file__input(name="detailFiles" type="file" @change='uploadFile' multiple)
    span.upload-file__comment Drag &amp; Drop
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: ""
    },
    btnText: {
      type: String,
      default: "Upload file(s)"
    }
  },
  data() {
    return {
      files: []
    }
  },
  methods: {
    uploadFile(event) {
      for (let file of event.target.files) {
        const isExist = this.files.find(item => item.name === file.name)
        if (!isExist) {
          this.files.push(file)
          this.$emit("uploadedFile", { files: this.files })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.upload-file {
  display: flex;
  flex-direction: column;

  &__button {
    margin-top: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 120px;
    height: 32px;
    width: 220px;
    color: #fff;
    font-size: 14px;
    border-radius: 3px;
    background-color: $red;
    border: none;
    transition: .1s ease;
    outline: none;
    letter-spacing: 0.2px;
    position: relative;

    &:hover {
      cursor: pointer;
      box-shadow: $box-shadow;
    }

    &:active {
      transform: scale(.98);
    }
  }

  &__button-text {
    z-index: 0;
    position: relative;
    color: #fff;
    font-size: 14px;
    text-align: center;
  }

  &__input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  &__label {
    font-size: 14px;
  }

  &__comment {
    font-size: 14px;
    opacity: 0.6;
    margin-top: 4px;

  }

  .personal__item & {
    @media (max-width: 450px) {
      margin-top: 40px;
    }
  }
}
</style>
