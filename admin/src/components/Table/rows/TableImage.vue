<template lang="pug">
  .b-row-image
    // img(:src="body.image1")
    // img.imcurs(:src="body.image2" v-show="isActiveUpload" name="refFiles" type="file" @change='copyChangeRefFiles')
    button.language(:style='{backgroundImage: "url(" + languages.icon + ")"}')
    button.upload
    input.upload(v-if="disableButton" @change="uploadFile" :readonly="true" type="file" name="uploadedFileIcon")
</template>

<script>

export default {
  props: {
    languages: {
      type: Object,
    },
    isActiveUpload: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      refFiles: [],
    };
  },
  methods: {
    copyChangeRefFiles(event){
      this.refFiles = event.target.files[0]; 
    },
  },
  computed: {},
  components:{
  }
};
</script>

<style lang="scss" scoped>
.b-row-image{
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

    .imcurs {
      cursor: pointer;
    }
}
</style>