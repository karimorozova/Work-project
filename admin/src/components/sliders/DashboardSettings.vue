<template lang="pug">
.admminportalWrapper2
  .adminMainWrapper
    .adminNavbar
      .adminNavbar__slider(:class="{slider: slidebarVisible}")
          span SETTINGS
          .slider-inner
            .slider-col(@click="showLanguagesSettings" :class="{languagesBg: languagesBgBool}") Languages
            .slider-col(@click="showServicesSettings" :class="{languagesBg: servicesBgBool}") Services
            .slider-col(@click="showIndustriesSettings" :class="{languagesBg: industiesBgBool}") Industries
      .adminMainWrapper__inner(:class='{"adminMainWrapper__open": slidebarVisible}')
        .breadCrumbs 
          span {{ path }}
        .maininfoWrapper(v-if="languagesSettingsVisible")
          .mainInfo
            .adminAll
              .quotesComponent
                .adminAll__dropMenu.openQuotes(:class="{borderAngle: openQuotes}") 
                  .adminAll__dropMenu_item.quotesTable(v-if="openQuotes")
                    TableLanguages
        .maininfoWrapper(v-if="servicesSettingsVisible")
          .mainInfo
            .adminAll
              .quotesComponent.additionalServices
                .adminAll__dropMenu.openQuotes(:class="{borderAngle: openQuotes}") 
                  .adminAll__dropMenu_item.quotesTable(v-if="openQuotes")
                    TableServices
        .maininfoWrapper(v-if="industiesSettingsVisible")
          .mainInfo
            .adminAll
              .quotesComponent.additionalIndustries
                .adminAll__dropMenu.openQuotes(:class="{borderAngle: openQuotes}") 
                  .adminAll__dropMenu_item.quotesTable(v-if="openQuotes")
                    TableIndustries
</template>

<script>
import TableLanguages from "../Table/TableLanguages";
import TableServices from "../Table/TableServices.vue";
import TableIndustries from "../Table/TableIndustries";

export default {
  props: {
    sliderBool: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      languagesSettingsVisible: false,
      languagesBgBool: false,
      servicesSettingsVisible: false,
      servicesBgBool: false,
      industiesSettingsVisible: false,
      industiesBgBool: false,
      openQuotes: true,
      path: "",
      slidebarVisible: this.sliderBool
    };
  },
  methods: {
    showIndustriesSettings() {
      this.industiesSettingsVisible = true;
      this.industiesBgBool = true;
      if (this.languagesSettingsVisible || this.servicesSettingsVisible) {
        this.languagesSettingsVisible = false;
        this.servicesSettingsVisible = false;
      }
      this.languagesBgBool = false;
      this.servicesBgBool = false;
      this.path = "Industries Settings";
    },
    showServicesSettings() {
      this.servicesSettingsVisible = true;
      this.servicesBgBool = true;
      if (this.languagesSettingsVisible || this.industiesSettingsVisible) {
        this.languagesSettingsVisible = false;
        this.industiesSettingsVisible = false;
      }
      this.languagesBgBool = false;
      this.industiesBgBool = false;
      this.path = "Services Settings";
    },
    showLanguagesSettings() {
      this.languagesSettingsVisible = true;
      this.languagesBgBool = true;
      this.servicesBgBool = false;
      this.industiesBgBool = false;
      if (this.servicesSettingsVisible || this.industiesSettingsVisible) {
        this.servicesSettingsVisible = false;
        this.industiesSettingsVisible = false;
      }
      this.path = "Language Settings";
    }
  },
  components: {
    TableLanguages,
    TableServices,
    TableIndustries
  },
  watch: {
    sliderBool(){
      this.slidebarVisible = this.sliderBool;
    }
  }
};
</script>

<style lang="scss" scoped>
.adminportalWrapper2 {
  margin: 0 auto;
  overflow: auto;
}
.quotesComponent {
  width: 1000px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.quotesComponent {
  background-color: #fff;
}
.additionalServices {
  width: 800px;
}
.additionalIndustries {
  width: 800px;
}

.adminMainWrapper {
  display: flex;
  min-height: 94vh;
  position: relative;
  &__inner {
    width: 90%;
    // transition: all 1s;
    // transform: translate(-150px);
    transform: translate(7px);
  }
  &__open {
    // transform: translate(0px);
    transform: translate(15px);
  }
  .maininfoWrapper {
    width: 100%;
    padding-left: 23px;
  }

  .detailedInfoWrapper {
    max-width: 919px;
    margin: 0 auto;
    width: 100%;
  }

  .detailedProjectWrapper {
    max-width: 919px;
    margin: 0 auto;
    width: 100%;
  }

  .mainInfo {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
    .buttonPanel {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 5%;

      button {
        color: #fff;
        font-size: 15px;
        box-shadow: 0 5px 8px rgba(103, 87, 62, 0.5);
        background-color: #f5876e;
        border-radius: 18px;
        border: none;
        width: 180px;
        height: 43px;
        margin: 15px 18px 0;
        outline: none;
        cursor: pointer;
      }
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
      transform: translate(-100%);
      background-color: #fff;
      // width: 175px;
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
          padding: 5px 30px;
          cursor: pointer;
          &:nth-child(2) {
            border: none;
          }
        }
      }
    }
    .slider {
      transform: translate(0%);
      background-color: #fff;
    }

    &__openHide {
      background: rgb(245, 135, 110);
      color: white;
      width: 27px;
      height: 38px;
      top: 0;
      right: 0px;
      text-align: center;
      cursor: pointer;
      z-index: 1;
      .icon {
        font-size: 32px;
      }
      .openReverse {
        transform: rotate(180deg);
      }
    }
    .navbar__ulist {
      list-style: none;
      font-size: 15px;
      font-weight: bold;
      padding: 0;
      width: 100%;

      &_item {
        padding-bottom: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
        cursor: pointer;
        transition: all 0.4s;
        &:last-child {
          margin-bottom: 40px;
          @media (max-height: 768px) {
            margin-bottom: 57px;
          }
        }

        .intothelist {
          margin-bottom: 78%;
        }
        .title {
          transition: all 0.4s;
          opacity: 0;
          color: #fff;
        }
        .showTitle {
          opacity: 1;
        }
      }
      .active {
        background-color: white;
        .title {
          color: #978d7e;
        }
      }

      .activeSecondLi {
        li {
          &:nth-child(2) {
            background-color: white;
            .title {
              color: #978d7e;
            }
          }
        }
      }
    }
  }

  .adminAll {
    display: flex;
    flex-direction: column;
    align-items: center;
    &__dropMenu {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      border: 0.4px solid #67573e;
      border-radius: 18px;
      box-shadow: 0 3px 13px rgba(0, 0, 0, 0.3);
      margin-right: 36px;
      margin-bottom: 10px;
      padding: 0 14px;
      color: #67573e;
      transition: all 0.2s;
      &_select {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 1.5%;
        cursor: pointer;
      }
      &_item {
        width: 100%;
        padding: 1.5% 0.5% 1.5% 0;
        transition: all 0.4s;
      }
      .reverseImage {
        transform: rotate(180deg);
      }
    }
  }
  .borderAngle {
    border-radius: 0;
    border: none;
    margin-bottom: 0;
  }
}

.breadCrumbs {
  padding: 20px 40px 20px 25px;
  color: #67573e;
  font-size: 20px;
  .arrows {
    font-size: 16px;
    opacity: 0.6;
    margin: 0 10px;
  }
}

@font-face {
  font-family: MyriadPro;
  src: url("../../assets/fonts/MyriadPro-Regular.otf");
}
@font-face {
  font-family: MyriadBold;
  src: url("../../assets/fonts/MyriadPro-Bold.otf");
}

.languagesBg {
  background-color: #ddd3c8;
}
.none_langBg {
  background-color: #fff;
}
</style>
