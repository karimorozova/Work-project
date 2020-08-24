<template lang="pug">
    .general-info
        .general-info__block
            .block-item
                label.block-item__label.block-item_relative Company Name:
                    Asterisk(:customStyle="asteriskStyle")
                input(type="text" placeholder="Company Name" v-model="client.name" :class="{'general-info_error-shadow': !client.name && isSaveClicked}")
            .block-item
                label.block-item__label.block-item_relative Official Company Name:
                input(type="text" placeholder="Official Company Name" v-model="client.officialCompanyName")
            .block-item
                label.block-item__label.block-item_relative Email:
                    Asterisk(:customStyle="asteriskStyle")
                input(type="text" placeholder="Email" v-model="client.email" :class="{'general-info_error-shadow': !client.email && isSaveClicked}")
            .block-item
                label.block-item__label Website:
                input(type="text" placeholder="Website" v-model="client.website")
            .block-item
                label.block-item__label.block-item_relative Industry:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop.block-item_high-index(:class="{'general-info_error-shadow': isSaveClicked && !client.industries.length}")
                    MultiClientIndustrySelect(:selectedInd="client.industries" :filteredIndustries="selectedIndNames" @chosenInd="setIndustries")
        .general-info__block
            .block-item
                label.block-item__label.block-item_relative Time Zone:
                .block-item__drop.block-item_medium-index
                    SelectSingle(
                        :hasSearch="true"
                        placeholder="Select"
                        :selectedOption="client.hasOwnProperty('timeZone') ? client.timeZone.zone : currentZone"
                        :options="timezoneData"
                        @chooseOption="setTimezone"
                    )
            .block-item
                label.block-item__label.block-item_relative Native Language: 
                .block-item__drop
                    SelectSingle(
                        :hasSearch="true"
                        placeholder="Select"
                        :selectedOption="client.hasOwnProperty('nativeLanguage') ? client.nativeLanguage.lang : currentLanguage"
                        :options="targetLanguages"
                        @chooseOption="setLanguage"
                    )
            .block-item
                label.block-item__label.block-item_relative Source Languages:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop(:class="{'general-info_error-shadow': isSaveClicked && !client.sourceLanguages.length}")
                    SelectMulti(
                      placeholder="Select"
                      :hasSearch="true"
                      :selectedOptions="client.hasOwnProperty('sourceLanguages') ? makeStringLanguage(client.sourceLanguages) : makeStringLanguage(currentSourceLanguages)"
                      :options="sourceLanguages | firstEnglishLanguage"
                      @chooseOptions="setSource"
                    )
            .block-item
                label.block-item__label.block-item_relative Target Languages:
                    Asterisk(:customStyle="asteriskStyle")
                .block-item__drop(:class="{'general-info_error-shadow': isSaveClicked && !client.targetLanguages.length}")
                    SelectMulti(
                      placeholder="Select"
                      :hasSearch="true"
                      :selectedOptions="client.hasOwnProperty('targetLanguages') ? makeStringLanguage(client.targetLanguages) : makeStringLanguage(currentTargetLanguages)"
                      :options="targetLanguages"
                      @chooseOptions="setTarget"
                    )
</template>

<script>
import Asterisk from "@/components/Asterisk";
import ClientStatusSelect from "../ClientStatusSelect";
import MultiClientIndustrySelect from "../MultiClientIndustrySelect";
import AMSelect from "../AMSelect";
import scrollDrop from "@/mixins/scrollDrop";
import SelectSingle from "../../SelectSingle";
import SelectMulti from "../../SelectMulti";

export default {
  mixins: [scrollDrop],
  props: {
    client: {
      type: Object
    },
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
      currentLanguage: "",
      currentSourceLanguages: [],
      currentTargetLanguages: []
    };
  },
  methods: {
    setIndustries({ industry }) {
      if (!this.client.industries.length) {
        return this.client.industries.push(industry);
      }
      const position = this.client.industries.findIndex(
        item => item._id === industry._id
      );
      if (position !== -1) {
        return this.client.industries.splice(position, 1);
      }
      this.client.industries.push(industry);
    },
    makeStringLanguage(langArray) {
      return langArray.map(item => item.lang);
    },
    setLanguage({ option }) {
      this.currentLanguage = option;
      const lang = this.languages.find(item => item.lang == option);
      this.client.nativeLanguage = lang;
    },
    setTimezone({ option }) {
      this.currentZone = option;
      const timezone = this.timezones.find(item => item.zone == option);
      this.client.timeZone = timezone;
    },
    setTarget({ option }) {
      if (!this.client.targetLanguages.length) {
        const lang = this.languages.find(item => item.lang === option);
        return this.client.targetLanguages.push(lang);
      }
      const position = this.client.targetLanguages
        .map(item => item.lang)
        .indexOf(option);

      if (position !== -1) {
        return this.client.targetLanguages.splice(position, 1);
      } else {
        const lang = this.languages.find(item => item.lang === option);
        return this.client.targetLanguages.push(lang);
      }
    },
    setSource({ option }) {
      if (!this.client.sourceLanguages.length) {
        const lang = this.languages.find(item => item.lang === option);
        return this.client.sourceLanguages.push(lang);
      }
      const position = this.client.sourceLanguages
        .map(item => item.lang)
        .indexOf(option);

      if (position !== -1) {
        return this.client.sourceLanguages.splice(position, 1);
      } else {
        const lang = this.languages.find(item => item.lang === option);
        return this.client.sourceLanguages.push(lang);
      }
    },
  },
  computed: {
    sourceLanguages(){
      if (this.languages) {
        return this.languages.map(item => item.lang);
      }
    },
    targetLanguages() {
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
      if (this.client.industries && this.client.industries.length) {
        for (let ind of this.client.industries) {
          result.push(ind.name);
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
    SelectSingle,
    SelectMulti
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
    width: 38%;
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
  margin-bottom: 26px;
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
