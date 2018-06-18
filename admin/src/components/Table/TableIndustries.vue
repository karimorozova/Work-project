<template lang="pug">
.servicesWrapper
    .b-table
        .b-table__head.b-table__display
            .b-table__col(v-for='(head, index) in table.head' :class='"b-table__col-" + (index + 1)') {{head.title}}
        .b-table__body.b-table__display
            .b-table__row(v-for='(fullRowInfo, rowIndex) in table.body')
                .b-table__col.higher(v-for='(row, index) in fullRowInfo.rowInfo' :class='["b-table__col-" + (index + 1), {set_bottom_border: index == 0 || index == 1 || index == 2 || index == 3}]') {{row.title}} 
                    IndustriesTableImage(v-if='index === 0' :body='row' :isActiveUpload='fullRowInfo.isActiveUpload')
                    IndustriesGenericTB(v-if="index == 2" :body='row' :isActiveUpload='fullRowInfo.isActiveUpload')
                    IndustriesSelect(v-if='index === 3')
                    IndustriesRowEdit(v-if='index === 4' @onEdit='editRow(rowIndex)' :status='fullRowInfo.activeTools')
        img.addLang(src="../../assets/images/Other/add-icon.png" @click="addLang")
</template>

<script>
import IndustriesSelect from "./industriesRows/IndustriesTableSelect";
import IndustriesTableImage from "./industriesRows/IndustriesTableImage";
import IndustriesRowEdit from "./industriesRows/IndustriesRowEdit";
import IndustriesGenericTB from "./industriesRows/IndustriesGenericTB";

const row = {
  activeTools: [true, false, true],
  isActiveUpload: true,
  rowInfo: [
    {
      image1: "",
      image2: require("../../assets/images/Other/upload-icon.png")
    },
    { title: "" },
    { image2: require("../../assets/images/Other/upload-icon.png") },
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
          { title: "Generic TB" },
          { title: "Status" },
          { title: "" }
        ],
        body: [
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/industries/casino,poker_igaming (2).png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "CASINO, POKER & GAMING" },
              {
                image3: require("../../assets/images/Other/Download-icon.png")
              },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/industries/icos_cryptocurrency (2).png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "ICO & CRYPTOCURRENCY" },
              {
                image3: require("../../assets/images/Other/Download-icon.png")
              },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/industries/legal icon.png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "LEGAL" },
              {
                image3: require("../../assets/images/Other/Download-icon.png")
              },
              { title: "" },
              { title: "" }
            ]
          }
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
    IndustriesTableImage,
    IndustriesSelect,
    IndustriesRowEdit,
    IndustriesGenericTB
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
        flex-basis: 20%;
        border: 1px solid #675842;
        border-bottom: 0;
        border-top: 0;
      }
      &-2 {
        flex-basis: 20%;
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
        flex-basis: 20%;
        border: 1px solid #675842;
        border-bottom: 0;
        border-right: 1px;
        border-top: 0;
      }
      &-4 {
        flex-basis: 20%;
        border: 1px solid #675842;
        border-bottom: 0;
        border-top: 0;
      }
      &-5 {
        flex-basis: 20%;
        border: 1px solid #675842;
        border-top: 0;
        border-left: 0;
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