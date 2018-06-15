<template lang="pug">
    .b-table
        .b-table__head.b-table__display
            .b-table__col(v-for='(head, index) in table.head' :class='"b-table__col-" + (index + 1)') {{head.title}}
        .b-table__body.b-table__display
          .b-table__row(v-for='(fullRowInfo, rowIndex) in table.body')
              .b-table__col.higher(v-for='(row, index) in fullRowInfo.rowInfo' :class='"b-table__col-" + (index + 1)') {{row.title}} 
                TableImage(v-if='index === 0' :body='row' :isActiveUpload='fullRowInfo.isActiveUpload')
                Select(v-if='index === 5')
                RowEdit(v-if='index === 6' @onEdit='editRow(rowIndex)' :status='fullRowInfo.activeTools')
        img.addLang(src="../../assets/images/Other/add-icon.png" @click="addLang")
</template>

<script>
import Select from "./rows/TableSelect";
import TableImage from "./rows/TableImage";
import RowEdit from "./rows/RowEdit";

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
          { title: "ISO 639-1" },
          { title: "ISO 639-2" },
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
              {
                title: ""
              }
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
    TableImage,
    Select,
    RowEdit
  }
};
</script>

<style lang="scss" scoped>
.b-table {
  &__row {
    width: 100%;
    display: flex;
    // flex-direction: column;
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
    .b-table__col {
      border: 1px solid #675842;
      border-right: 0.5px;
      &:last-child {
        border-right: 1px;
        border: 1px solid #675842;
      }
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
    }
  }
  .higher {
    height: 46px;
  }
  .addLang {
    cursor: pointer;
  }
}
</style>