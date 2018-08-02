<template lang="pug">
.clients
  .adminNavbar__slider.slider
    span CLIENTS
    .slider-inner
      .slider-col General Information
  .clients__data
    .title General Information
    .gen-info
      .gen-info__block
        .block-item
          label Company Name:
          input(type="text")
        .block-item
          label Website:
          input(type="text")
        .block-item
          label Industry:
          input(type="text")
        .block-item
          label Status:
          input(type="text")
      .gen-info__block
        .block-item
          label Contract:
          .contract
            .contract__upload
              input.upload(type="file")
            .contract__download
              img(src="../../assets/images/Other/upload-icon.png")
          label NDA:
          .contract
            .contract__upload
              input.upload(type="file")
            .contract__download
              img(src="../../assets/images/Other/upload-icon.png")
        .block-item
          label Account Manager:
          input(type="text")
        .block-item
          label Sales Manager:
          input(type="text")
        .block-item
          label Project Manager:
          input(type="text")

</template>

<script>
export default {
  data() {
    return {
      
    };
  },
  methods: {
    
  }
};
</script>

<style lang="scss" scoped>
.clients {
  display: flex;
  &__data {
    margin-top: 20px;
    margin-left: 20px;
  }
}
.gen-info {
  margin: 20px 10px;
  padding: 40px;
  box-shadow: 0 0 15px #67573e9d;
  width: 800px;
  display: flex;
  justify-content: space-between;
  &__block {
    width: 40%;
  }
}
.block-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  label {
    margin-bottom: 0;
  }
  input {
    border: 1px solid #67573e;
    border-radius: 10px;
    width: 191px;
    height: 28px;
  }
}
.contract {
  display: flex;
  align-items: center;
  width: 22%;
  justify-content: space-between;
  &__upload {
    position: relative;
    background: url("../../assets/images/Other/upload-icon.png");
    background-repeat: no-repeat;
    width: 40%;
    height: 22px;
    overflow: hidden;
    .upload {
      padding-left: 0;
      padding-right: 0;
      width: 33px;
      height: 22px;
      border: none;
      outline: none;
      margin-top: -3px;
      margin-right: 2px;
      opacity: 0;
      z-index: 2;
      position: absolute;
      cursor: pointer;
      left: -10px;
    }
  }
  &__download {
    width: 40%;
    cursor: pointer;
  }
}
.adminNavbar {
  position: relative;
  display: flex;
  min-height: 94vh;
  &__sideBar {
    padding: 35px 0;
    background-color: #998e7e;
    width: 150px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    box-shadow: 4px 6px 8px rgba(103, 87, 62, 0.4);
    transition: all 0.5s;
    z-index: 2;
  }

  &__slider {
    height: 100%;
    // transform: translate(-50%);
    background-color: #fff;
    width: 175px;
    // width: 216px;
    box-shadow: 7px 1px 10px rgba(103, 87, 62, 0.4);
    display: flex;
    flex-direction: column;
    font-family: MyriadPro;
    color: #67573e;
    font-size: 22px;
    transition: all 1s;
    span {
      display: flex;
      justify-content: center;
      padding: 44px 0;
      font-weight: 700;
    }

    .slider-inner {
      display: flex;
      flex-direction: column;

      .slider-col {
        display: flex;
        justify-content: center;
        border-top: 1px solid #c4beb6;
        border-bottom: 1px solid #c4beb6;
        padding: 5px 0;
        background-color: #c4beb6;
        font-size: 18px;
        cursor: pointer;
      }
    }
  }
  .slider {
    transform: translate(-3%);
    background-color: #fff;
  }
}

</style>
