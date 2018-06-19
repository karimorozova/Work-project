<template lang="pug">
.servicesWrapper
    .b-table
        .b-table__head.b-table__display
            .b-table__col(v-for='(head, index) in table.head' :class='["b-table__col-" + (index + 1), {withoutBorder: index == 3}]') {{head.title}}
        .b-table__body.b-table__display
            .b-table__row(v-for='(fullRowInfo, rowIndex) in table.body')
                .b-table__col.higher(v-for='(row, index) in fullRowInfo.rowInfo' :class='["b-table__col-" + (index + 1), {set_bottom_border: index == 0 || index == 1 || index == 2 || index == 3}]') {{row.title}} 
                    ServicesTableImage(v-if='index === 0' :body='row' :isActiveUpload='fullRowInfo.isActiveUpload')
                    ServicesSelect(v-if='index === 2')
                    ServicesRowEdit(v-if='index === 3' @onEdit='editRow(rowIndex)' :status='fullRowInfo.activeTools')
        img.addLang(src="../../assets/images/Other/add-icon.png" @click="addLang")
</template>

<script>
import ServicesSelect from "./servicesRows/ServicesTableSelect";
import ServicesTableImage from "./servicesRows/ServicesTableImage";
import ServicesRowEdit from "./servicesRows/ServicesRowEdit";

const row = {
  activeTools: [true, false, true],
  isActiveUpload: true,
  rowInfo: [
    {
      image1: '',
      image2: require("../../assets/images/Other/upload-icon.png")
    },
    { title: "" },
    { title: "" },
    { title: ""}
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
          { title: "Status" },
          { title: "" },
          { title: "" }
        ],
        body: [
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/services/SEO _ Blog Management.png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "SEO & Blog Management"},
              { title: "" },
              {
                title: ""
              }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/services/QA and Testing.png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "QA & Testing"},
              { title: "" },
              {
                title: ""
              }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/services/Localized Graphic Design.png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Localized Graphic Design"},
              { title: "" },
              {
                title: ""
              }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/services/Marketing _ Copywriting.png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Marketing _ Copywriting"},
              { title: "" },
              {
                title: ""
              }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/services/Market Research.png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Market Research"},
              { title: "" },
              {
                title: ""
              }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/services/Official Translations.png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Official Translations"},
              { title: "" },
              {
                title: ""
              }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/services/ORM – Online Reputation Management.png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "ORM – Online Reputation Management"},
              { title: "" },
              {
                title: ""
              }
            ]
          },
        ]
      }
    };
  },
  methods: {
    addLang() {
      this.table.body.push(row);
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
    ServicesRowEdit
  }
};
</script>

<style lang="scss" scoped>
.servicesWrapper {
  .b-table {
    // max-height: 126px;
    // overflow-y: scroll;
    // overflow-x: hidden;
    &__row {
      width: 100%;
      display: flex;
      padding: 0px 0 44px 0;
    }
    &__head {
      background-color: #68573e;
      opacity: 0.67;
      display: flex;
      color: white;
      .b-table__col {
        border-right: 1px solid white;
        &:last-child {
          border: none;
        }
      }
    }
    &__body {
      display: flex;
      flex-direction: column;
      max-height: 134px;
        overflow-y: scroll;
    overflow-x: hidden;
      .b-table__col {
        // border: 1px solid #675842;
        // border-right: 0.5px;
        // &:last-child {
        //   border-right: 1px;
        //   border: 1px solid #675842;
        // }
      }
    }
    &__col {
      padding-left: 10px;
      padding-top: 5px;
      padding-bottom: 5px;
      padding-right: 10px;
      display: flex;
      align-items: center;

      &-1 {
        flex-basis: 22%;
        border: 1px solid #675842;
        border-bottom: 0;
        border-top: 0;
      }
      &-2 {
        flex-basis: 25%;
        white-space: nowrap;
        overflow-x: hidden;
        border: 1px solid #675842;
        border-bottom: 1px;
        border-left: 1px;
        border-right: 0;
        border-bottom: 0;
        border-top: 0;
      }
      &-3 {
        flex-basis: 28%;
        border: 1px solid #675842;
        border-bottom: 0;
        border-right: 1px;
        border-top: 0;
      }
      &-4 {
        flex-basis: 25%;
        border: 1px solid #675842;
        border-bottom: 0;
        border-top: 0;
      }
      &-5 {
        flex-basis: 4%;
        }
    }
    .higher {
      height: 46px;
    }
  }
  .addLang {
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