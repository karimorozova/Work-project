<template lang="pug">
.langWrapper
  table
    tr
      th(v-for="(headItem, key) in table.head" :class='"th__col-" + (key + 1)') {{ headItem.title }}
    .bodyWrapper
      tr.rbody(v-for="(bodyItem, ind) in languages" :class='"tr__row-" + (ind + 1)' )
        td.data1
          button.indusryicons(:style='{backgroundImage: "url(" + bodyItem.icon + ")"}' :class="[{icos_special: ind == 3},{video_special: ind == 5},{more_special: ind == 6}]")
          button.upload1(v-if="!declineReadonly[ind]")
          input.upload(v-if="disableButton" @change="uploadFile" :readonly="true" type="file" name="uploadedFileIcon")
        td.data2
          input.inprow2(v-model="bodyItem.lang" :readonly="true")
        td.data3
          input.inprow2(v-model="bodyItem.symbol" :readonly="true")
        td.data4
          input.inprow2(v-model="bodyItem.iso1" :readonly="true")
        td.data5
          input.inprow2(v-model="bodyItem.iso2" :readonly="true")
        td.data6
          input.inprow2(type="checkbox" :checked="true" :readonly="true")
        td.data7
          button.saveB(@click="sendData(ind)" :disabled="!disableButton" :class="{data5_active: true}")
          button.editB(@click="edit(ind)" :class="{data5_active: true}" :disabled="true")
          .errorsMessage(v-if="showEditWarning")
            .message
              span Data wasn't saved. Do you want to save them?
              .buttonsBlock
                button.confirm(@click="confirmEdit(pos)") Save
                button.cancel(@click="cancelEdit(ind)") Cancel
          button.removeB(@click="removeRow(ind)" :disabled="removeButtonDisable")
          RemoveAction(:table="table" :indexToRemove="indexToRemove" @confirmFromRemove="confirmRemove(ind)" @cancelFromRemove="cancelRemove" v-if="showRemoveWarning"
            :dataForRemoveAction="dataForRemoveAction")
</template>

<script>
import Select from "./rows/TableSelect";
import RowEdit from "./rows/RowEdit";
import ISO from "./rows/ISO";
import ISO1 from "./rows/ISO1";
import RemoveAction from "./RemoveAction";

export default {
  props: {},
  data() {
    return {
      table: {
        head: [
          { title: "Icon" },
          { title: "Name" },
          { title: "Symbol" },
          { title: "ISO 639-1" },
          { title: "ISO 639-2" },
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
      isActiveUpload: []
    };
  },
  methods: {
    editRow(index) {
      console.log("index from RowEdit" + index);
      this.table.body[index].isActiveUpload = true;

      this.table.body[index].activeTools.splice(0, 1, true);
      this.table.body[index].activeTools.splice(1, 1, false);
      this.table.body[index].activeTools.splice(2, 1, true);
    },
    removeRow(ind) {
      console.log(ind);
      this.table.body.splice(ind, 1);
    },
    async getLanguages() {
      await this.$http
        .get("api/languages")
        .then(response => {
          this.languages = response.body;
          console.log(this.languages.length);
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
    saveRow(ind) {
      this.table.body[ind].activeTools.splice(0, 1, true);
      this.table.body[ind].activeTools.splice(1, 1, false);
    }
  },
  components: {
    Select,
    RowEdit,
    ISO,
    ISO1,
    RemoveAction
  },
  mounted() {
    this.getLanguages();
  }
};
</script>

<style lang="scss" scoped>
.langWrapper {
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
      .download {
        width: 19px;
        height: 17px;
        margin-right: 37px;
      }
      .indusryicons {
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
</style>