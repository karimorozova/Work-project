<template lang="pug">
.servicesWrapper
  table
    tr
      th(v-for="(headItem, key) in table.head" :class='"th__col-" + (key + 1)') {{ headItem.title }}
    tr.rbody(v-for="(bodyItem, ind) in table.body" :class='"tr__row-" + (ind + 1)' )
      td.data1
        button(:style='{backgroundImage: "url(" + bodyItem.image1 + ")"}')
        button.upload
      td.data2 {{ bodyItem.title1 }}
      LanguageForm
      CalculationUnite
      ServicesSelect
      td.data6
        button.saveB
        button.editB
        button.removeB
  button.addLang(@click="addLang" :disabled="disableButton")
</template>

<script>
import ServicesSelect from "./servicesRows/ServicesTableSelect";
import ServicesTableImage from "./servicesRows/ServicesTableImage";
import ServicesRowEdit from "./servicesRows/ServicesRowEdit";
import CalculationUnite from "./servicesRows/CalculationUnite";
import LanguageForm from "./servicesRows/LanguageForm";

const rowNew = {
  rowInfo: [
    {
      image1: "",
      image2: require("../../assets/images/Other/upload-icon.png")
    },
    { title: "" },
    { title: "" },
    { title: "" },
    { title: "" }
  ]
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
            image1: require("../../assets/images/services/SEO _ Blog Management.png"),
            title1: "SEO & Blog Management",
            title2: "test",
            title3: "test",
            title4: "test",
            title5: ""
          },
          {
            image1: require("../../assets/images/services/QA and Testing.png"),
            title1: "QA & Testing",
            title2: "test",
            title3: "test",
            title4: "test",
            title5: ""
          },
          {
            image1: require("../../assets/images/services/Localized Graphic Design.png"),
            title1: "Localized Graphic Design",
            title2: "testtest",
            title3: "test",
            title4: "test",
            title5: ""
          },
          {
            image1: require("../../assets/images/services/Marketing _ Copywriting.png"),
            title1: "Marketing _ Copywriting",
            title2: "test",
            title3: "test",
            title4: "test",
            title5: ""
          },
          {
            image1: require("../../assets/images/services/Market Research.png"),
            title1: "Market Research",
            title2: "test",
            title3: "test",
            title4: "test",
            title5: ""
          },
          {
            image1: require("../../assets/images/services/Official Translations.png"),
            title1: "Official Translations",
            title2: "test",
            title3: "test",
            title4: "test",
            title5: ""
          },
          {
            image1: require("../../assets/images/services/ORM – Online Reputation Management.png"),
            title1: "ORM – Online Reputation Management",
            title2: "test",
            title3: "test",
            title4: "test",
            title5: ""
          }
        ]
      },
      disableButton: false
    };
  },
  methods: {
    addLang() {
      this.table.body.push(row);
      this.disableButton = true;
    },
    editRow(index) {
      console.log(index);
      this.table.body[index].isActiveUpload = true;

      this.table.body[index].activeTools.splice(0, 1, true);
      this.table.body[index].activeTools.splice(1, 1, false);
      this.table.body[index].activeTools.splice(2, 1, true);
    }
  },

  computed: {},
  components: {
    ServicesTableImage,
    ServicesSelect,
    ServicesRowEdit,
    CalculationUnite,
    LanguageForm
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
        flex-basis: 11.5%;
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
        flex-basis: 15%;
        border-right: none;
      }
      .upload {
        background-image: url("../../assets/images/Other/upload-icon.png");
        padding-left: 0;
        padding-right: 0;
        margin-top: 10px;
      }
      .saveB {
        background-image: url("../../assets/images/Other/save-icon-qa-form.png");
      }
      .editB {
        background-image: url("../../assets/images/Other/save-icon-qa.png");
      }
      .removeB {
        background-image: url("../../assets/images/Other/delete-icon-qa-form.png");
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
    }
    .rbody {
      max-height: 130px;
      overflow-y: scroll;
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