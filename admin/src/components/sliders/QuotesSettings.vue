<template lang="pug">
.adminNavbar__slider.slider
    span QUOTES
    .slider-inner
        .slider-col(@click="showLanguagesSettings" :class="{languagesBg: languagesBgBool}") TEST1
        .slider-col(@click="showServicesSettings" :class="{languagesBg: servicesBgBool}") TEST2
        .slider-col(@click="showIndustriesSettings" :class="{languagesBg: industiesBgBool}") TEST3
</template>

<script>
export default {
  data() {
    return {
      languagesSettingsVisible: false,
      languagesBgBool: false,
      servicesSettingsVisible: false,
      servicesBgBool: false,
      industiesSettingsVisible: false,
      industiesBgBool: false
    };
  },
  methods: {
    showIndustriesSettings() {
      this.industiesSettingsVisible = !this.industiesSettingsVisible;
      this.industiesBgBool = !this.industiesBgBool;
      if (this.languagesSettingsVisible || this.servicesSettingsVisible) {
        this.languagesSettingsVisible = false;
        this.servicesSettingsVisible = false;
      }
      this.languagesBgBool = false;
      this.servicesBgBool = false;
    },
    showServicesSettings() {
      this.servicesSettingsVisible = !this.servicesSettingsVisible;
      this.servicesBgBool = !this.servicesBgBool;
      if (this.languagesSettingsVisible || this.industiesSettingsVisible) {
        this.languagesSettingsVisible = false;
        this.industiesSettingsVisible = false;
      }
      this.languagesBgBool = false;
      this.industiesBgBool = false;
    },
    showLanguagesSettings() {
      this.languagesSettingsVisible = !this.languagesSettingsVisible;
      this.languagesBgBool = !this.languagesBgBool;
      this.servicesBgBool = false;
      this.industiesBgBool = false;
      if (this.servicesSettingsVisible || this.industiesSettingsVisible) {
        this.servicesSettingsVisible = false;
        this.industiesSettingsVisible = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.adminNavbar {
  position: relative;
  display: flex;
  min-height: 94vh;
  &__slider {
    // transform: translate(-50%);
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
