<template lang="pug">
.langWrapper
  table
    tr
      th(v-for="(headItem, key) in table.head" :class='"th__col-" + (key + 1)') {{ headItem.title }}
        ISO(v-if="key == 3" :titlesp1="titlesp1Value" titlesp2="(two letters)")
        ISO1(v-if="key == 4" :titlesp3="titlesp2Value" titlesp4="(three letters)")
    .bodyWrapper
      tr.rbody(v-for="(language, ind) in languages" :class='"tr__row-" + (ind + 1)' )
        td.data1(:class="{outliner: language.crud}")
          button.languageicons(:style='{backgroundImage: "url(" + language.icon + ")"}' :class="[{icos_special: ind == 3},{video_special: ind == 5},{more_special: ind == 6}]")
          button.upload1(v-if="language.crud")
          input.upload(v-if="true" @change="uploadFile" :readonly="true" type="file" name="uploadedFileIcon")
        td.data2(:class="{outliner: language.crud}")
          input.inprow2(v-model="language.lang" :readonly="!language.crud" )
          input.inprow2(v-model="language._id" type="hidden")
        td.data3
          input.inprow2(v-model="language.symbol" :readonly="true" )
        td.data4
          input.inprow2(v-model="language.iso1" :readonly="true")
        td.data5
          input.inprow2(v-model="language.iso2" :readonly="true")
        td.data6(:class="{outliner: language.crud}")
          input.inprow2(type="checkbox" :disabled="!language.crud" v-model="language.active" :checked="language.crud")
        td.data7
          button.saveB(@click="sendData(ind)" :disabled="!language.crud" :class="{data5_active: !language.crud}")
          button.editB(@click="edit(ind, language)" :class="{data5_active: language.crud}" :disabled="language.crud")
          button.removeB(@click="remove(ind)" :disabled="language.crud")
  .errorsMessage(v-if="showEditWarning")
    .message
      span {{ dataForEditAction.spanTitle }}
      .buttonsBlock
        button.confirm(@click="confirmEdit(indexToEdit)") Save
        button.cancel(@click="cancelEdit(indexToEdit)") Cancel
  .errorsMessage(v-if="showRemoveWarning")
    .message
      span {{ dataForRemoveAction.spanTitle }}
      .buttonsBlock
        button.confirm(@click="confirmRemove(indexToRemove)") {{ dataForRemoveAction.buttonConf }}
        button.cancel(@click="cancelRemove(indexToRemove)") {{ dataForRemoveAction.buttonCanc }}
</template>

<script>
import Select from "./rows/TableSelect";
import RowEdit from "./rows/RowEdit";
import ISO from "./rows/ISO";
import ISO1 from "./rows/ISO1";

export default {
  props: {},
  data() {
    return {
      table: {
        head: [
          { title: "Icon" },
          { title: "Name" },
          { title: "Symbol" },
          { title: "" },
          { title: "" },
          { title: "Active" },
          { title: "" }
        ]
      },
      titlesp1Value: "ISO 639-1",
      titlesp2Value: "ISO 639-2",
      disableAddLang: false,
      languages: [],
      erroes: [],
      activeTools: [],
      declineReadonly: [],
      isActiveUpload: [],
      showRemoveWarning: false,
      showEditWarning: false,
      dataForRemoveAction: {
        spanTitle: "Do you want to delete data?",
        buttonConf: "Confirm",
        buttonCanc: "Cancel"
      },
      dataForEditAction: {
        spanTitle: "Data weren't saved. Do you want to save them?",
        buttonConf: "Confirm",
        buttonCanc: "Cancel"
      },
      titlesp1Value: "ISO 639-1",
      titlesp2Value: "ISO 639-2",
      languageName: "",
      languageSymbol: "",
      languageIso1: "",
      languageIso2: "",
      languageActive: "",
      dbIndex: '',
      indexToEdit: 0,
      indexToRemove: 0
    };
  },
  methods: {
    edit(ind) {
      for (let i = 0; i < this.languages.length; i++) {
        if (this.languages[i].crud) {
          this.showEditWarning = true;
          this.indexToEdit = i;
        }
      }

      this.languages[ind].crud = true;
    },
    confirmEdit(indexToEdit) {
      let confirmIndex = this.indexToEdit;
      this.showEditWarning = false;
      this.languages[confirmIndex].crud = false;
      this.sendData(confirmIndex);
    },
    cancelEdit(indexToEdit) {
      let cancelIndex = this.indexToEdit;
      this.showEditWarning = false;
      this.languages[cancelIndex].crud = false;
    },
    remove(ind) {
      this.showRemoveWarning = true;
      this.indexToRemove = ind;
    },
    confirmRemove(indexToRemove) {
      let confirmRIndex = this.indexToRemove;
      this.languages[confirmRIndex].crud = false;
      let formData = new FormData();
      let remObj = {
        languageRem: this.languages[confirmRIndex]._id
      };
      this.$http.post("api/removelanguages", remObj).then(result => {
      }).catch(err => {
        console.log(err);
      });
      this.showRemoveWarning = false;
      this.languages = this.languages.filter((s, i) => i !== this.indexToRemove );
    },
    cancelRemove(indexToRemove) {
      let cancelRIndex = this.indexToRemove;
      this.languages[cancelRIndex].crud = false;
      this.showRemoveWarning = false;
    },
    async getLanguages() {
      await this.$http
        .get("api/languages")
        .then(response => {
          this.languages = response.body;
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
    uploadFile(event) {
      this.upload = event.target.files[0];
    },
    async sendData(ind) {
      let formData = new FormData();
      formData.append("uploadedFileIcon", this.uploadedFileIcon);
      let langObj = {
        languageName: this.languages[ind].lang,
        languageSymbol: this.languages[ind].symbol,
        languageIso1: this.languages[ind].iso1,
        languageIso2: this.languages[ind].iso2,
        languageActive: this.languages[ind].active,
        dbIndex: this.languages[ind]._id
      };
      formData.append("langObj", langObj);
      console.log(langObj);
      this.$http
        .post("api/savelanguages", langObj)
        .then(result => {
          console.log(result.data);
        })
        .catch(err => {
          console.log(err);
        });
      this.languages[ind].crud = false;
    }
  },
  components: {
    Select,
    RowEdit,
    ISO,
    ISO1
  },
  mounted() {
    this.getLanguages();
  }
};
</script>

<style lang="scss" scoped>
.langWrapper {
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
        flex-basis: 15%;
      }
      .th__col-2 {
        flex-basis: 21%;
      }
      .th__col-3 {
        flex-basis: 10%;
      }
      .th__col-4 {
        flex-basis: 12%;
      }
      .th__col-5 {
        flex-basis: 12%;
      }
      .th__col-6 {
        flex-basis: 14%;
      }
      .th__col-7 {
        flex-basis: 16%;
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
        left: 90px;
      }
      .upload1 {
        background-image: url("../../assets/images/Other/upload-icon.png");
        padding-left: 0;
        padding-right: 0;
        border: none;
        outline: none;
        width: 20px;
        height: 20px;
        margin-right: 25px;
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
      .download {
        width: 19px;
        height: 17px;
        margin-right: 37px;
      }
      .languageicons {
        height: 24px;
      }
      .video_special {
        height: 25px;
      }
      // .icos_special {
      //   margin-left: 6px;
      // }
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
        flex-basis: 15.2%;
        justify-content: space-between;
        align-items: center;
        position: relative;
      }
      .data2 {
        flex-basis: 21.8%;
        white-space: nowrap;
        overflow-x: hidden;
        display: flex;
        align-items: center;
      }
      .data3 {
        flex-basis: 10.2%;
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
      }
      .data4 {
        flex-basis: 12.4%;
        display: flex;
      }
      .data5 {
        flex-basis: 12.2%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .data6 {
        flex-basis: 14.4%;
        display: flex;
        align-items: center;
      }
      .data7 {
        flex-basis: 13.8%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
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
      max-height: 584px;
      overflow-y: scroll;
    }
    .data5_active {
      opacity: 0.5;
      position: relative;
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

.errorsMessage {
  width: 300px;
  max-height: 160px;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
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

.outliner {
  box-shadow: -1px 3px 12px #22b6e6;
}
</style>