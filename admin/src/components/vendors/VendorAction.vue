<template lang="pug">
.action
  .action__title Action
  .action__row
    .action__icon
      i.fa.fa-info-circle
    .action__icon
      i.fa.fa-envelope(@click="openPreview")
    .action__icon
      i.fa.fa-slack

</template> 
<script>
export default {
  methods:{
    openPreview(){
      this.$emit("openPreview");
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.action {
  min-height: 60px;
  margin-bottom: 40px;
  width: 309px;
  background: #fff;
  box-shadow: 0 0 15px #67573e9d;
  padding: 20px;

  &__title {
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #67573e;
    padding-bottom: 5px;
  }

  &__row {
    display: flex;
    padding-top: 15px;
  }

  &__icon {
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 28px;

    i {
      font-size: 24px;
      cursor: pointer;
    }
    
    .fa-slack {
      border: 1px solid $light-brown;
      border-radius: 5px;
    }

  }
}
</style>