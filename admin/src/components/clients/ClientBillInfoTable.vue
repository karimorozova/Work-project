<template lang="pug">
  .billing-table
    .billing-table__modal
      .billing-table__modal-wrapper(v-if="isModalBillingInfo")
        BillingDetails(
          :billingInfo="editedInfoOrEmpty"
          @closeBillingInfo="closeModalBillingInfo"
          @updateBillingInfo="updateBillingInfo"
          :clientContacts="client.contacts"
        )

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
        .table__data {{ row.paymentType || '' }}

      template(slot="country" slot-scope="{ row, index }")
        .table__data {{ row.address.country }}

      template(slot="contacts" slot-scope="{ row, index }")
        .table__data(v-if="!row.contacts.length") -
        .table__data(v-else)
          .images
            .image(v-for="(item, index) in row.contacts")
              .tooltip
                span#myTooltip.tooltiptext(:style="{ 'right': `${30 + 10 * index + 'px'}` }") {{ item.firstName + ' ' + item.surname }}
                .table__icons-info
                  img.image__first(style="z-index: 100" v-if="item.photo && index === 0" :src="item.photo")
                  img.image__first(style="z-index: 100" v-if="!item.photo && index === 0" :src="require(`../../assets/images/avatars/avatar-${index % 3}.png`)")
                  img.image__next(:style="{'z-index': `${20 - index}`, 'left': `${-10 * index + 'px'}` }" v-if="item.photo && index" :src="item.photo")
                  img.image__next(:style="{'z-index': `${20 - index}`, 'left': `${-10 * index + 'px'}`  }" v-if="!item.photo && index" :src="require(`../../assets/images/avatars/avatar-${index % 3}.png`)")

      template(slot="icons" slot-scope="{ row, index }")
        .table__icons
          i(class="fas fa-pen" @click="editBillingInfo(row)")
          i(class="fas fa-trash" @click="deleteBillingInfoRequest(row)")

    Add(@add="openModalBillingInfo")

</template>

<script>
	import GeneralTable from "../GeneralTable"
	import Add from "../Add"
	import BillingDetails from "./BillingDetails"
	import ApproveModal from "../ApproveModal"
	import { mapActions } from "vuex"

	export default {
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
						style: { width: "24%" }
					},
					{
						label: "Payment Type",
						headerKey: "headerPaymentType",
						key: "paymentType",
						style: { width: "24%" }
					},
					{
						label: "Country",
						headerKey: "headerCountry",
						key: "country",
						style: { width: "24%" }
					},
					{
						label: "Billing Contacts",
						headerKey: "headerContacts",
						key: "contacts",
						style: { width: "17%" }
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						style: { width: "11%" }
					}
				]
			}
		},
		methods: {
			...mapActions({
				setUpClientProp: "storeClientProperty"
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
			deleteBillingInfoRequest({ _id }) {
				this.modalBillingInfoDeleteIdOrEmpty = _id
			},
			async deleteBillingInfo() {
				await this.$http.post(`/clientsapi/delete-billing-info/${ this.$route.params.id }`, { billingInfoId: this.modalBillingInfoDeleteIdOrEmpty })
				await this.updateBillingInfo()
			},
			closeDeleteModal() {
				this.modalBillingInfoDeleteIdOrEmpty = ''
			},
			async updateBillingInfo() {
				const billingInfo = await this.$http.post(`/clientsapi/get-billing-info/${ this.$route.params.id }`)
				this.setUpClientProp({ prop: 'billingInfo', value: billingInfo.data })
				this.closeModalBillingInfo()
				this.closeDeleteModal()

			}
		},
		components: {
			GeneralTable,
			Add,
			BillingDetails,
			ApproveModal
		}
	}

</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors";

  .images {
    display: flex;
    height: 40px;
    align-items: center;
  }

  .image {
    height: 24px;
    width: 24px;

    &__first,
    &__next {
      height: 24px;
      width: 24px;
      border-radius: 24px;
      object-fit: cover;
    }
  }

  .billing-table {
    &__modal-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 120;
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
    gap: 13px;
    font-size: 15px;
    width: 100%;

    i {
      cursor: pointer;
    }
  }
  .tooltip {
    position: relative;
    display: flex;

    .tooltiptext {
      visibility: hidden;
      font-size: 14px;
      width: max-content;
      background-color: white;
      color: $text;
      text-align: center;
      border-radius: 4px;
      //right: 28px;
      bottom: -1px;
      padding: 7px 12px;
      position: absolute;
      z-index: 999;
      opacity: 0;
      transition: opacity .3s;
      border: 1px solid $border;

      &::after {
        content: "";
        position: absolute;
        top: 30%;
        right: -12px;
        transform: rotate(270deg);
        border-width: 6px;
        border-style: solid;
        border-color: $border transparent transparent;
      }
    }

    &:hover {
      .tooltiptext {
        visibility: visible;
        opacity: 1;
      }
      .image__next {
        z-index: 101 !important;
      }
    }
  }
</style>
