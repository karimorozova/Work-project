<template lang="pug">
  .contacts-info
    .contacts-info__modal(v-if="isContactsManageModal")
      ContactsManageModal(
        :contact="controlContact"
        @closeModal="closeContactModal"
        @contactSave="contactSave"
      )

    .contacts-info__table
      GeneralTable(
        :fields="fields"
        :tableData="contacts"
      )
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .table__header {{ field.label }}

        .table__dataImage(slot="name" slot-scope="{ row }")
          img.image(v-if="$route.params.id && row.photo" :src="row.photo")
          img.image(v-else :src="require('../../assets/images/avatars/avatar-0.png')")
          span {{ getFullName(row) }}
        .table__data(slot="email" slot-scope="{ row, index }")  {{ row.email }}
        .table__data(slot="position" slot-scope="{ row, index }") {{ row.position }}

        .table__radio(slot="lead" slot-scope="{ row, index }")
          CustomRadio(:isChecked="row.leadContact" @toggleRadio="setLeadContact(row._id, index)")

        .table__icons(slot="icons" slot-scope="{ row, index }")
          .table__icon(@click="showContactDetails(index)")
            i(class="fas fa-pen")
          .table__icon(@click="openDeleteModal(index)")
            i(class="fas fa-trash")

    .contacts-info__approveModal(v-if="isDeleteMessageShow")
      ApproveModal(
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approveDelete"
        @notApprove="cancelDelete"
        @close="cancelDelete"
      )

    Add(@add="addContact")
</template>

<script>
	import CustomRadio from "../CustomRadio"
	import Add from "../Add"
	import ApproveModal from '../ApproveModal'
	import GeneralTable from "../GeneralTable"
	import ContactsManageModal from "./ContactsManageModal"

	export default {
		props: {
			contacts: {
				type: Array
			}
		},
		data() {
			return {
				domain: 'http://localhost:3001',
				fields: [
					{ label: "Full Name", headerKey: "headerName", key: "name", style: { width: "31%" } },
					{ label: "Position", headerKey: "headerPosition", key: "position", style: { width: "20%" } },
					{ label: "Email", headerKey: "headerEmail", key: "email", style: { width: "31%" } },
					{ label: "Lead", headerKey: "headerLead", key: "lead", style: { width: "7%" } },
					{ label: "", headerKey: "headerIcons", key: "icons", style: { width: "11%" } }
				],

				isDeleteMessageShow: false,
				controlContact: {},
				isContactsManageModal: false,
				deletingContactIndex: -1,
				editingIndex: -1
			}
		},
		methods: {
			getFullName: (contact) => (`${ contact.firstName } ${ contact.surname || '' }`),
			setLeadContact(id, index) {
				this.$emit("setLeadContact", { id, index })
			},
			addContact() {
				this.controlContact = {
					timezone: "",
					leadContact: false,
					firstName: "",
					surname: "",
					email: "",
					gender: "",
					position: "",
					phone: "",
					photo: "",
					country: "",
					notes: ""
				}
				this.isContactsManageModal = true
			},
			showContactDetails(index) {
				this.editingIndex = index
				this.controlContact = { ...this.contacts[index] }
				this.isContactsManageModal = true
			},
			closeContactModal() {
				this.controlContact = {}
				this.isContactsManageModal = false
				this.editingIndex = -1
			},
			contactSave(data) {
				if (this.editingIndex !== -1) {
					this.$emit('contactUpdate', { ...data, index: this.editingIndex })
				} else {
					this.$emit('contactSave', { ...data })
				}
			},
			cancelDelete() {
				this.isDeleteMessageShow = false
				this.deletingContactIndex = -1
			},
			openDeleteModal(index) {
				this.deletingContactIndex = index
				this.isDeleteMessageShow = true
			},
			approveDelete() {
				if (this.deletingContactIndex === -1) return
				this.$emit('approveDelete', { index: this.deletingContactIndex })
				this.cancelDelete()
			}
		},
		mounted() {
			this.domain = __WEBPACK__API_URL__
		},
		components: {
			ContactsManageModal,
			GeneralTable,
			CustomRadio,
			Add,
			ApproveModal
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .contacts-info {
    position: relative;

    &__modal,
    &__approveModal {
      position: absolute;
      z-index: 10;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -40%);
    }
  }

  .table {
    &__header,
    &__data {
      padding: 0 7px;
      width: 100%;
      text-align: left;
    }
    &__dataImage{
      height: 40px;
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 0 7px;
    }

    &__radio {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    &__icon {
      cursor: pointer;
    }

    &__icons {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 13px;
      width: 100%;
      height: 40px;
      font-size: 15px;
    }
  }

  .image {
    height: 24px;
    width: 24px;
    border-radius: 24px;
    object-fit: cover;
  }
</style>
