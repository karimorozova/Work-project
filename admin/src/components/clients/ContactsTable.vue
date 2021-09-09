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

        .table__data(slot="name" slot-scope="{ row }") {{ getFullName(row) }}
        .table__data(slot="email" slot-scope="{ row, index }")  {{ row.email }}
        .table__data(slot="position" slot-scope="{ row, index }") {{ row.position }}

        .table__radio(slot="lead" slot-scope="{ row, index }")
          CustomRadio(:isChecked="row.leadContact" @toggleRadio="setLeadContact(index)")

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
					{ label: "Full Name", headerKey: "headerName", key: "name", style: { width: "30%" } },
					{ label: "Position", headerKey: "headerPosition", key: "position", style: { width: "23%" } },
					{ label: "Email", headerKey: "headerEmail", key: "email", style: { width: "30%" } },
					{ label: "Lead", headerKey: "headerLead", key: "lead", style: { width: "7%" } },
					{ label: "", headerKey: "headerIcons", key: "icons", style: { width: "10%" } }
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
			setLeadContact(index) {
				this.$emit("setLeadContact", { index })
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
      transform: translate(-50%, -50%);
    }
  }

  .table {
    &__header,
    &__data {
      padding: 0 7px;
      width: 100%;
      text-align: left;
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

  /*.contacts-info {
    font-size: 14px;
    font-weight: normal;
    border: none;
    outline: none;
    position: relative;

    &__fontIcon {
      font-size: 16px;
      margin-top: 5px;
      cursor: pointer;
    }

    &_opacity {
      opacity: 0.5;
    }

    &__data-cell, &__info__input {
      overflow-x: hidden;
      height: 31px;
      padding: 0 5px;
      align-items: center;
      display: flex;
    }

    &__radio {
      display: flex;
      justify-content: center;
      padding-top: 8px;
    }

    &__icons {
      padding-top: 3px;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    &__icon {
      cursor: pointer;
    }

    &__active {
      height: 30px;
      overflow-x: hidden;
      padding: 0 5px;
      align-items: center;
      display: flex;
      box-shadow: inset 0 0 5px $brown-shadow;
    }

    &__input {
      width: 100%;
      border: none;
      outline: none;
      color: $main-color;
      padding: 0 2px;
      background-color: transparent;
    }

    &__add-contact {
      display: flex;
      width: 100%;
      margin-bottom: 15px;
      justify-content: flex-end;
    }

    &__error {
      position: absolute;
      border: 1px solid $orange;
      background-color: $white;
      box-shadow: 0 0 15px $orange;
      width: 300px;
      top: 50%;
      left: 50%;
      margin-left: -150px;
      padding: 0 15px;
      z-index: 50;
      display: flex;
      align-items: center;
    }

    &__error-message {
      position: relative;
      width: 100%;
      height: 100%;
      font-weight: bolder;
      font-size: 14px;
    }

    &__close {
      position: absolute;
      font-size: 24px;
      font-weight: 700;
      top: -2px;
      right: -9px;
      transform: rotate(45deg);
      cursor: pointer;
    }

    &__approve {
      position: absolute;
      z-index: 50;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__cancel-edition {
      cursor: pointer;
      position: absolute;
      right: -100px;
      top: 45%;
      padding: 5px;
      border: 1px solid $orange;
      border-radius: 4px;
      color: $orange;
      font-weight: 700;
      z-index: 10;
      background-color: $white;
    }
  }

  .editing {
    box-shadow: inset 0 0 8px $brown-shadow;
  }

  input {
    color: $main-color;
  }
*/
</style>
