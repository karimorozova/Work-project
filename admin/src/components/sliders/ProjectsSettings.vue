<template lang="pug">
.projects-wrap
  .adminNavbar__slider.slider
    span PROJECTS
    .slider-inner
      .slider-col TEST1
      .slider-col TEST2
      .slider-col TEST3
  .projects-table
    Allprojects
</template>

<script>
import Allprojects from '../projects/Allprojects';

export default {
  data() {
    return {
      
    };
  },
  methods: {
    
  },
  components: {
    Allprojects
  }
};
</script>

<style lang="scss" scoped>

.projects-wrap {
  min-height: 94vh;
  display: flex;
}

.adminNavbar {
  position: relative;
  display: flex;
  height: 100%;
  &__slider {
    height: 100%;
    background-color: #fff;
    width: 175px;
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
        cursor: pointer;
        &:nth-child(2) {
          border: none;
        }
      }
    }
  }
  .slider {
    transform: translate(-3%);
    background-color: #fff;
  }
}
</style>
