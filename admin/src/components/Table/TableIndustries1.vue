<template lang="pug">
.servicesWrapper
  table
    tr
      th(v-for="(headItem, key) in table.head" :class='"th__col-" + (key + 1)') {{ headItem.title }}
    .bodyWrapper
      tr.rbody(v-for="(bodyItem, ind) in table.body" :class='"tr__row-" + (ind + 1)' )
        td.data1
          button.indusryicons(:style='{backgroundImage: "url(" + bodyItem.image1 + ")"}' :class="[{icos_special: ind == 3},{video_special: ind == 5},{more_special: ind == 6}]")
          button.upload1(v-if="disableButton")
          input.upload(v-if="disableButton" @change="uploadFile" :readonly="true" type="file" name="uploadedFileIcon")
        td.data2
          input.inprow2(v-model="bodyItem.title1" :readonly="declineReadonly[ind]")
        td.data3
          button.download(:style='{backgroundImage: "url(" + bodyItem.image2 + ")"}')
          input.uploadd3(v-if="disableButton" @change="uploadFile" :readonly="true" type="file" name="uploadedFileD")
          button.upload1(v-if="disableButton")
          input.uploadud3(v-if="disableButton" @change="uploadFile" :readonly="true" type="file" name="uploadedFile")
        ServiceSelect(:isActiveUpload="bodyItem.isActiveUpload" @sendActiveStatusY="getActiveStatusFormData" @sendActiveStatusN="getActiveStatusFormData")
        td.data5
          button.saveB(@click="sendData(ind)" :disabled="!disableButton" :class="{data5_active: bodyItem.activeTools[0]}")
          button.editB(@click="edit(ind)" :class="{data5_active: bodyItem.activeTools[1]}")
          button.removeB(@click="removeRow(ind)" :class="{data5_active: bodyItem.activeTools[2]}")
          .errorsMessage(v-if="showRemoveWarning")
            .message
              span Do you really want to delete data?
              .buttonsBlock
                button.confirm Confirm
                button.cancel Cancel
  button.addLang(@click="addLang" :disabled="disableButton")
</template>

<script>
import IndustriesSelect from "./industriesRows/IndustriesTableSelect";
import IndustriesTableImage from "./industriesRows/IndustriesTableImage";
import IndustriesRowEdit from "./industriesRows/IndustriesRowEdit";
import IndustriesGenericTB from "./industriesRows/IndustriesGenericTB";
import ServiceSelect from "./industriesRows/ServicesTableSelect";

const rowNew = {
  activeTools: [false, true, false],
  isActiveUpload: true,
  image1: "",
  image2: require("../../assets/images/Other/upload-icon.png"),
  title: "",
  image2: require("../../assets/images/Other/upload-icon.png"),
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
          { title: "Generic TB" },
          { title: "Active" },
          { title: "" }
        ],
        body: [
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/industries/casino,poker_igaming (2).png"),
            title1: "CASINO, POKER & IGAMING",
            image2: require("../../assets/images/Other/Download-icon.png"),
            title3: "YES",
            title4: ""
          },
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/industries/cfds_online tranding (2).png"),
            title1: "CFDS & ONLINE TRADING",
            image2: require("../../assets/images/Other/Download-icon.png"),
            title3: "YES",
            title4: ""
          },
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/industries/hotel _real estates (2).png"),
            title1: "HOTEL & REAL ESTATES",
            image2: require("../../assets/images/Other/Download-icon.png"),
            title3: "YES",
            title4: ""
          },
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/industries/icos_cryptocurrency (2).png"),
            title1: "ICOS & CRYPTOCURRENCY",
            image2: require("../../assets/images/Other/Download-icon.png"),
            title3: "YES",
            title4: ""
          },
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/industries/legal icon.png"),
            title1: "LEGAL",
            image2: require("../../assets/images/Other/Download-icon.png"),
            title3: "YES",
            title4: ""
          },
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/industries/video games (2).png"),
            title1: "VIDEO GAMES",
            image2: require("../../assets/images/Other/Download-icon.png"),
            title3: "YES",
            title4: ""
          },
          {
            activeTools: [true, false, false],
            isActiveUpload: false,
            image1: require("../../assets/images/industries/more-icon.png"),
            title1: "MORE",
            image2: require("../../assets/images/Other/Download-icon.png"),
            title4: "YES",
            title5: ""
          }
        ]
      },
      declineReadonly: [true, true, true, true, true, true, true],
      uploadedFileIcon: [],
      uploadedFile: [],
      nameTitle: "",
      showRemoveWarning: false
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
      this.showRemoveWarning = true;
      this.table.body.splice(ind, 1);
    },
    getLangFormData(data) {
      // console.log(data);
      this.languageFormValue = data;
    },
    getCalcFormData(data) {
      // console.log(data);
      this.calcFormValue = data;
    },
    getActiveStatusFormData(data) {
      // console.log(data);
      this.activeFormValue = data;
    },
    async sendData(idx) {
      console.log(idx);
      let totalData = {
        nameTitle: this.table.body[idx].title1,
        uploadedFileIcon: this.uploadFile,
        activeFormValue: this.activeFormValue
      };
      console.log(totalData);
    }
  },

  computed: {},
  components: {
    IndustriesTableImage,
    IndustriesSelect,
    IndustriesRowEdit,
    IndustriesGenericTB,
    ServiceSelect
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
        height: 18px;
      }
      .icos_special {
        margin-left: 6px;
      }
      .more_special {
        height: 14px;
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
      }
      .data5 {
        flex-basis: 17.1%;
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
            &__close {
              position: absolute;
              top: -15px;
              right: 7px;
              cursor: pointer;
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