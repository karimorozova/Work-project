<template lang="pug">
  .deliverable-upload
    .text(v-if="!files.length") Drag and drop deliverable file here or click here to select deliverable file from your computer
    .text(v-else) Uploaded file:
      span.text_strong {{ files[0].name }}
    .upload-area
      input.upload-area__input(type="file" @change="setFile")
</template>

<script>
	export default {
		data() {
			return {
				files: []
			}
		},
		methods: {
			setFile(e) {
				this.files = Array.from(e.target.files)
				this.$emit('setDeliverables', { files: this.files })
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .deliverable-upload {
    padding: 35px 0 10px;
    position: relative;
    border: 2px dotted rgb(197, 191, 181);
    border-radius: 4px;
  }

  .text {
    text-align: center;

    &_strong {
    }
  }

  .upload-area {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: url("../../../assets/images/Other/upload-icon.png");
    background-repeat: no-repeat;
    background-position: center 25%;
    transition: ease 0.2s;

    &:hover {
      box-shadow: 0 0 0px 2px rgb(197, 191, 181);
      border-radius: 4px;
    }

    &__input {
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }
  }

</style>
