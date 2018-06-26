<template lang="pug">
.servicesWrapper
  table
    tr
      th(v-for="(headItem, key) in table.head" :class='"th__col-" + (key + 1)') {{ headItem.title }}
    .bodyWrapper
      tr.rbody(v-for="(bodyItem, ind) in table.body" :class='"tr__row-" + (ind + 1)' )
        td.data1
          button(:style='{backgroundImage: "url(" + bodyItem.image1 + ")"}')
          button.upload1(v-if="disableButton")
          input.upload(v-if="disableButton" @change="uploadFile" :readonly="true" type="file" name="uploadedFile")
        td.data2
          input.inprow2(v-model="bodyItem.title1" :readonly="declineReadonly[ind]")
        LanguageForm(:isActiveUpload="bodyItem.isActiveUpload" @sendToParentM="getLangFormData" @sendToParentDuo="getLangFormData")
        CalculationUnite(:isActiveUpload="bodyItem.isActiveUpload" @calcSendFirst="getCalcFormData" @calcSendSecond="getCalcFormData" @calcSendThird="getCalcFormData")
        ServicesSelect(:isActiveUpload="bodyItem.isActiveUpload" @sendActiveStatusY="getActiveStatusFormData" @sendActiveStatusN="getActiveStatusFormData")
        td.data6
          button.saveB(@click="sendData(ind)" :disabled="!disableButton" :class="{data6_active: bodyItem.activeTools[0]}")
          button.editB(@click="edit(ind)" :class="{data6_active: bodyItem.activeTools[1]}")
          button.removeB(@click="removeRow(ind)" :class="{data6_active: bodyItem.activeTools[2]}")
  button.addLang(@click="addLang" :disabled="disableButton")
</template>

<script>
import ServicesSelect from "./servicesRows/ServicesTableSelect";
import ServicesTableImage from "./servicesRows/ServicesTableImage";
import ServicesRowEdit from "./servicesRows/ServicesRowEdit";
import CalculationUnite from "./servicesRows/CalculationUnite";
import LanguageForm from "./servicesRows/LanguageForm";
import SharedSelect from "./servicesRows/SharedSelect";

const rowNew = {
  activeTools: [false, true, false],
  isActiveUpload: true,
  image1: "",
  image2: require("../../assets/images/Other/upload-icon.png"),
  title: "",
  title: "",
  title: "",
  title: "",
  title: ""
};

export default {
  props: {},
  data() {
    return {
      table: {
        head: [
          { title: "Icon" },
          { title: "Name" },
          { title: "Language Form" },
          { title: "Calculation Utin" },
          { title: "Active" },
          { title: "" }
        ],
        body: [
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/services/SEO _ Blog Management.png"),
            title1: "SEO & Blog Management",
            title2: "test",
            title3: "test",
            title4: "test",
            title5: ""
          },
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/services/QA and Testing.png"),
            title1: "QA & Testing",
            title2: "test",
            title3: "test",
            title4: "test",
            title5: ""
          },
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/services/Localized Graphic Design.png"),
            title1: "Localized Graphic Design",
            title2: "testtest",
            title3: "test",
            title4: "test",
            title5: ""
          },
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/services/Marketing _ Copywriting.png"),
            title1: "Marketing _ Copywriting",
            title2: "test",
            title3: "test",
            title4: "test",
            title5: ""
          },
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/services/Market Research.png"),
            title1: "Market Research",
            title2: "test",
            title3: "test",
            title4: "test",
            title5: ""
          },
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/services/Official Translations.png"),
            title1: "Official Translations",
            title2: "test",
            title3: "test",
            title4: "test",
            title5: ""
          },
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/services/ORM – Online Reputation Management.png"),
            title1: "ORM – Online Reputation Management",
            title2: "test",
            title3: "test",
            title4: "test",
            title5: ""
          }
        ]
      },
      disableButton: false,
      uploadedFile: [],
      nameTitle: '',
      languageFormValue: '',
      selectBool: ['Yes', 'No'],
      calcFormValue: '',
      activeFormValue: '',
      declineReadonly: [true, true, true, true, true, true, true]
    };
  },
  methods: {
    addLang() {
      this.table.body.push(rowNew);
      this.disableButton = true;
    },
    edit(ind) {
      // console.log("Edit row " + ind);
      this.disableButton = true;
      this.table.body[ind].isActiveUpload = true;
      this.declineReadonly[ind] = false;

      this.table.body[ind].activeTools.splice(0, 1, false);
      this.table.body[ind].activeTools.splice(1, 1, true);
      this.table.body[ind].activeTools.splice(2, 1, false);
    },
    uploadFile(event) {
      this.upload = event.target.files[0];
    },
    removeRow(ind) {
      this.table.body.splice(ind, 1);
    },
    getLangFormData(data) {
      // console.log(data);
      this.languageFormValue = data;
    },
    getCalcFormData(data){
      // console.log(data);
      this.calcFormValue = data;
    },
    getActiveStatusFormData(data){
      // console.log(data);
      this.activeFormValue = data;
    },
    async sendData(idx){
      console.log(idx)
      let totalData = {
        nameTitle: this.table.body[idx].title1,
        languageFormValue: this.languageFormValue,
        calcFormValue: this.calcFormValue,
        uploadedFile: this.uploadFile,
        activeFormValue: this.activeFormValue
      };
      console.log(totalData);
    }
  },

  computed: {},
  components: {
    ServicesTableImage,
    ServicesSelect,
    ServicesRowEdit,
    CalculationUnite,
    LanguageForm,
    SharedSelect
  }
};
</script>

<style lang="scss" scoped>
.servicesWrapper {
  table {
    width: 100%;
    border: 1px solid #9a8f80;
    font-size: 14px;
    tr {
      display: flex;
      th {
        background-color: #9a8f80;
        color: #fff;
        font-size: 14px;
        border-right: 2px solid #fff;
        padding: 5px 0 5px 10px;
        font-weight: normal;
      }
      .th__col-1 {
        flex-basis: 11.7%;
      }
      .th__col-2 {
        flex-basis: 27.5%;
      }
      .th__col-3 {
        flex-basis: 16%;
      }
      .th__col-4 {
        flex-basis: 16%;
      }
      .th__col-5 {
        flex-basis: 16%;
      }
      .th__col-6 {
        flex-basis: 18.5%;
        border-right: none;
      }
      .upload {
        padding-left: 0;
        padding-right: 0;
        width: 22px;
        border: none;
        outline: none;
        margin-top: -3px;
        margin-right: 2px;
        cursor: pointer;
        overflow: hidden;
        opacity: 0;
        position: absolute;
        top: 12px;
        left: 55px;
      }
      .upload1 {
        background-image: url("../../assets/images/Other/upload-icon.png");
        padding-left: 0;
        padding-right: 0;
        border: none;
        outline: none;
        // margin-top: 10px;
        width: 20px;
        height: 20px;
      }
      .saveB {
        background-image: url("../../assets/images/Other/save-icon-qa-form.png");
        height: 22px;
      }
      .editB {
        background-image: url("../../assets/images/Other/save-icon-qa.png");
        height: 22px;
      }
      .removeB {
        background-image: url("../../assets/images/Other/delete-icon-qa-form.png");
        height: 22px;
      }
      td {
        border: 1px solid #9a8f80;
        height: 46px;
        padding-left: 10px;
      }
      .data1 {
        display: flex;
        flex-basis: 11.5%;
        justify-content: space-between;
        align-items: center;
        position: relative;
      }
      .data2 {
        flex-basis: 27.5%;
        white-space: nowrap;
        overflow-x: hidden;
        display: flex;
        align-items: center;
      }
      .data6 {
        flex-basis: 15%;
        display: flex;
        align-items: center;
      }
      .inprow2 {
        outline: none;
        border: none;
        font-size: 14px;
        color: #67573e;
        width: 100%;
      }
    }
    .bodyWrapper {
      max-height: 184px;
      overflow-y: scroll;
    }
    .data6_active {
      opacity: 0.5;
    }
  }

  .addLang {
    cursor: pointer;
    background-image: url("../../assets/images/Other/add-icon.png");
  }

  button {
    width: 31px;
    height: 34px;
    background-color: #fff;
    border: none;
    background-repeat: no-repeat;
    outline: none;
    cursor: pointer;
  }
  .set_bottom_border {
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: #675842;
  }
  .withoutBorder {
    border-right: none;
  }
}
::-webkit-scrollbar {
  width: 27px;
  background-color: #e7e0e0;
}
::-webkit-scrollbar-thumb {
  border-color: #675842;
  background-color: #675842;
  border-right: solid 9px #e7e0e0;
  border-left: solid 9px #e7e0e0;
}
::-webkit-scrollbar-thumb:vertical {
  height: 12px;
}
</style>