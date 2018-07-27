<template lang="pug">
.servicesWrapper
  table
    thead
      tr
        th(v-for="(headItem, key) in head" :class='"th__col-" + (key + 1)') {{ headItem.title }}
    tbody.bodyWrapper
      tr(v-for="(service, ind) in services")
        td(:class="{outliner: service.crud}")
          .data1
            button(:style='{backgroundImage: "url(" + service.icon + ")"}')
            button.upload1(v-if="service.crud")
            input.upload(v-if="service.crud" @change="uploadFile" :readonly="services.crud" type="file" name="uploadedFileIcon")
        td(:class="{outliner: service.crud}")
          input.inprow2(v-model="service.title" :readonly="!service.crud")
        td.langForm {{ service.languageForm }}
          .innerComponent(v-if="service.crud")
            LanguageForm(:formOption="service.languageForm" :index="ind" :isActiveUpload="service.crud" @sendToParentM="getLangFormData" @sendToParentDuo="getLangFormData" :class="{outliner: service.crud}" )
        td.calcUnit {{ service.calculationUnit }}
          .innerComponent(v-if="service.crud")
            CalculationUnite(:unitOption="service.calculationUnit" :index="ind" :isActiveUpload="service.crud" @calcSendFirst="getCalcFormData" @calcSendSecond="getCalcFormData" @calcSendThird="getCalcFormData" :class="{outliner: service.crud}" )
        td(:class="{outliner: service.crud}")
          input.inprow2(type="checkbox" :disabled="!service.crud" v-model="service.active" :checked="service.crud")
        td.data6
          button.saveB(@click="checkFields(ind)" :disabled="!service.crud" :class="{data6_active: !service.crud}")
          button.editB(@click="edit(ind)" :disabled="service.crud" :class="{data6_active: service.crud}")
          button.removeB(@click="removeRow(ind)" )
  .errorsMessage(v-if="showEditWarning")
    .message
      span {{ dataForEditAction.spanTitle }}
      .buttonsBlock
        button.confirm(@click="confirmEdit") {{ dataForEditAction.buttonConf }}
        button.cancel(@click="cancelEdit") {{ dataForEditAction.buttonCanc }}
  .errorsMessage(v-if="showRemoveWarning")
    .message
      span {{ dataForRemoveAction.spanTitle }}
      .buttonsBlock
        button.confirm(@click="confirmRemove(indexToRemove)") {{ dataForRemoveAction.buttonConf }}
        button.cancel(@click="cancelRemove(indexToRemove)") {{ dataForRemoveAction.buttonCanc }}
  .errorsMessage(v-if="showEmptyWarning")
    .message
      span Field 'Name' must not be empty!
      .buttonsBlock
        button.confirm(@click="ok") Ok
  button.addService(@click="addService" :disabled="disabledButton")
</template>

<script>
import CalculationUnite from "./servicesRows/CalculationUnite";
import LanguageForm from "./servicesRows/LanguageForm";

export default {
  props: {},
  data() {
    return {
      head: [
        { title: "Icon" },
        { title: "Name" },
        { title: "Language Form" },
        { title: "Calculation Unit" },
        { title: "Active" },
        { title: "" }
      ],
      disableButton: false,
      uploadedFileIcon: [],
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
      languageFormTrans: "",
      calculationUniteTrans: "",
      dbIndex: "",
      errors: [],
      showEmptyWarning: false
    };
  },
  methods: {
    addService() {
      for(let i = 0; i < this.services.length; i++) {
        if (this.services[i].crud) {
          this.showEditWarning = true;
          this.disabledButton = true;
          break;
        }
      }
      this.services.push({
        icon: "",
        title: "",
        languageForm: "",
        calculationUnit: "",
        active: true,
        crud: true,
        sortIndex: this.services.length+1,
        source: true,
        xtrf: 11,
        projectType: "regular",
        createdAt: ""
      });
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
    confirmEdit() {
      this.showEditWarning = false;
      this.services[this.indexToEdit].crud = false;
      this.sendData(this.indexToEdit);
      this.disabledButton = false;
    },
    cancelEdit() {
      this.showEditWarning = false;
      this.services[this.indexToEdit].crud = false;
      this.getServices();
      this.disabledButton = false;
    },
    uploadFile(event) {
      this.uploadedFileIcon = event.target.files[0];
    },
    removeRow(ind) {
      this.showRemoveWarning = true;
      this.removeButtonDisable = true;
      this.indexToRemove = ind;
    },
    confirmRemove(indexToRemove) {
      this.services[indexToRemove].crud = false;
      let remObj = {
        serviceRem: this.services[indexToRemove]._id
      };
      this.$http
        .post("service/removeservices", remObj)
        .then(result => {
          this.showRemoveWarning = false;
          this.services.splice(indexToRemove, 1);
        })
        .catch(err => {
          console.log(err);
        });
      
    },
    cancelRemove(indexToRemove) {
      this.services[indexToRemove].crud = false;
      this.showRemoveWarning = false;
      this.getServices();
    },
    getLangFormData(data) {
      this.services[data.index].languageForm = data.form;
    },
    getCalcFormData(data) {
      this.services[data.index].calculationUnit = data.unit;
    },
    getActiveStatusFormData(data) {
      this.activeFormValue = data;
    },
    async sendData(idx) {
      let formData = new FormData();
      formData.append("nameTitle", this.services[idx].title);
      formData.append("activeFormValue", this.services[idx].active);
      formData.append("dbIndex", this.services[idx]._id);
      formData.append("languageFormValue", this.services[idx].languageForm);
      formData.append("calcFormValue", this.services[idx].calculationUnit);
      formData.append("uploadedFileIcon", this.uploadedFileIcon);

      this.$http
        .post("service/saveservices", formData)
        .then(result => {
          setTimeout(() => {
            this.getServices()
          }, 1000)
        })
        .catch(err => {
          console.log(err);
        });
      this.services[idx].crud = false;
    },
    async getServices() {
      const preData = await this.$http.get("api/services");
      this.services = preData.body;
      this.services.sort((x, y) => {
        if (x.title > y.title) return 1;
        if (x.title < y.title) return -1;
      });
    },
    checkFields(ind) {
      if (!this.services[ind].title.length) {
        this.showEmptyWarning = true;
        this.errors.push("Field 'Name' must not be empty!");
      }
      if(!this.errors.length){
        this.sendData(ind);
      }
    },
    ok() {
      this.showEmptyWarning = false;
      this.errors.splice(0, 1);
    }
  },

  computed: {},
  components: {
    CalculationUnite,
    LanguageForm
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
    border-collapse: collapse;
    tr {
      th {
        background-color: #9a8f80;
        color: #fff;
        font-size: 14px;
        border-right: 2px solid #fff;
        padding: 5px 0 5px 10px;
        font-weight: normal;
      }
      .th__col-1 {
        width: 100px;
        border-left: 2px solid #9a8f80;
      }
      .th__col-6 {
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
        background-image: url("../../assets/images/Other/edit-icon-qa.png");
        height: 22px;
      }
      .removeB {
        background-image: url("../../assets/images/Other/delete-icon-qa-form.png");
        height: 22px;
      }
      td {
        border: 2px solid #9a8f80;
        height: 46px;
        padding-left: 10px;
      }
      .data1 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
      }
      .data6 {
        text-align: center;
      }
      .inprow2 {
        outline: none;
        border: none;
        font-size: 14px;
        color: #67573e;
      }
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
  box-shadow: inset 0 0 5px #22b6e6;
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
.langForm, .calcUnit {
  position: relative;
  .innerComponent {
    position: absolute;
    background-color: #fff;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 5;
  }
}
</style>