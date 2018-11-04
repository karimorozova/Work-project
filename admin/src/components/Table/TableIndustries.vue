<template lang="pug">
.servicesWrapper
  table
    thead
      tr
        th(v-for="(headItem, key) in head" :class='"th__col-" + (key + 1)') {{ headItem.title }}
    tbody.bodyWrapper
      tr.rbody(v-for="(industry, ind) in industries" :class='"tr__row-" + (ind + 1)' )
        td.data1(:class="{outliner: industry.crud}")
          span.industryIcons(:style='{backgroundImage: "url(" + industry.icon + ")"}' :class="[{icos_special: ind == 3},{video_special: ind == 5},{more_special: ind == 6}]")
          button.upload1(v-if="industry.crud")
          input.upload(v-if="industry.crud" @change="uploadFile" :readonly="!industry.crud" type="file" name="uploadedFileIcon")
        td.data2(:class="{outliner: industry.crud}")
          input.inprow2(v-model="industry.name" :readonly="!industry.crud" )
          input.inprow2(v-model="industry._id" type="hidden")
        td.data3(:class="{outliner: industry.crud}")
          a.hyperlink(:href="industry.generic" :download="industry.name + '.xlsx'")
            img(:src="industry.download")
          button.upload1(v-if="industry.crud")
          input.uploadud3(v-if="industry.crud" @change="uploadFileGenTB" :readonly="true" type="file" name="uploadedFile")
        td.data4(:class="{outliner: industry.crud}")
          input.inprow2(type="checkbox" :disabled="!industry.crud" v-model="industry.active" :checked="industry.crud")
        td.data5
          button.saveB(@click="checkFields(ind)" :disabled="!industry.crud" :class="{data5_active: !industry.crud}")
          button.editB(@click="edit(ind)" :disabled="industry.crud" :class="{data5_active: industry.crud}")
          button.removeB(@click="removeRow(ind)" )
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
  .errorsMessage(v-if="showEmptyWarning")
    .message
      span Field 'Name' must not empty!
      .buttonsBlock
        button.confirm(@click="ok") Ok
  button.addIndustries(@click="addIndustry" :disabled='disableButton')
</template>

<script>
import IndustriesSelect from "./industriesRows/IndustriesTableSelect";
import IndustriesTableImage from "./industriesRows/IndustriesTableImage";
import IndustriesRowEdit from "./industriesRows/IndustriesRowEdit";
import IndustriesGenericTB from "./industriesRows/IndustriesGenericTB";

export default {
  props: {},
  data() {
    return {
      head: [
        { title: "Icon" },
        { title: "Name" },
        { title: "Generic TB" },
        { title: "Active" },
        { title: "" }
      ],
      uploadedFileIcon: [],
      uploadedFile: [],
      downloadedFile: [],
      nameTitle: "",
      showRemoveWarning: false,
      showEditWarning: false,
      showEmptyWarning: false,
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
      industries: [],
      dbIndex: "",
      disableButton: false,
      errors: []
    };
  },
  methods: {
    async getIndustries() {
      console.log('Getting industries...')
      const preData = await this.$http.get("api/industries");
      this.industries = preData.body;
      this.industries.sort((x, y) => {
        if (x.name > y.name) return 1;
        if (x.name < y.name) return -1;
      });
    },
    addIndustry() {
      for(let i = 0; i < this.industries.length; i++) {
        if (this.industries[i].crud) {
          this.showEditWarning = true;
          this.disableButton = true;
          break;
        }
      }
      this.industries.push({
        icon: "",
        name: "",
        generic: "",
        active: true,
        download: "",
        crud: true
      });
    },
    edit(ind) {
      for (let i = 0; i < this.industries.length; i++) {
        if (this.industries[i].crud) {
          this.showEditWarning = true;
          this.indexToEdit = i;
        }
      }

      this.industries[ind].crud = true;
    },
    confirmEdit() {
      this.showEditWarning = false;
      this.industries[this.indexToEdit].crud = false;
      this.sendData(this.indexToEdit);
      this.disableButton = false;
    },
    cancelEdit() {
      this.showEditWarning = false;
      this.industries[this.indexToEdit].crud = false;
      this.getIndustries();
      this.disableButton = false;
    },
    uploadFile(event) {
      this.uploadedFileIcon = event.target.files[0];
    },
    uploadFileGenTB(event) {
      this.uploadedFile = event.target.files[0];
    },
    removeRow(ind) {
      this.showRemoveWarning = true;
      this.indexToRemove = ind;
    },
    confirmRemove() {
      this.industries[this.indexToRemove].crud = false;
      let formData = new FormData();
      let remObj = {
        industryRem: this.industries[this.indexToRemove]._id
      };
      this.$http
        .post("industry/removeindustries", remObj)
        .then(result => {})
        .catch(err => {
          console.log(err);
        });
      this.showRemoveWarning = false;
      this.industries = this.industries.filter(
        (s, i) => i !== this.indexToRemove
      );
    },
    cancelRemove() {
      this.industries[this.indexToRemove].crud = false;
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
      formData.append("nameTitle", this.industries[idx].name);
      formData.append("activeFormValue", this.industries[idx].active);
      formData.append("dbIndex", this.industries[idx]._id);
      formData.append("uploadedFileIcon", this.uploadedFileIcon);
      formData.append("uploadedFile", this.uploadedFile);
      
      this.$http
        .post("industry/saveindustries", formData)
        .then(result => {
          setTimeout(() => {
            this.getIndustries();
          }, 1000)
        })
        .catch(err => {
          console.log(err);
        });
      this.industries[idx].crud = false;
    },
    checkFields(ind) {
      if (!this.industries[ind].name.length) {
        this.showEmptyWarning = true;
        this.errors.push("Field 'Name' must not empty!");
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
    IndustriesTableImage,
    IndustriesSelect,
    IndustriesRowEdit,
    IndustriesGenericTB,
  },
  mounted() {
    this.getIndustries();
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
        flex-basis: 11%;
      }
      .th__col-2 {
        flex-basis: 29%;
      }
      .th__col-3 {
        flex-basis: 20%;
      }
      .th__col-4 {
        flex-basis: 20%;
      }
      .th__col-5 {
        flex-basis: 20%;
        border-right: none;
      }
      .upload {
        background: url("../../assets/images/Other/upload-icon.png");
        padding-left: 0;
        padding-right: 0;
        background-repeat: no-repeat;
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
      .download {
        width: 19px;
        height: 17px;
        margin-right: 37px;
      }
      .industryIcons {
        width: 20px;
        height: 20px;
        background-size: contain;
        background-repeat: no-repeat;
      }
      .video_special {
        height: 25px;
      }
      .more_special {
        height: 22px;
      }
      td {
        border: 1px solid #9a8f80;
        height: 46px;
        padding-left: 10px;
      }
      .data1 {
        display: flex;
        flex-basis: 11.3%;
        justify-content: space-between;
        align-items: center;
        position: relative;
      }
      .data2 {
        flex-basis: 30.1%;
        white-space: nowrap;
        overflow-x: hidden;
        display: flex;
        align-items: center;
      }
      .data3 {
        flex-basis: 20.7%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        position: relative;
        .uploadd3 {
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
          left: 9px;
        }
        .uploadud3 {
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
          left: 65px;
        }
        .hyperlink {
          margin-right: 40px;
        }
      }
      .data4 {
        display: flex;
        align-items: center;
        flex-basis: 20.7%;
      }
      .data5 {
        flex-basis: 21.1%;
        display: flex;
        justify-content: center;
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
    .data5_active {
      opacity: 0.5;
      position: relative;
    }
  }

  .addIndustries {
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
        background-color: #D15F45;
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