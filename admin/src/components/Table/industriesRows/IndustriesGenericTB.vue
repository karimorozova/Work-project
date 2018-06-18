<template lang="pug">
  .b-row-image
    img(:src="body.image3")
    img.imcurs(:src="body.image2" v-show="isActiveUpload")
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
    return {};
  },
  methods: {},

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
}
</style>