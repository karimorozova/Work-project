<template lang="pug">
  .files-upload
    UploadFileButton(:text="buttonValue")
      input.files-upload__file-input(type="file" @change='uploadFiles' :multiple='isMulti' :class="inputClass")
    //.files-upload__files-list(:class="{'files-upload_bordered': isFilesShow && files.length}")
      .files-upload__files-expander(v-if="files.length")
        .files-upload__list-title(@click="toggleList") Files list
          img.files-upload__list-icon(src="../../../../assets/images/arrow_open.png" :class="{'files-upload_reversed-icon': isFilesShow}")
      .files-upload__loaded-file(v-if="isFilesShow" v-for="(file, index) in files") {{ file.name }}
        span.files-upload__delete-file(@click="deleteFile(index)") +
</template>

<script>
	import UploadFileButton from "@/components/UploadFileButton"

	export default {
		props: {
			buttonValue: { type: String },
			files: {
				type: Array,
				default: () => []
			},
      isMulti: {
        type: Boolean,
        default: true,
      },
			inputClass: { type: String }
		},
		data() {
			return {
				isFilesShow: false
			}
		},
		methods: {
			uploadFiles(e) {
				this.$emit('uploadFiles', { files: e.target.files })
			},
			toggleList() {
				this.isFilesShow = !this.isFilesShow
			},
			deleteFile(index) {
				this.$emit('deleteFile', { index })
			}
		},
		components: {
			UploadFileButton
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .files-upload {
    &__files-list {
      box-sizing: border-box;
      background-color: $white;
      padding: 5px;
      position: absolute;
      bottom: 33px;
      left: -90px;
      width: 150px;
      overflow-x: hidden;
    }

    &__loaded-file {
      display: flex;
      flex-direction: row-reverse;
      justify-content: flex-end;
      align-items: center;
      font-size: 12px;
    }

    &__delete-file {
      transform: rotate(45deg);
      cursor: pointer;
      font-size: 19px;
      font-weight: bold;
      margin-right: 5px;
    }

    &__files-expander {
      opacity: 0.7;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__list-icon {
      margin-left: 5px;
      transform: rotate(180deg);
    }

    &_reversed-icon {
      transform: rotate(0);
    }

    &__list-title {
      cursor: pointer;
    }

    &_bordered {
      border: 1px solid $light-border;
    }
  }

</style>
