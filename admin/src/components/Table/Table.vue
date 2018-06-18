<template lang="pug">
.langWrapper
  .b-table
      .b-table__head.b-table__display
          .b-table__col(v-for='(head, index) in table.head' :class='"b-table__col-" + (index + 1)') {{head.title}}
            ISO(v-if="index == 3" :titlesp1="titlesp1Value" titlesp2="(two letters)")
            ISO1(v-if="index == 4" :titlesp3="titlesp1Value" titlesp4="(three letters)")
      .b-table__body.b-table__display
        .b-table__row(v-for='(fullRowInfo, rowIndex) in table.body')
            .b-table__col.higher(v-for='(row, index) in fullRowInfo.rowInfo' :class='["b-table__col-" + (index + 1), {set_bottom_border: index == 0 || index == 1 || index == 2 || index == 3 || index == 4 || index == 5 || index == 6}]') {{row.title}} 
              TableImage(v-if='index === 0' :body='row' :isActiveUpload='fullRowInfo.isActiveUpload')
              Select(v-if='index === 5')
              RowEdit(v-if='index === 6' @onEdit='editRow(rowIndex)' :status='fullRowInfo.activeTools')
  img.addLang(src="../../assets/images/Other/add-icon.png" @click="addLang")
</template>

<script>
import Select from "./rows/TableSelect";
import TableImage from "./rows/TableImage";
import RowEdit from "./rows/RowEdit";
import ISO from "./rows/ISO"
import ISO1 from "./rows/ISO1"

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
    { title: "" },
    { title: "" },
    { title: "" },
    {
      title: ""
    }
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
          { title: "Symbol" },
          { title: "" },
          { title: "" },
          { title: "Status" },
          { title: "" }
        ],
        body: [
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Afrikaans [AF].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Africaans" },
              { title: "AF" },
              { title: "af" },
              { title: "afr" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Arabic (Egypt) [AR-EG].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Arabic (Egypt)" },
              { title: "AR" },
              { title: "ar" },
              { title: "are" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Arabic (Morocco) [AR-MA].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Arabic (Morocco)" },
              { title: "AR" },
              { title: "ar" },
              { title: "arm" },
              { title: "" },
              { title: "" }
            ]
          }
        ]
      },
      titlesp1Value: 'ISO 639-1',
      titlesp1Value: 'ISO 639-2'
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
    TableImage,
    Select,
    RowEdit,
    ISO,
    ISO1
  }
};
</script>

<style lang="scss" scoped>
.langWrapper {
  .b-table {
    &__row {
      width: 103%;
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
      max-height: 137px;
      overflow-y: scroll;
      overflow-x: hidden;
      .b-table__col {
        border: 1px solid #675842;
        border-right: 0.5px;
        border-top: 0;
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
        flex-basis: 15%;
      }
      &-2 {
        flex-basis: 21%;
        border-bottom: 0;
      }
      &-3 {
        flex-basis: 10%;
      }
      &-4 {
        flex-basis: 12%;
      }
      &-5 {
        flex-basis: 12%;
      }
      &-6 {
        flex-basis: 11%;
        padding-right: 0;
      }
      &-7 {
        flex-basis: 16%;
        border-bottom: 0;
        border-top: 0;
      }
    }
    .set_bottom_border {
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: #675842;
  }
    .higher {
      height: 46px;
    }
  }
  .addLang {
    cursor: pointer;
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