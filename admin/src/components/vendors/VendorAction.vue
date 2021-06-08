<template lang="pug">
.action
  .action__title Action
  .action__row
    //.action__icon
    //  i.fas.fa-info-circle
    .action__icon
      i.fa.fa-envelope(@click="openPreview")
    //.action__icon
    //  i.fab.fa-slack-hash
    .action__icon(@click="goToVendor")
      i.fas.fa-sign-in-alt

</template> 
<script>
export default {
  methods:{
    openPreview(){
      this.$emit("openPreview");
    },
    goToVendor() {
      this.$emit("openVendor");
    },
  }
};
</script>
<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.action {
  min-height: 60px;
  margin-bottom: 40px;
  background: #fff;
  padding: 20px;

  &__title {
    font-size: 21px;
    border-bottom: 1px solid #c5bfb5;
    padding-bottom: 5px;
  }

  &__row {
    display: flex;
    padding-top: 20px;
  }

  &__icon {
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 28px;

    i {
      font-size: 18px;
      cursor: pointer;
    }
    
    .fa-slack {
      border: 1px solid $light-brown;
      border-radius: 5px;
    }

  }
}
</style>