<template lang="pug">
    .general-info
        .general-info__block
            .block-item
                label.block-item__label.block-item_relative Company Name:
                    Asterisk(:customStyle="asteriskStyle")
                input(type="text" placeholder="Company Name" :value="currentClient.name" @change="(e) => changeProperty(e, 'name')" :class="{'general-info_error-shadow': !currentClient.name && isSaveClicked}")
            .block-item
                label.block-item__label Website:
                input(type="text" placeholder="Website" :value="currentClient.website" @change="(e) => changeProperty(e, 'website')")
            .block-item
                label.block-item__label.block-item_relative Industry:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop.block-item_high-index(:class="{'general-info_error-shadow': isSaveClicked && !currentClient.industries.length}")
                    MultiClientIndustrySelect(:selectedInd="currentClient.industries" :filteredIndustries="selectedIndNames" @chosenInd="setIndustries")
        
        .general-info__block
            .block-item
                label.block-item__label.block-item_relative Time Zone:
                .block-item__drop.block-item_medium-index
                    SelectSingle(
                        :hasSearch="true"
                        placeholder="Select"
                        :selectedOption="currentClient.hasOwnProperty('timeZone') ? currentClient.timeZone.zone : currentZone"
                        :options="timezoneData"
                        @chooseOption="setTimezone"
                        @scrollDrop="scrollDrop"
                    )
            .block-item
                label.block-item__label.block-item_relative Native Language: 
                .block-item__drop
                    SelectSingle(
                        :hasSearch="true"
                        placeholder="Select"
                        :selectedOption="currentClient.hasOwnProperty('nativeLanguage') ? currentClient.nativeLanguage.lang : currentLanguage"
                        :options="languageData"
                        @chooseOption="setLanguage"
                        @scrollDrop="scrollDrop"
                    )
</template>

<script>
import Asterisk from "@/components/Asterisk";
import ClientStatusSelect from "../ClientStatusSelect";
import MultiClientIndustrySelect from "../MultiClientIndustrySelect";
import AMSelect from "../AMSelect";
import scrollDrop from "@/mixins/scrollDrop";
import SelectSingle from "../../SelectSingle";

import { mapGetters, mapActions } from "vuex";

export default {
  mixins: [scrollDrop],
  props: {
    isSaveClicked: {
      type: Boolean
    },
    languages: {
      type: Array
    },
    timezones: {
      type: Array
    }
  },
  data() {
    return {
      asteriskStyle: { top: "-4px" },
      currentZone: "",
      currentLanguage: ""
    };
  },
  methods: {
    ...mapActions(["storeClientProperty", "updateClientStatus", "alertToggle"]),
    changeProperty(e, prop) {
      this.storeClientProperty({ prop, value: e.target.value });
    },
    setIndustries({ industry }) {
      let industries = [...this.currentClient.industries];
      const position = industries.findIndex(item => item._id === industry._id);
      if (position !== -1) {
        industries.splice(position, 1);
      } else {
        industries.push(industry);
      }
      this.storeClientProperty({ prop: "industries", value: industries });
    },
    setLanguage({ option }) {
      this.currentLanguage = option;
      const lang = this.languages.find(item => item.lang == option);
      this.storeClientProperty({ prop: "nativeLanguage", value: lang });
    },
    setTimezone({ option }) {
      this.currentZone = option;
      const timezone = this.timezones.find(item => item.zone == option);
      this.storeClientProperty({ prop: "timeZone", value: timezone });
    }
  },
  computed: {
    ...mapGetters({
      currentClient: "getCurrentClient"
    }),
    languageData() {
      if (this.languages) {
        return this.languages.map(item => item.lang);
      }
    },
    timezoneData() {
      if (this.timezones) {
        return this.timezones.map(item => item.zone);
      }
    },
    selectedIndNames() {
      let result = [];
      if (
        this.currentClient.industries &&
        this.currentClient.industries.length
      ) {
        for (let industry of this.currentClient.industries) {
          result.push(industry.name);
        }
      }
      return result;
    }
  },
  components: {
    Asterisk,
    ClientStatusSelect,
    AMSelect,
    MultiClientIndustrySelect,
    SelectSingle
  }
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.general-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  &__block {
    width: 35%;
  }
  &_error-shadow {
    box-shadow: 0 0 5px $red;
  }
}
.block-item:last-child {
  margin-bottom: 0px;
}

.block-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  &__check-item {
    width: 190px;
  }
  &__label {
    margin-bottom: 0;
  }
  &_relative {
    position: relative;
  }
  &__drop {
    position: relative;
    width: 191px;
    height: 28px;
  }
  &_high-index {
    z-index: 10;
  }
  &_medium-index {
    z-index: 8;
  }
  input {
    font-size: 14px;
    color: #67573e;
    border: 1px solid #67573e;
    border-radius: 5px;
    box-sizing: border-box;
    padding: 0 5px;
    outline: none;
    width: 191px;
    height: 30px;
  }
  ::-webkit-input-placeholder {
    opacity: 0.5;
  }
}
.contract,
.nda {
  display: flex;
  align-items: center;
  width: 22%;
  justify-content: space-between;
  &__upload {
    position: relative;
    background: url("../../../assets/images/Other/upload-icon.png");
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
      left: -10px;
      cursor: pointer;
      font-size: 0;
    }
  }
  &__download {
    width: 40%;
    cursor: pointer;
  }
}
</style>
