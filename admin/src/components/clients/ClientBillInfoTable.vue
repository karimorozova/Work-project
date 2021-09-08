<template lang="pug">
  .billing-table {{client.billingInfo}}
    .billing-table__modal
      
    GeneralTable(
      :fields="fields",
      :tableData="[client.billingInfo]",
      :isFilterShow="false"
      :isFilterAbsolute="false"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header {{ field.label }}

      template(slot="officialName" slot-scope="{ row, index }")
        .table__data {{ row.officialName }}

      template(slot="paymentType" slot-scope="{ row, index }")
        .table__data {{ row.name }}
      template(slot="paymentType" slot-scope="{ row, index }")
        .table__data {{ row.name }}
      template(slot="paymentType" slot-scope="{ row, index }")
        .table__data {{ row.name }}
      template(slot="paymentType" slot-scope="{ row, index }")
        .table__data {{ row.name }}
    Add(@add="addReason")

</template>

<script>
	import GeneralTable from "../GeneralTable"
	import Add from "../Add"

  export default  {
    props: {
      client: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        fields: [
          {
            label: "Official Name",
            headerKey: "headerOfficalName",
            key: "officialName",
            width: "25%",
            padding: "0"
          },
          {
            label: "Payment Type",
            headerKey: "headerPaymentType",
            key: "paymentType",
            width: "25%",
            padding: "0"
          },
          {
            label: "Payment Term",
            headerKey: "headerPaymentTerm",
            key: "paymentTerm",
            width: "25%",
            padding: "0"
          },
          // {
          //   label: "Notes",
          //   headerKey: "headerNotes",
          //   key: "notes",
          //   width: "25%",
          //   padding: "0"
          // },
        ]
      }
    },
	  components: {
	    GeneralTable,
      Add
    }
  }

</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors";


</style>
