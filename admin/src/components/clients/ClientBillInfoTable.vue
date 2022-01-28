<template lang="pug">
  .billing-table
    .billing-table__modal
      .billing-table__modal-wrapper(v-if="isModalBillingInfo")
        BillingDetails(
          :clientContacts="client.contacts"
          :billingInfo="editedInfoOrEmpty"
          @updateClient="updateClient"
          @updateClientWithoutClosing="updateClientWithoutClosing"
        )
      .billing-table__modal-wrapper(v-if="modalBillingInfoDeleteIdOrEmpty")
        ApproveModal(
          text="Are you sure?"
          approveValue="Yes"
          notApproveValue="Cancel"
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

      template(slot="name" slot-scope="{ row, index }")
        .table__data {{ row.name }}

      template(slot="officialName" slot-scope="{ row, index }")
        .table__data {{ row.officialName }}

      template(slot="paymentType" slot-scope="{ row, index }")
        .table__data {{ row.paymentType || '' }}

      template(slot="terms" slot-scope="{ row, index }")
        .table__data {{ row.paymentTerms ? row.paymentTerms.name : '-' }}

      template(slot="contacts" slot-scope="{ row, index }")
        .table__data(v-if="!row.contacts.length") -
        .table__data(style="display: flex; align-items: flex-end;" v-else)
          .images
            .image(v-for="(item, index) in row.contacts.length > 6 ? row.contacts.slice(0, 6) : row.contacts ")
              .tooltip
                .tooltiptext(:style="{ 'right': `${50 + 'px'}` }") {{ item.firstName + ' ' + item.surname }}

                .user__image.next(style="z-index: 20" v-if="index === 0")
                  .user
                  img(v-if="item.photo" :src="domain+item.photo")
                  .user__fakeImage(:style="{'--bgColor': getBgColor(item._id)[0], '--color':getBgColor(item._id)[1]  }" v-else)
                    span {{ item.firstName[0].toUpperCase() }}

                .user__image.next(:style="{'z-index': `${20 - index}`, 'margin-left': `-9px` }" v-else)
                  .user
                  img(v-if="item.photo" :src="domain+item.photo")
                  .user__fakeImage(:style="{'--bgColor': getBgColor(item._id)[0], '--color':getBgColor(item._id)[1]  }" v-else)
                    span {{ item.firstName[0].toUpperCase() }}

          span(style="margin-left: 6px; margin-bottom: 1px;") {{ row.contacts.length > 6 ? '...' : '' }}

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
import { mapActions, mapGetters } from "vuex"
import getBgColor from "../../mixins/getBgColor"

export default {
  mixins: [ getBgColor ],
  data() {
    return {
      domain: '',
      isModalBillingInfo: false,
      modalBillingInfoDeleteIdOrEmpty: '',
      editedInfoOrEmpty: {
        paymentTerms: {},
        address: {}
      },
      fields: [
        {
          label: "Name",
          headerKey: "headerBillingName",
          key: "name",
          style: { width: "20%" }
        },
        {
          label: "Official Name",
          headerKey: "headerOfficalName",
          key: "officialName",
          style: { width: "20%" }
        },
        {
          label: "Payment Type",
          headerKey: "headerPaymentType",
          key: "paymentType",
          style: { width: "15%" }
        },
        {
          label: "Payment Terms",
          headerKey: "headerCountry",
          key: "terms",
          style: { width: "15%" }
        },
        {
          label: "Billing Contacts",
          headerKey: "headerContacts",
          key: "contacts",
          style: { width: "20%" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: { width: "10%" }
        }
      ]
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeCurrentClient: "storeCurrentClient"
    }),
    openModalBillingInfo() {
      this.isModalBillingInfo = true
      this.editedInfoOrEmpty = {
        paymentTerms: {},
        address: {}
      }
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
      const client = (await this.$http.get(`/clientsapi/client-with-activities?id=${ this.$route.params.id }`)).data
      await this.storeCurrentClient(client)
      this.closeDeleteModal()
    },
    closeDeleteModal() {
      this.modalBillingInfoDeleteIdOrEmpty = ''
    },
    async updateClientWithoutClosing({ billingInfoId }) {
      try {
        const client = (await this.$http.get(`/clientsapi/client-with-activities?id=${ this.$route.params.id }`)).data
        await this.storeCurrentClient(client)
        this.setBIAfterUpdate(client, billingInfoId)
        this.alertToggle({ message: "Updated", isShow: true, type: "success" })
      } catch (e) {
        this.alertToggle({ message: "Error on getting managers", isShow: true, type: "error" })
      }
    },
    async updateClient({ billingInfoId }) {
      try {
        const client = (await this.$http.get(`/clientsapi/client-with-activities?id=${ this.$route.params.id }`)).data
        await this.storeCurrentClient(client)
        this.setBIAfterUpdate(client, billingInfoId)
        this.isModalBillingInfo = false
        this.alertToggle({ message: "Updated", isShow: true, type: "success" })
      } catch (e) {
        this.alertToggle({ message: "Error on getting managers", isShow: true, type: "error" })
      }
    },
    setBIAfterUpdate(client, billingInfoId) {
      billingInfoId
          ? this.editedInfoOrEmpty = client.billingInfo.find(({ _id }) => _id === billingInfoId)
          : this.editedInfoOrEmpty = client.billingInfo[client.billingInfo.length - 1]
    }
  },
  mounted() {
    this.domain = __WEBPACK__API_URL__
  },
  components: {
    GeneralTable,
    Add,
    BillingDetails,
    ApproveModal
  },
  computed: {
    ...mapGetters({
      client: "getCurrentClient"
    })
  }
}

</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.images {
  display: flex;
}

.user {
  &__fakeImage {
    height: 32px;
    width: 32px;
    border-radius: 32px;
    background-color: var(--bgColor);
    color: var(--color);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }

  &__image {
    height: 32px;
    width: 32px;
    border-radius: 32px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 32px;
    }
  }
}

.next {
  transition: transform .2s;

  &:hover {
    transform: scale(1.2);
  }
}

.billing-table {
  &__modal-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 120;
    transform: translate(-50%, -51%);
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
