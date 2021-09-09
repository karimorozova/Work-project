<template lang="pug">
  .billing-table
    .billing-table__modal
      .billing-table__modal-wrapper(v-if="isModalBillingInfo")
        BillingDetails(:billingInfo="editedInfoOrEmpty" @closeBillingInfo="closeModalBillingInfo" @updateBillingInfo="updateBillingInfo")
      .billing-table__modal-wrapper(v-if="modalBillingInfoDeleteIdOrEmpty")
        ApproveModal(
          text="Are you sure?"
          approveValue="Yes"
          notApproveValue="No"
          @approve="deleteBillingInfo"
          @close="closeDeleteModal"
          @notApprove="closeDeleteModal"
        )

      
    GeneralTable(
      :fields="fields",
      :tableData="client.billingInfo",
      :isFilterShow="false"
      :isFilterAbsolute="false"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header {{ field.label }}

      template(slot="officialName" slot-scope="{ row, index }")
        .table__data {{ row.officialName }}

      template(slot="paymentType" slot-scope="{ row, index }")
        .table__data {{ row.paymentType }}
      template(slot="paymentTerms" slot-scope="{ row, index }")
        .table__data {{ (row.paymentTerms && row.paymentTerms.name) || '' }}

      template(slot="address" slot-scope="{ row, index }")
        .table__data {{ row.address.country }}

      template(slot="icons" slot-scope="{ row, index }")
        .table__icons
          i(class="fas fa-edit" @click="editBillingInfo(row)")
          i(class="fas fa-trash" @click="deleteBillingInfoRequest(row)")

    Add(@add="openModalBillingInfo")

</template>

<script>
	import GeneralTable from "../GeneralTable"
	import Add from "../Add"
	import BillingDetails from "./BillingDetails"
	import ApproveModal from "../ApproveModal"
  import { mapActions } from "vuex"

  export default  {
    props: {
      client: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        isModalBillingInfo: false,
        modalBillingInfoDeleteIdOrEmpty: '',
        editedInfoOrEmpty: {
          paymentTerms: {},
          address: {}
        },
        fields: [
          {
            label: "Official Name",
            headerKey: "headerOfficalName",
            key: "officialName",
            // sortInfo: { isSort: true, order: 'default' },
            // filterInfo: { isFilter: true },
            style: { width: "20%" }
          },
          {
            label: "Payment Type",
            headerKey: "headerPaymentType",
            key: "paymentType",
            // sortInfo: { isSort: true, order: 'default' },
            // filterInfo: { isFilter: true },
            style: { width: "20%" }
          },
          {
            label: "Payment Terms",
            headerKey: "headerPaymentTerms",
            key: "paymentTerms",
            dataKey: "value",
            // sortInfo: { isSort: true, order: 'default' },
            // filterInfo: { isFilter: true },
            style: { width: "20%" }
          },
          {
            label: "Address",
            headerKey: "headerAddress",
            key: "address",
            dataKey: "country",
            // sortInfo: { isSort: true, order: 'default' },
            // filterInfo: { isFilter: true },
            style: { width: "20%" }
          },
          {
            label: "",
            headerKey: "headerIcons",
            key: "icons",
            style: { width: "20%" }
          },
        ]
      }
    },
    methods: {
      ...mapActions({
        setUpClientProp: "storeClientProperty",
      }),
      openModalBillingInfo() {
        this.isModalBillingInfo = true
        this.editedInfoOrEmpty = {
          paymentTerms: {},
          address: {}
        }
      },
      closeModalBillingInfo() {
        this.isModalBillingInfo = false
      },
      editBillingInfo(row) {
        this.isModalBillingInfo = true
        this.editedInfoOrEmpty = row
      },
      deleteBillingInfoRequest({_id}) {
        this.modalBillingInfoDeleteIdOrEmpty = _id
      },
      async deleteBillingInfo() {
        await this.$http.post(`/clientsapi/delete-billing-info/${this.$route.params.id}`, {billingInfoId: this.modalBillingInfoDeleteIdOrEmpty})
        await this.updateBillingInfo()
      },
      closeDeleteModal() {
        this.modalBillingInfoDeleteIdOrEmpty = ''
      },
      async updateBillingInfo () {
        const billingInfo = await this.$http.post(`/clientsapi/get-billing-info/${this.$route.params.id}`)
        this.setUpClientProp({prop: 'billingInfo', value: billingInfo.data})
        this.closeModalBillingInfo()
        this.closeDeleteModal()

      }
    },
	  components: {
	    GeneralTable,
      Add,
      BillingDetails,
      ApproveModal,
    }
  }

</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors";
  .billing-table {
    &__modal-wrapper {
      position: absolute;
      z-index: 2;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }


  .table__header,
  .table__data {
    padding: 0 7px;
  }
  .table__icons {
    display: flex;
    justify-content: center;
    gap: 10px;
    font-size: 16px;
    width: 100%;
    i{
      cursor: pointer;
    }
  }

</style>
