<template lang="pug">
  .contacts-info
    .contacts-info__table
      DataTable(
        :fields="fields"
        :tableData="client.contacts"
        :bodyClass="contactsLength < 5 ? 'tbody_visible-overflow' : ''"
        :tableheadRowClass="contactsLength < 5 ? 'tbody_visible-overflow' : ''"
        bodyRowClass="cursor-default"
      )
        template(slot="headerName" slot-scope="{ field }")
          span.contacts-info__header-title {{ field.label }}
        template(slot="headerEmail" slot-scope="{ field }")
          span.contacts-info__header-title {{ field.label }}
        template(slot="headerPosition" slot-scope="{ field }")
          span.contacts-info__header-title {{ field.label }}
        template(slot="headerPhone" slot-scope="{ field }")
          span.contacts-info__header-title {{ field.label }}
        template(slot="headerNotes" slot-scope="{ field }")
          span.contacts-info__header-title {{ field.label }}
        template(slot="headerLead" slot-scope="{ field }")
          span.contacts-info__header-title {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          span.contacts-info__header-title {{ field.label }}

        template(slot="name" slot-scope="{ row }")
          .contacts-info__data-cell {{ getFullName(row) }}

        template(slot="email" slot-scope="{ row, index }")
          .contacts-info__active(v-if="currentEditingIndex === index")
            input.contacts-info__input(type="text" v-model="currentEmail")
          .contacts-info__data-cell(v-else) {{ row.email }}

        template(slot="position" slot-scope="{ row, index }")
          .contacts-info__active(v-if="currentEditingIndex === index")
            input.contacts-info__input(type="text" v-model="currentPosition")
          .contacts-info__data-cell(v-else) {{ row.position }}

        template(slot="phone" slot-scope="{ row, index }")
          .contacts-info__active(v-if="currentEditingIndex === index")
            input.contacts-info__input(type="text" v-model="currentPhone")
          .contacts-info__data-cell(v-else) {{ row.phone }}

        template(slot="notes" slot-scope="{ row, index }")
          .contacts-info__active(v-if="currentEditingIndex === index")
            input.contacts-info__input(type="text" v-model="currentNotes")
          .contacts-info__data-cell(v-else) {{ row.notes }}

        template(slot="lead" slot-scope="{ row, index }")
          .contacts-info__radio
            CustomRadio(:isChecked="row.leadContact" @toggleRadio="setLeadContact(index)")

        template(slot="icons" slot-scope="{ row, index }")
          .contacts-info__icons
            .contacts-info__fontIcon(@click="showContactDetails({index})")
              i.far.fa-address-card
            img.contacts-info__icon(v-for="(icon, key) in icons" :src="icon.icon" @click.stop="makeAction(index, key)" :class="{'contacts-info_opacity': isIconClass(index, key)}")
    .contacts-info__approve(v-if="isDeleteMessageShow")
      ApproveModal(
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approveDelete"
        @notApprove="cancelDelete"
        @close="cancelDelete"
      )
    ValidationErrors(v-if="areErrorsExist"
      :errors="errors"
      :customStyles="errorsStyle"
      @closeErrors="closeValidErrorsBlock"
    )

    Add(@add="addContact")
</template>

<script>
	import DataTable from "../DataTable"
	import CustomRadio from "../CustomRadio"
	import Add from "../Add"
	import ValidationErrors from "../ValidationErrors"
	import ApproveModal from '../ApproveModal'
	import { mapGetters, mapActions } from 'vuex'

	export default {
		props: {
			client: {
				type: Object
			}
		},
		data() {
			return {
				fields: [
					{ label: "Full Name", headerKey: "headerName", key: "name", width: "18%", padding: "0" },
					{ label: "Email", headerKey: "headerEmail", key: "email", width: "18%", padding: "0" },
					{ label: "Position", headerKey: "headerPosition", key: "position", width: "18%", padding: "0" },
					{ label: "Phone number", headerKey: "headerPhone", key: "phone", width: "16%", padding: "0" },
					{ label: "Notes", headerKey: "headerNotes", key: "notes", width: "16%", padding: "0" },
					{ label: "Lead", headerKey: "headerLead", key: "lead", width: "7%", padding: "0" },
					{ label: "", headerKey: "headerIcons", key: "icons", width: "7%", padding: "0" }
				],
				icons: {
					delete: { name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png') }
				},
				currentEditingIndex: -1,
				isErrorShow: false,
				isDeleteMessageShow: false,
				currentEmail: "",
				currentPhone: "",
				oldEmail: "",
				currentPosition: "",
				currentNotes: "",
				deletingContactIndex: -1,
				areErrorsExist: false,
				errors: [],
				errorsStyle: {
					"position": "absolute",
					"top": "-25px",
					"left": "50%",
					"margin-left": "-170px"
				}
			}
		},
		methods: {
			cancelDelete() {
				this.isDeleteMessageShow = false
			},
			closeErrorMessage() {
				this.isErrorShow = false
			},
			closeValidErrorsBlock() {
				this.areErrorsExist = false
			},
			approveDelete() {
				this.$emit('approveDelete', { index: this.deletingContactIndex })
				this.isDeleteMessageShow = false
			},
			isIconClass(index, key) {
				if (this.currentEditingIndex !== index) {
					return key === 'save' || key === 'cancel'
				}
				if (this.currentEditingIndex === index) {
					return key === 'edit'
				}
			},
			setCurrentEditionValues(index) {
				this.currentEditingIndex = index
				this.currentEmail = this.client.contacts[index].email
				this.oldEmail = this.client.contacts[index].email
				this.currentPosition = this.client.contacts[index].position
				this.currentNotes = this.client.contacts[index].notes
				this.currentPhone = this.client.contacts[index].phone
			},
			setCurrentDefaults() {
				this.currentEditingIndex = -1
				this.currentEmail = ""
				this.oldEmail = ""
				this.currentPosition = ""
				this.currentNotes = ""
				this.currentPhone = ""
			},
			makeAction(index, key) {
				if (this.currentEditingIndex !== -1 && this.currentEditingIndex !== index) {
					this.errors = []
					this.errors.push('Please finish the current edition first!')
					return this.areErrorsExist = true
				}
				if (key === 'edit') {
					this.setCurrentEditionValues(index)
				}
				if (key === 'save') {
					this.checkForValidation(index)
				}
				if (key === 'cancel') {
					this.setCurrentDefaults()
				}
				if (key === 'delete') {
					this.deletingContactIndex = index
					this.isDeleteMessageShow = true
				}
			},
			async checkEmailUniquenes(index) {
				if (this.oldEmail === this.currentEmail) return
				const sameEmail = this.client.contacts.find((item, i) => {
					return i !== index && this.currentEmail === item.email
				})
				if (sameEmail) {
					return this.errors.push("The email you entered is already used")
				}
				try {
					const result = await this.$http.get(`/clientsapi/unique-email?email=${ this.currentEmail }`)
					if (result.body === "exist") {
						this.errors.push("The email you entered is already used in our system.")
					}
				} catch (err) {

				}
			},
			async checkForValidation(index) {
				this.errors = []
				const emailValidReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
				const positionReg = /^[-\sa-zA-Z]+$/
				if (!this.currentPosition || !positionReg.test(this.currentPosition)) this.errors.push("Please, enter valid contact's position.")
				if (!this.currentEmail || !emailValidReg.test(this.currentEmail)) this.errors.push("Please, enter valid e-mail address.")
				if (this.currentEmail && emailValidReg.test(this.currentEmail)) {
					await this.checkEmailUniquenes(index)
				}
				if (this.errors.length) {
					this.areErrorsExist = true
					return
				}
				this.saveContactUpdates(index)
			},
			saveContactUpdates(index) {
				const contact = {
					...this.client.contacts[index],
					email: this.currentEmail,
					position: this.currentPosition,
					notes: this.currentNotes,
					phone: this.currentPhone
				}
				this.$emit("saveContactUpdates", { index, contact })
				this.setCurrentDefaults()
			},
			getFullName(contact) {
				return `${ contact.firstName } ${ contact.surname }`
			},
			showContactDetails({ index }) {
				if (this.currentEditingIndex === index) {
					return
				}
				this.$emit('contactDetails', { contactIndex: index })
			},
			addContact() {
				this.$emit('newContact')
			},
			setLeadContact(index) {
				this.$emit("setLeadContact", { index })
			}
		},
		computed: {
			contactsLength() {
				return this.client.contacts ? this.client.contacts.length : 0
			}
		},
		components: {
			DataTable,
			CustomRadio,
			Add,
			ValidationErrors,
			ApproveModal
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .contacts-info {
    font-size: 14px;
    font-weight: normal;
    border: none;
    outline: none;
    position: relative;

    &__fontIcon{
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
      border-radius: 8px;
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

</style>
