<template lang="pug">
  .new-client-wrap
    router-view(
      :isNewClient="isNewClient"
      :client="client"
      :newClient="client"
      :contactsPhotos="contactsPhotos"
      :contractFiles="contractFiles"
      :ndaFiles="ndaFiles"
      @loadFile="loadFile"
      @contactUpdate="contactUpdate"
      @contactSave="contactSave"
      @approveDelete="approveContactDelete"
    )
</template>

<script>
	import { mapGetters, mapActions } from "vuex"

	export default {
		data() {
			return {
				contactsPhotos: [],
				ndaFiles: [],
				contractFiles: [],
				client: {
					name: "",
					status: "",
					website: "",
					contract: "",
					isTest: false,
					nda: "",
					accountManager: "",
					salesManager: null,
					projectManager: "",
					leadSource: "",
					salesComission: "",
					address: "",
					languageCombinations: [],
					industries: [],
					nativeLanguage: '',
					timeZone: '',
					contacts: [],
					sourceLanguages: [],
					targetLanguages: [],
					currency: '',
					defaultPricelist: '',
					officialCompanyName: '',
					email: '',
					billingInfo: {
						officialCompanyName: '',
						vat: false,
						vatId: '',
						dueDate: '',
						address: '',
						invoiceSending: false,
						paymentType: ''
					}

				},
				isNewClient: true
			}
		},
		methods: {
			approveContactDelete({ index }) {
				this.client.contacts.splice(index, 1)
				if (this.client.contacts.length === 1) {
					this.client.contacts[0].leadContact = true
				} else {
					this.setLeadWhenUpdate(0)
				}
				this.$router.go(-1)
			},
			setLeadWhenUpdate(position) {
				const lead = this.client.contacts.find(item => item.leadContact)
				if (this.client.contacts[position].leadContact) {
					for (let index in this.client.contacts) {
						this.client.contacts[index].leadContact = false
					}
					this.client.contacts[position].leadContact = true
				} else if (!this.client.contacts[position].leadContact && !lead) {
					this.client.contacts[0].leadContact = true
				}
			},
			contactUpdate({ file, index, contact }) {
				this.contactsPhotos.push(file)
				this.client.contacts[index] = contact
				this.setLeadWhenUpdate(index)
				this.$router.go(-1)
			},
			contactSave({ contact, file }) {
				this.contactsPhotos.push(file)
				this.client.contacts.push(contact)
				if (this.client.contacts.length === 1) {
					this.client.contacts[0].leadContact = true
				}
				this.setLeadWhenUpdate(this.client.contacts.length - 1)
				this.$router.go(-1)
			},
			loadFile({ files, prop }) {
				this[prop] = [ files[0] ]
			},
			...mapActions({
				alertToggle: "alertToggle"
			})
		},
		computed: {
			...mapGetters({
				allClients: "getClients"
			})
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .new-client-wrap {
    position: relative;
    display: flex;
    width: 100%;
    box-sizing: border-box;
    min-height: 95vh;
  }

</style>
