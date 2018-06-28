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
          .errorsMessage(v-if="showEditWarning")
            .message
              span Previous data wasn't saved. Do you want to save them?
              .buttonsBlock
                button.confirm(@click="confirmEdit(pos)") Save
                button.cancel(@click="cancelEdit(ind)") Cancel
          button.removeB(@click="removeRow(ind)" :class="{data6_active: bodyItem.activeTools[2]}")
          RemoveAction(:table="table" :indexToRemove="indexToRemove" @confirmFromRemove="confirmRemove(ind)" @cancelFromRemove="cancelRemove" v-if="showRemoveWarning"
            :dataForRemoveAction="dataForRemoveAction")
  button.addLang(@click="addLang" :disabled="disableButton")
</template>

<script>
import ServicesSelect from "./servicesRows/ServicesTableSelect";
import ServicesTableImage from "./servicesRows/ServicesTableImage";
import ServicesRowEdit from "./servicesRows/ServicesRowEdit";
import CalculationUnite from "./servicesRows/CalculationUnite";
import LanguageForm from "./servicesRows/LanguageForm";
import RemoveAction from "./RemoveAction";

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
      declineReadonly: [true, true, true, true, true, true, true],
      showRemoveWarning: false,
      removeButtonDisable: false,
      showEditWarning: false,
      indexToRemove: "",
      indexToEdit: "",
      secondEditPosition: "",
      dataForRemoveAction: {
        spanTitle: "Do you want to delete data?",
        buttonConf: "Confirm",
        buttonCanc: "Cancel"
      }
    };
  },
  methods: {
    confirmRemove(ind) {
      this.showRemoveWarning = false;
      this.removeButtonDisable = false;
    },
    cancelRemove() {
      this.showRemoveWarning = false;
      this.removeButtonDisable = false;
    },
    confirmEdit(secondEditPosition) {
      let editPosition = this.secondEditPosition;
      this.showEditWarning = false;
      this.table.body[editPosition].activeTools[0] = true;
      this.table.body[editPosition].activeTools[1] = false;
      this.declineReadonly[editPosition] = true;
      this.disableButton = false;
      this.table.body[editPosition].isActiveUpload = false;
    },
    cancelEdit(indexToEdit) {
      let editCancelInd = this.indexToEdit;
      this.showEditWarning = false;
      this.table.body[editCancelInd].activeTools[0] = true;
      this.table.body[editCancelInd].activeTools[1] = false;
      this.declineReadonly[editCancelInd] = true;
      this.disableButton = false;
      this.table.body[editCancelInd].isActiveUpload = false;
    },
    addLang() {
      this.table.body.push(rowNew);
      this.disableButton = true;
    },
    edit(ind) {
      for (let i = 0; i < this.declineReadonly.length; i++) {
        if (!this.declineReadonly[i]) {
          this.showEditWarning = true;
          this.table.body[i].isActiveUpload = true;
          this.disableButton = true;
          this.declineReadonly[i] = false;
          this.secondEditPosition = i;
        }
      }

      this.indexToEdit = ind;
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
      this.showRemoveWarning = true;
      this.removeButtonDisable = true;
      this.indexToRemove = ind;
    },
    getLangFormData(data) {
      this.languageFormValue = data;
    },
    getCalcFormData(data){
      this.calcFormValue = data;
    },
    getActiveStatusFormData(data){
      this.activeFormValue = data;
    },
    async sendData(idx){
      let totalData = {
        nameTitle: this.table.body[idx].title1,
        languageFormValue: this.languageFormValue,
        calcFormValue: this.calcFormValue,
        uploadedFile: this.uploadFile,
        activeFormValue: this.activeFormValue
      };
      console.log(totalData);
      this.table.body[idx].activeTools.splice(0, 1, true);
      this.table.body[idx].activeTools.splice(1, 1, false);
      this.table.body[idx].isActiveUpload = false;
      this.declineReadonly[idx] = true;
      this.disableButton = false;
    }
  },

  computed: {},
  components: {
    ServicesTableImage,
    ServicesSelect,
    ServicesRowEdit,
    CalculationUnite,
    LanguageForm,
    RemoveAction
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
        .errorsMessage {
          width: 300px;
          max-height: 160px;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto;
          background-color: white;
          color: red;
          z-index: 20;
          border: 1px solid red;
          box-shadow: 0 0 15px red;
          text-align: center;
          padding-bottom: 15px;
          padding-top: 0;
          font-size: 18px;
          .message {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            span {
              margin-top: 28px;
              margin-bottom: 24px;
            }
            .buttonsBlock {
              display: flex;
              justify-content: space-around;
              width: 100%;
              .confirm,
              .cancel {
                border: 0;
                width: 114px;
                height: 40px;
                border-radius: 12px;
                background-color: #ff876c;
                -webkit-box-shadow: 1px 1px 5px rgba(102, 86, 61, 0.6);
                box-shadow: 1px 1px 5px rgba(102, 86, 61, 0.6);
                font-size: 14px;
                color: #fff;
                outline: none;
                cursor: pointer;
              }
            }
          }
        }
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