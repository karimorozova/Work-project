<template lang='pug'>
  .upload-btn
    .upload-btn__txt Upload files(s)
    input(name="files" type="file")
</template>

<script>


export default {
  props: {
    title: {
      type: String,
      default: 'Title' 
    },
  },
  data () {
      return {

      }
  },
  watch: {

  },
  computed: {

  },
  methods: {

  },
  mounted () {
    // this.init()
  }
}
</script>

<style lang='scss'>
.upload-btn{
    overflow: hidden;
    position: relative;
    width: 170px;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
    background-color: #FF876C;
    &:hover {
    box-shadow: 0 0px 5px rgba(0, 0, 0, 0.4);      
    }
    .upload-btn__txt {
        z-index: 1;
        position: relative;
        color: #fff;
        font-size: 14px;
        font-family: MyriadPro;
        text-align: center;
        text-shadow: 0 1px 1px #000;
    }
    input {
        top: -10px;
        right: -40px;
        z-index: 2;
        position: absolute;
        cursor: pointer;
        opacity: 0;
        filter: alpha(opacity=0);
        font-size: 50px;
    }
}
</style>
