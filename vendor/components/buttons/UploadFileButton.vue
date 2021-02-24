<template lang="pug">
.upload-file
    span.upload-file__label {{ label }}
    .upload-file__button
        .upload-file__button-text Upload file(s)
        input.upload-file__input(name="detailFiles" type="file" @change='uploadFile' multiple)
    span.upload-file__comment Drag &amp; Drop
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            files: []
        }
    },
    methods: {
        uploadFile(event) {
            for(let file of event.target.files) {
                const isExist = this.files.find(item => item.name === file.name) 
                if (!isExist) {
                    this.files.push(file);
                    this.$emit("uploadedFile", {files: this.files})
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>

.upload-file {
    display: flex;
    flex-direction: column;
    &__button {
      margin-top: 7px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 120px;
      padding: 0 24px;
      height: 34px;
      color: #fff;
      font-size: 14px;
      border-radius: 7px;
      background-color: #d15f45;
      border: none;
      transition: .1s ease;
      outline: none;
      letter-spacing: 0.2px;

      &:hover {
        cursor: pointer;
        box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
      }

      &:active {
        transform: scale(.98);
      }
        @media (max-width: 450px) {
            width: 100px;
        }
    }
    &__button-text {
        z-index: 1;
        position: relative;
        color: #fff;
        font-size: 15px;
        font-family: Myriad400;
        text-align: center;
    }
    &__input {
        top: 0px;
        right: -25px;
        z-index: 2;
        position: absolute;
        cursor: pointer;
        opacity: 0;
        filter: alpha(opacity=0);
        font-size: 30px;
        font-family: Myriad400;
    }
    &__label {
        font-size: 14px;
    }
    &__comment {
        font-size: 14px;
        opacity: 0.6;
      margin-top: 5px;

    }
    .personal__item & {
        @media (max-width: 450px) {
            margin-top: 40px;
        }
    }
}
</style>
