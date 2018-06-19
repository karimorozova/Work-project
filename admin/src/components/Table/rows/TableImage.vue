<template lang="pug">
  .b-row-image
    img(:src="body.image1")
    img.imcurs(:src="body.image2" v-show="isActiveUpload" @change='copyChangeRefFiles')
</template>

<script>

export default {
  props: {
    body: {
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