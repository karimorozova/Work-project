<template lang="pug">
  .invoicing-details
    .invoicing-details__wrapper
      .invoicing-details__details
        .invoicing-details__title
          .title__block
            | Report Details
            .add-button(@click="changeToggleAddSteps")
              i.fas.fa-times-circle(v-if="toggleAddSteps")
              i.fas.fa-plus-circle(v-else)
          .icon-button(@click="closeModal")
            i.fas.fa-times-circle
        .invoicing-details__body
          .invoicing-details__text
            .text__block
              .text__title Vendor Name:
              .text__value {{reportDetailsInfo.vendor.firstName + ' ' + reportDetailsInfo.vendor.surname}}
            .text__block
              .text__title Creation Date:
              .text__value {{ formattedDate(reportDetailsInfo.createdAt)}}
            .text__block
              .text__title Report ID:
              .text__value {{reportDetailsInfo.reportId}}
            .text__block
              .text__title Total Amount:
              .text__value {{ getStepsPayables(reportDetailsInfo.steps)| roundTwoDigit }}
            .text__block
              .text__title Address:
              .text__value test address


          .invoicing-details__table
            GeneralTable(
              :fields="fields",
              :tableData="reportDetailsInfo.steps",
              :isFilterShow="false"
              :isFilterAbsolute="false"
              :isBodyShort="true"
            )

              template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
                .table__header {{ field.label }}

              template(slot="stepId" slot-scope="{ row, index }")
                .table__data {{ row.stepId }}

              template(slot="service" slot-scope="{ row, index }")
                .table__data {{ row.service.title }}

              template(slot="langPair" slot-scope="{ row, index }")
                .table__data {{ row.sourceLanguage}}
                  span(style="font-size: 12px;color: #9c9c9c;margin: 0 2px;")
                    i(class="fas fa-angle-double-right")
                  | {{ row.targetLanguage }}

              template(slot="payables" slot-scope="{ row, index }")
                .table__data {{ row.nativeFinance.Price.payables | roundTwoDigit}}

              template(slot="payables" slot-scope="{ row, index }")
                .table__data {{ row.nativeFinance.Price.payables | roundTwoDigit}}

              template(slot="icons", slot-scope="{ row, index }")
                .table__icons
                  i(class="fas fa-trash" @click="deleteStep(row._id)")
      .invoicing-details__add-steps
        .add-steps__title

        .add-steps__body
          AddStepsToInvoicing.add-steps__table(v-if="toggleAddSteps" :invoicingEditId="reportDetailsInfo._id" :invoicingVendorId="reportDetailsInfo.vendor._id" @refreshReports="refreshReports")


</template>

<script>
import GeneralTable from '../GeneralTable'
import moment from "moment"
import crudIcons from "../../mixins/crudIcons"
import AddStepsToInvoicing from "./AddStepsToInvoicing"
export default {
  mixins: [ crudIcons ],
  name: "InvoicingDetails",
  props: {
    reportDetailsInfo: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Step Id",
          headerKey: "headerStepId",
          key: "stepId",
          style: { width: "25%" }
        },
        {
          label: "Step",
          headerKey: "headerService",
          key: "service",
          style: { width: "25%" }
        },
        {
          label: "Language Pair",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { width: "25%" }
        },
        {
          label: "Fee ",
          headerKey: "headerPayables",
          key: "payables",
          style: { width: "20%" }
        },


        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: {width: "5%"},
        }
      ],
      toggleAddSteps: false,

    }
  },
  methods: {
    getStepsPayables(stepFinance){
      return stepFinance.reduce((sum, step) => {
        sum += step.nativeFinance.Price.payables || 0
        return sum
      }, 0)
    },
    formattedDate(date) {
      return moment(date).format("DD-MM-YYYY");
    },
    closeModal() {
      this.$emit('closeModal')
    },
    deleteStep(stepId) {
      this.$emit('deleteStep', {reportId: this.reportDetailsInfo._id, stepId })
    },
    refreshReports() {
      this.$emit('refreshDetailsOfReports', this.reportDetailsInfo._id)
    },
    addNewSteps() {
      this.$emit('addSteps', {reportId: this.reportDetailsInfo._id})
    },
    changeToggleAddSteps() {
      this.toggleAddSteps = !this.toggleAddSteps
    }
  },
  computed: {
    editDeleteIcon() {
      console.log(this.icons)
      const { cancel, edit, save, ...result } = this.icons
      return result
    },
  },
  components: {
    GeneralTable,
    AddStepsToInvoicing
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.invoicing-details {
  width: 1200px;
  background: #fff;
  &__body {
    display: flex;
    justify-content: space-between;
  }
  &__wrapper {
    border-radius: 4px;
    padding: 20px;
    box-sizing: border-box;
    box-shadow: 0 1px 2px 0 rgba(99,99,99,.3),0 1px 3px 1px rgba(99,99,99,.15);
  }
  &__table {
    width: 70%;
  }

  &__text {
    width: 30%;
  }

  &__title {
    //display: flex;
    //justify-content: center;
    //margin-bottom: 10px;
    //font-size: 18px;
    font-size: 21px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: Myriad600;
  }
}
.text{
  &__block {
    margin: 10px 0;
    width: 300px;
    display: flex;
    justify-content: space-between;
  }
  &__title {
    font-family: Myriad600;
    width: 100px;
    //text-align: end;
  }
  &__value {
    width: 150px;

  }
}
.table {
  &__header,
  &__data {
    padding: 0 6px;
  }

  &__data {
    width: 100%;
  }

  &__icons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    width: 100%;
    height: 40px;

    &-info {
      cursor: help;
      color: $red;
      font-size: 16px;
    }

    &-link {
      cursor: pointer;
      font-size: 16px;
    }

    &-link-opacity {
      cursor: default;
      font-size: 16px;
      opacity: 0.5;
    }
  }
}
.add-steps {
  &__table {
    margin: 10px 0;
  }
}
.icon-button,
.table__icons {
  font-size: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: .2s ease-out;
  justify-content: center;
  color: $dark-border;

  &:hover {
    color: $text;

  }
}


.title__block {
  display: flex;
  .add-button {
    margin-left: 10px;
    font-size: 16px;
    border: 1px solid $border;
    border-radius: 4px;
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: .2s ease-out;
    justify-content: center;
    color: $dark-border;


    &:hover {
      color: $text;

    }
  }
}
</style>