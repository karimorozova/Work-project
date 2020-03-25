<template lang="pug">
    .vendor-lqa
        span.vendor-lqa__close(@click="close") +
        h3.vendor-lqa__title Vendor LQA
        .vendor-lqa__main
            .vendor-lqa__item
                LabelVal(text="Vendor:" customClass="new-chart-label start-justified")
                    .vendor-lqa__value(v-if="vendorData") {{ vendorData.vendor.name }}
            .vendor-lqa__item
                LabelVal(text="Target Language:" customClass="new-chart-label start-justified")
                    .vendor-lqa__value(v-if="vendorData") {{ vendorData.vendor.language.lang }}
            .vendor-lqa__item
                LabelVal(text="Industry:" customClass="new-chart-label start-justified")
                    .vendor-lqa__value {{ vendorData.industry }}
            .vendor-lqa__item
                LabelVal(text="LQA#:" customClass="new-chart-label start-justified")
                    .vendor-lqa__value {{ lqa }}
            .vendor-lqa__item
                LabelVal(text="Grade:" customClass="new-chart-label start-justified")
                    input.vendor-lqa__text(type="text" :value="grade" @input="setGrade" :class="{'vendor-lqa_red-border': isGradeEmpty}")
                    .vendor-lqa__upload(v-if="uploadForm")
                        input.vendor-lqa__load-file(type="file" id="file" ref="file" @change="uploadDocument()")
                .vendor-lqa__error-message(v-if="isGradeEmpty") Grade field shouldn't be empty
                .vendor-lqa__error-message(v-if="!isFile") Upload file
        .vendor-lqa__buttons
            .vendor-lqa__button 
                Button(value="Save" @clicked="checkErrors")
            .vendor-lqa__button
                Button(value="Cancel" @clicked="close")
</template>

<script>
import LabelVal from "@/components/LabelVal";
import SelectSingle from "@/components/SelectSingle";
import Button from "@/components/Button";

export default {
  props: {
    vendorData: { type: Object },
    languages: { type: Array, default: () => [] },
    uploadForm: { type: Boolean, default: false }
  },
  data() {
    return {
      grade: "",
      currentFile: "",
      isGradeEmpty: false,
      isFile: true
    };
  },
  methods: {
    close() {
      this.$emit("closeForm");
    },
    uploadDocument() {
      this.currentFile = this.$refs.file.files[0];
      this.isFile = true;
    },
    setGrade(e) {
      this.isGradeEmpty = false;
      const { value } = e.target;
      const regex = /^[0-9]+$/;
      let characters = value.split("").filter(item => regex.test(item));
      characters = characters[0] === "0" ? characters.slice(1) : characters;
      const clearedValue = characters.join("");
      const gradeValue = +clearedValue > 100 ? 100 : clearedValue;
      e.target.value = gradeValue;
      this.grade = gradeValue;
    },
    checkErrors() {
      if (!this.grade) {
        return (this.isGradeEmpty = true);
      }
        
      if (this.uploadForm) {
        if(!this.currentFile) return this.isFile = false;
        this.$emit("saveVendorLqa", {
          vendorData: { ...this.vendorData, grade: this.grade, lqa: this.lqa, file: this.currentFile }
        });
      } else {
        this.$emit("saveVendorLqa", {
          vendorData: { ...this.vendorData, grade: this.grade, lqa: this.lqa }
        });
      }
    }
  },
  computed: {
    lqa() {
      if(this.vendorData.isTqi) return "tqi";
      let result = "lqa1";
      if (this.vendorData) {
        result =
          !this.vendorData.isLqa1 && this.vendorData.isLqa2 ? "lqa2" : result;
        result = result !== "lqa2" && this.vendorData.isLqa3 ? "lqa3" : result;
      }
      return result;
    }
  },
  components: {
    LabelVal,
    SelectSingle,
    Button
  }
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.vendor-lqa {
  width: 350px;
  position: absolute;
  top: 35%;
  left: 50%;
  margin-left: -175px;
  background-color: $white;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid $main-color;
  box-shadow: 0 0 10px $main-color;
  z-index: 10;
  &__close {
    position: absolute;
    top: 0;
    right: 10px;
    font-size: 28px;
    font-weight: 700;
    transform: rotate(45deg);
    cursor: pointer;
  }
  &__title {
    text-align: center;
  }
  &__main {
    display: flex;
    flex-direction: column;
  }
  &__item {
    margin-bottom: 15px;
    position: relative;
  }
  &__value {
    margin-left: 10px;
    font-weight: 600;
  }
  &__text {
    outline: none;
    border: 1px solid $main-color;
    border-radius: 10px;
    box-sizing: border-box;
    padding: 5px;
    color: $main-color;
    margin-left: 10px;
    width: 100px;
  }
  &_red-border {
    border-color: $red;
  }
  &__buttons {
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin-top: 20px;
  }
  &__error-message {
    color: $red;
    position: absolute;
    margin-top: 5px;
  }
  &__upload {
    position: relative;
    background: url("../../../assets/images/upload-blue.png");
    background-position: center;
    background-repeat: no-repeat;
    height: 21px;
    width: 21px;
    overflow: hidden;
    vertical-align: sub;
    margin-left: 50px;
    display: inline-block;
  }
  &__load-file {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    opacity: 0;
    z-index: 2;
    position: absolute;
    cursor: pointer;
    font-size: 0;
  }
}
</style>
