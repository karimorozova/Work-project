<template lang="pug">
  .upload-file(:class="customClass")
    span.upload-file__label {{ label }}
    .upload-file__button
      .upload-file__button-text
        i.fas.fa-upload
      input.upload-file__input(type="file" @change='uploadFile' :multiple="isMultiple" :name="inputName")
    span.upload-file__comment {{ comment }}
</template>

<script>
	export default {
		props: {
			label: {
				type: String,
				default: ""
			},
			buttonTitle: {
				type: String,
				default: "Upload"
			},
			comment: {
				type: String,
				default: "Drag & Drop"
			},
			inputName: {
				type: String
			},
			isMultiple: {
				type: Boolean,
				default: true
			},
			customClass: { type: String }
		},
		data() {
			return {}
		},
		methods: {
			uploadFile(event) {
				this.$emit("uploadedFile", { files: event.target.files })
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .upload-file {
    display: flex;
    flex-direction: column;
    align-items: center;

    &__button {
      overflow: hidden;
      position: relative;
      width: 100px;
      height: 32px;
      margin-bottom: 5px;
      line-height: 32px;
      border-radius: 4px;
      background-color: $orange;

      &:hover {
        cursor: pointer;
        box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
      }

      &:active {
        transform: scale(.98);
      }
    }

    &__button-text {
      z-index: 1;
      position: relative;
      color: $white;
      font-family: Myriad400;
      text-align: center;
    }

    &__input {
      top: 0px;
      right: 0;
      z-index: 2;
      position: absolute;
      cursor: pointer;
      opacity: 0;
      filter: alpha(opacity=0);
      font-size: 0;
      width: 100px;
      height: 32px;
      font-family: Myriad400;
      @media (max-width: 550px) {
        width: 140px;
        right: 0;
      }
    }

    &__label {
      font-size: 14px;
      margin-bottom: 5px;
      display: block;
    }

    &__comment {
      font-size: 12px;
      opacity: 0.6;
    }

    .personal__item & {
      @media (max-width: 450px) {
        margin-top: 40px;
      }
    }
  }
</style>
