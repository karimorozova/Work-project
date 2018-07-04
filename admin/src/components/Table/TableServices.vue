<template lang="pug">
.servicesWrapper
  table
    tr
      th(v-for="(headItem, key) in table.head" :class='"th__col-" + (key + 1)') {{ headItem.title }}
    .bodyWrapper
      tr.rbody(v-for="(service, ind) in services" :class='"tr__row-" + (ind + 1)' )
        td.data1(:class="{outliner: service.crud}")
          button(:style='{backgroundImage: "url(" + service.icon + ")"}')
          button.upload1(v-if="service.crud")
          input.upload(v-if="service.crud" @change="uploadFile" :readonly="services.crud" type="file" name="uploadedFile")
        td.data2(:class="{outliner: service.crud}")
          input.inprow2(v-model="service.title" :readonly="!service.crud")
        LanguageForm(:isActiveUpload="service.crud" @sendToParentM="getLangFormData" @sendToParentDuo="getLangFormData" :class="{outliner: service.crud}" )
        CalculationUnite(:isActiveUpload="service.crud" @calcSendFirst="getCalcFormData" @calcSendSecond="getCalcFormData" @calcSendThird="getCalcFormData" :class="{outliner: service.crud}" )
        td.data5(:class="{outliner: service.crud}")
          input.inprow2(type="checkbox" :disabled="!service.crud" v-model="service.active" :checked="service.crud")
        td.data6
          button.saveB(@click="sendData(ind)" :disabled="!service.crud" :class="{data6_active: !service.crud}")
          button.editB(@click="edit(ind)" :disabled="service.crud" :class="{data6_active: service.crud}")
          button.removeB(@click="removeRow(ind)" :disabled="service.crud")
  .errorsMessage(v-if="showEditWarning")
    .message
      span {{ dataForEditAction.spanTitle }}
      .buttonsBlock
        button.confirm(@click="confirmEdit(indexToEdit)") {{ dataForEditAction.buttonConf }}
        button.cancel(@click="cancelEdit(indexToEdit)") {{ dataForEditAction.buttonCanc }}
  .errorsMessage(v-if="showRemoveWarning")
    .message
      span {{ dataForRemoveAction.spanTitle }}
      .buttonsBlock
        button.confirm(@click="confirmRemove(indexToRemove)") {{ dataForRemoveAction.buttonConf }}
        button.cancel(@click="cancelRemove(indexToRemove)") {{ dataForRemoveAction.buttonCanc }}
  button.addService(@click="addLang" :disabled="disableButton")
</template>

<script>
import ServicesSelect from "./servicesRows/ServicesTableSelect";
import ServicesTableImage from "./servicesRows/ServicesTableImage";
import ServicesRowEdit from "./servicesRows/ServicesRowEdit";
import CalculationUnite from "./servicesRows/CalculationUnite";
import LanguageForm from "./servicesRows/LanguageForm";
import RemoveAction from "./RemoveAction";

const rowNew = {
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
        ]
      },
      disableButton: false,
      uploadedFile: [],
      nameTitle: "",
      languageFormValue: "",
      selectBool: ["Yes", "No"],
      calcFormValue: "",
      activeFormValue: "",
      showRemoveWarning: false,
      showEditWarning: false,
      indexToRemove: 0,
      indexToEdit: 0,
      secondEditPosition: "",
      dataForRemoveAction: {
        spanTitle: "Do you want to delete data?",
        buttonConf: "Confirm",
        buttonCanc: "Cancel"
      },
      dataForEditAction: {
        spanTitle: "Data weren't saved. Do you want to save them?",
        buttonConf: "Save",
        buttonCanc: "Cancel"
      },
      services: [],
      isActiveUpload: false,
      languageFormTrans: '',
      calculationUniteTrans: '',
      dbIndex: '',
    };
  },
  methods: {
    addLang() {
      this.disableButton = true;
    },
    edit(ind) {
      for (let i = 0; i < this.services.length; i++) {
        if (this.services[i].crud) {
          this.showEditWarning = true;
          this.indexToEdit = i;
        }
      }

      this.services[ind].crud = true;
    },
    confirmEdit(indexToEdit) {
      let confirmIndex = this.indexToEdit;
      this.showEditWarning = false;
      this.services[confirmIndex].crud = false;
      this.sendData(confirmIndex);
    },
    cancelEdit(indexToEdit) {
      let cancelIndex = this.indexToEdit;
      this.showEditWarning = false;
      this.services[cancelIndex].crud = false;
    },
    uploadFile(event) {
      this.upload = event.target.files[0];
    },
    removeRow(ind) {
      this.showRemoveWarning = true;
      this.removeButtonDisable = true;
      this.indexToRemove = ind;
    },
    confirmRemove(indexToRemove) {
      let confirmRIndex = this.indexToRemove;
      this.services[confirmRIndex].crud = false;
      let formData = new FormData();
      let remObj = {
        serviceRem: this.services[confirmRIndex]._id
      };
      this.$http.post("api/removeservices", remObj).then(result => {
      }).catch(err => {
        console.log(err);
      });
      this.showRemoveWarning = false;
      this.services = this.services.filter((s, i) => i !== this.indexToRemove );
    },
    cancelRemove(indexToRemove) {
      let cancelRIndex = this.indexToRemove;
      this.services[cancelRIndex].crud = false;
      this.showRemoveWarning = false;
    },
    getLangFormData(data) {
      this.languageFormValue = data;
    },
    getCalcFormData(data) {
      this.calcFormValue = data;
    },
    getActiveStatusFormData(data) {
      this.activeFormValue = data;
    },
    async sendData(idx) {
      let formData = new FormData();
      formData.append("uploadedFileIcon", this.uploadedFileIcon);
      formData.append("uploadedFile", this.uploadedFile);
      let totalData = {
        nameTitle: this.services[idx].title,
        activeFormValue: this.services[idx].active,
        dbIndex: this.services[idx]._id,
        languageFormValue: this.languageFormValue,
        calcFormValue: this.calcFormValue
      };
      // console.log(totalData);
      formData.append("totalData", totalData);
      this.$http
        .post("api/saveservices", totalData)
        .then(result => {
          console.log(result.data);
        })
        .catch(err => {
          console.log(err);
        });
        this.services[idx].crud = false;
    },
    async getServices() {
      const preData = await this.$http.get("api/services");
      // console.log(preData.body);
      this.services = preData.body;
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
  },
  mounted() {
    this.getServices();
  }
};
</script>

<style lang="scss" scoped>
.servicesWrapper {
  position: relative;
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
        margin-right: 5px;
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
      .data5 {
        display: flex;
        flex-basis: 15.7%;
        align-items: center;
      }
      .data6 {
        flex-basis: 18.7%;
        display: flex;
        align-items: center;
        justify-content: center;
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
      // max-height: 184px;
      // overflow-y: scroll;
    }
    .data6_active {
      opacity: 0.5;
    }
  }

  .addService {
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

.outliner {
  box-shadow: -1px 3px 12px #22b6e6;
}

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
</style>