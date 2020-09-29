<template lang="pug">
  .client-layout
    .client-info
      .buttons
        .button
          Button(value="Save" @clicked="checkForErrors")
        .button
          Button(value="Cancel" @clicked="cancel")
        .button
          Button(value="Delete" @clicked="deleteClient")
      .title(v-if="currentClient._id") General Information
      .client-info__gen-info(v-if="currentClient._id")
        General(
          :isSaveClicked="isSaveClicked"
          :languages="languages"
          :timezones="timezones"
        )
      .title(v-if="currentClient._id") Contact Details
      .client-info__contacts-info(v-if="currentClient._id")
        ContactsInfo(
          :client="currentClient"
          @contactDetails="contactDetails"
          @saveContactUpdates="saveContactUpdates"
          @setLeadContact="setLeadContact"
          @newContact="addNewContact"
          @approveDelete="approveContactDelete")

      .title(v-if="currentClient._id") Services
        .client-info__services(v-if="currentClient._id && currentClient.industries")
          ClientServices(
            :languages="languages"
            :sourceLanguagesClient="sourceLanguagesClientData"
            :targetLanguagesClient="targetLanguagesClientData"
            :industries="industries"
            :services="services"
            :clientIndustries="currentClient.industries.map(i => i.name)"
            @updateRates="updateRates"
          )

      .title(v-if="currentClient._id") Rates
      .client-info__rates(v-if="currentClient._id")
        RatesParameters
        .client-info__tables-row
          .lang-table(v-if="currentClient._id")
            LangTable(
              :tableData="currentClient.rates.basicPricesTable"
              :clientId="currentClient._id"
              @refreshResultTable="refreshResultTable"
              :refresh="isRefreshAfterServiceUpdate"
            )
          .step-table(v-if="currentClient._id")
            StepTable(
              :tableData="currentClient.rates.stepMultipliersTable"
              :clientId="currentClient._id"
              @refreshResultTable="refreshResultTable"
              :refresh="isRefreshAfterServiceUpdate"
            )
          .industry-table(v-if="currentClient._id")
            IndustryTable(
              :tableData="currentClient.rates.industryMultipliersTable"
              :clientId="currentClient._id"
              @refreshResultTable="refreshResultTable"
              :refresh="isRefreshAfterServiceUpdate"
            )

        .result-table(v-if="currentClient._id")
          ResultTable(
            :clientId="currentClient._id"
            :languages="languages"
            :steps="steps"
            :units="units"
            :industries="industries"
            :isRefreshResultTable="isRefreshResultTable"
            :refresh="isRefreshAfterServiceUpdate"

          )

      .title(v-if="currentClient._id") Discount Chart
      .client-info__chart(v-if="currentClient._id")
        DiscountChart(:entity="currentClient", @getDefaultValues="getDefaultValuesDC" @setMatrixData="setMatrixData")

      .title(v-if="currentClient._id") Documents
      .client-info__documents(v-if="currentClient._id")
        ClientDocuments
      .title(v-if="currentClient._id") Sales Information
      .client-info__sales(v-if="currentClient._id")
        ClientSalesInfo(:client="currentClient" @setLeadSource="setLeadSource")
      .title(v-if="currentClient._id") Billing Informations
      .client-info__billing(v-if="currentClient._id")
        ClientBillInfo(:client="currentClient" @changeProperty="changeBillingProp")
      .delete-approve(v-if="isApproveModal")
        p Are you sure you want to delete?
        input.button.approve-block(type="button" value="Cancel" @click="cancelApprove")
        input.button(type="button" value="Delete" @click="approveClientDelete")
      ValidationErrors(v-if="areErrorsExist"
        :errors="errors"
        @closeErrors="closeErrorsBlock"
      )
    .client-subinfo
      .client-subinfo__general(v-if="currentClient._id")
        SideGeneral(
          :isSaveClicked="isSaveClicked"
        )
      .client-subinfo__date(v-if="currentClient._id")
        OtherClientInformation()

</template>

<script>
	import RatesParameters from "./pricelists/RatesParameters";
	import OtherClientInformation from "./OtherClientInformation";
	import ClientDocuments from "./ClientDocuments";
	import ClientServices from "./ClientServices";
	import OldGeneral from "./clientInfo/OldGeneral";
	import General from "./clientInfo/General";
	import SideGeneral from "./clientInfo/SideGeneral";
	import Button from "../Button";
	import ValidationErrors from "../ValidationErrors";
	import ContactsInfo from "./ContactsInfo";
	import ClientSalesInfo from "./ClientSalesInfo";
	import ClientBillInfo from "./ClientBillInfo";
	import IndustryTable from "./pricelists/IndustryTable";
	import StepTable from "./pricelists/StepTable";
	import LangTable from "./pricelists/LangTable";
	import ResultTable from "./pricelists/ResultTable";
	import { mapGetters, mapActions } from "vuex";
	import DiscountChart from "./DiscountChart";

	export default {
		props: {
			contactsPhotos: {
				type: Array,
				default: () => [],
			},
			contractFiles: {
				type: Array,
				default: () => [],
			},
			ndaFiles: {
				type: Array,
				default: () => [],
			},
		},
		data() {
			return {
				languages: [],
				industries: [],
				services: [],
				units: [],
				steps: [],
				timezones: [],
				currentDocuments: [],
				clientDataInCreated: {
					sourceLanguages:[],
          targetLanguages: [],
        },

				isApproveModal: false,
				clientShow: true,
				contactShow: false,
				contactInd: 0,
				newContact: false,
				fromRoute: "/clients",
				areErrorsExist: false,
				errors: [],
				billErrors: [],
				isLeadEmpty: "",
				isSaveClicked: false,
				isRefreshResultTable: false,
				isRefreshAfterServiceUpdate: false,
			};
		},
		methods: {
			async setMatrixData({ value, key }) {
				try {
					const result = await this.$http.post(
							`/clientsapi/update-matrix/${ this.currentClient._id }`,
							{
								updatedRowObj: {
									value,
									key,
								},
							}
					);
					this.currentClient.matrix = result.data;
					this.alertToggle({
						message: "Matrix data updated",
						isShow: true,
						type: "success",
					});
				} catch (err) {
					this.alertToggle({
						message: "Error on setting matrix data",
						isShow: true,
						type: "error",
					});
				}
			},
			async getDefaultValuesDC(discountKey) {
				try {
					const result = await this.$http.post(`/clientsapi/sync-matrix/${ this.currentClient._id }`, { key: discountKey })
					this.currentClient.matrix = result.data;
					this.alertToggle({
						message: "Matrix data updated",
						isShow: true,
						type: "success",
					});
				} catch (err) {
					this.alertToggle({
						message: "Error on setting matrix data",
						isShow: true,
						type: "error",
					});
				}
			},
			refreshResultTable() {
				this.isRefreshResultTable = true;
				setTimeout(() => {
					this.isRefreshResultTable = false;
				}, 2000);
			},
			updateRates(action) {
				this.isRefreshAfterServiceUpdate = action;
				setTimeout(() => {
					this.isRefreshAfterServiceUpdate = !action;
				}, 2000);
			},
			loadFile({ files, prop }) {
				this.$emit("loadFile", { files, prop });
			},
			cancel() {
				if(
						this.fromRoute === "/new-client" ||
						this.fromRoute.indexOf("contact") !== -1
				) {
					this.$router.push("/clients");
				} else {
					this.$router.push(this.fromRoute);
				}
				this.storeCurrentClient({});
			},
			saveContactUpdates({ index, contact }) {
				this.updateClientContact({ index, contact });
			},
			deleteClient() {
				this.isApproveModal = true;
			},
			contactLeadError() {
				return this.currentClient.contacts.find((item) => item.leadContact);
			},
			async approveContactDelete({ index }) {
				this.clientShow = true;
				this.contactShow = false;
				try {
					if(this.currentClient.contacts.length === 1) {
						return this.alertToggle({
							message: "Error! At least one contact should remain!",
							isShow: true,
							type: "error",
						});
					}
					const contacts = this.updateLeadWhenDeleted(index);
					const result = await this.$http.post("/clientsapi/deleteContact", {
						id: this.currentClient._id,
						contacts,
					});
					const { updatedClient } = result.body;
					await this.storeClient(updatedClient);
					await this.storeCurrentClient(updatedClient);
					this.alertToggle({
						message: "Contact has been deleted",
						isShow: true,
						type: "success",
					});
				} catch (err) {
					this.alertToggle({
						message: "Internal server error on deleting contact",
						isShow: true,
						type: "error",
					});
				}
			},
			updateLeadWhenDeleted(index) {
				let contacts = this.currentClient.contacts.filter(
						(item, ind) => ind !== index
				);
				const leadContact = contacts.find((item) => item.leadContact);
				if(!leadContact) {
					contacts[0].leadContact = true;
				}
				return contacts;
			},
			cancelApprove() {
				this.isApproveModal = false;
			},
			setLeadSource({ leadSource }) {
				this.storeClientProperty({ prop: "leadSource", value: leadSource });
			},
			changeBillingProp({ prop, value }) {
				this.storeClientBillingInfoProperty({ prop: prop, value });
			},
			contactDetails({ contactIndex }) {
				this.$router.push({ name: "contact", params: { index: contactIndex } });
			},
			addNewContact(data) {
				this.$router.push({ name: "new-contact" });
			},
			closeErrorsBlock() {
				this.areErrorsExist = false;
			},
			clearErrors() {
				this.errors = [];
				this.billErrors = [];
				this.isLeadEmpty = false;
			},
			async checkForErrors() {
				this.clearErrors();
				const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
				if(!this.currentClient.name)
					this.errors.push("Company name cannot be empty.");
				if(!this.currentClient.industries.length)
					this.errors.push("Please, choose at least one industry.");
				if(!this.currentClient.sourceLanguages.length)
					this.errors.push("Please, choose source language.");
				if(!this.currentClient.targetLanguages.length)
					this.errors.push("Please, choose target language.");
				if(!this.currentClient.contacts.length)
					this.errors.push("Please, add at least one contact.");
				if(!this.contactLeadError())
					this.errors.push("Please set Lead Contact of the Client.");
				if(!this.currentClient.status)
					this.errors.push("Please, choose status.");
				if(!this.currentClient.leadSource) {
					this.errors.push("Please, choose lead source.");
					this.isLeadEmpty = true;
				}
				if(
						!this.currentClient.email ||
						!emailValidRegex.test(this.currentClient.email.toLowerCase())
				) {
					this.errors.push(
							"Please provide a valid email in General Informations."
					);
				}
				if(
						!this.currentClient.billingInfo.email ||
						!emailValidRegex.test(
								this.currentClient.billingInfo.email.toLowerCase()
						)
				) {
					this.errors.push(
							"Please provide a valid email in Billing Informations."
					);
					this.billErrors.push("email");
				}
				if(
						!this.currentClient.accountManager ||
						!this.currentClient.salesManager ||
						!this.currentClient.projectManager
				)
					this.errors.push("All managers should be assigned.");

				const isSameEmailsExists = await this.checkSameClientEmails(this.currentClient.email, this.currentClient._id)
				if(isSameEmailsExists) {
					this.errors.push("A client with such Email already exists, the client's Email should be unique!");
				}

				if(this.errors.length) {
					this.areErrorsExist = true;
					this.isSaveClicked = true;
					return;
				}
				await this.updateClient();
			},

			async checkSameClientEmails(clientEmail, clientId) {
				const clientMails = await this.$http.get('/clientsapi/all-clients-emails');
				const arrayOfMails = clientMails.body
						.filter(item => item._id.toString() !== clientId)
						.map(key => key.email);
				return arrayOfMails.includes(clientEmail);
			},

			async updateClient() {
				let sendData = new FormData();
				let dataForClient = this.currentClient;
				this.getClientDocumentInfo().then(
						(result) => (dataForClient.documents = result.data.documents)
				);

				sendData.append("client", JSON.stringify(dataForClient));
				for (let i = 0; i < this.contactsPhotos.length; i++) {
					sendData.append("photos", this.contactsPhotos[i]);
				}
				try {
					const result = await this.$http.post(
							"/clientsapi/update-client",
							sendData
					);
					console.log("res body", result.body);
					const { client } = result.body;
					await this.storeClient(client);
					await this.storeCurrentClient(client);
					this.alertToggle({
						message: "Client info has been updated",
						isShow: true,
						type: "success",
					});
				} catch (err) {
					this.alertToggle({
						message: "Internal server error on updating Client info",
						isShow: true,
						type: "error",
					});
				}
			},
			async approveClientDelete() {
				const id = this.currentClient._id;
				this.isApproveModal = false;
				try {
					const hasRelatedDocs = await this.$http.get(
							`/clientsapi/any-doc?id=${ id }`
					);
					if(hasRelatedDocs.body) {
						return this.alertToggle({
							message: "The client has related documents and cannot be deleted",
							isShow: true,
							type: "error",
						});
					}
					const result = await this.$http.delete(
							`/clientsapi/deleteclient/${ id }`
					);
					await this.removeClient(id);
					this.alertToggle({
						message: "Client has been removed",
						isShow: true,
						type: "success",
					});
					this.$router.push("/clients");
				} catch (err) {
					this.alertToggle({
						message: "Internal server error on deleting the Client",
						isShow: true,
						type: "error",
					});
				}
			},
			setLeadContact({ index }) {
				this.updateLeadContact(index);
			},
			async getClientDocumentInfo() {
				return await this.$http.get(
						`/clientsapi/client?id=${ this.$route.params.id }`
				);
			},
			async getClientInfoLangs() {
				const client = await this.$http.get(
						`/clientsapi/client-languages?id=${ this.$route.params.id }`
				);
				this.clientDataInCreated.sourceLanguages = client.body.sourceLanguages;
				this.clientDataInCreated.targetLanguages = client.body.targetLanguages;
			},
			async getClientInfo() {
				if(!this.currentClient._id) {
					const client = await this.$http.get(
							`/clientsapi/client?id=${ this.$route.params.id }`
					);
					this.storeCurrentClient(client.body);
				}
			},
			...mapActions({
				alertToggle: "alertToggle",
				storeClient: "storeClient",
				storeCurrentClient: "storeCurrentClient",
				storeClientProperty: "storeClientProperty",
				removeClient: "removeClient",
				storeClientContact: "storeClientContact",
				updateClientContact: "updateClientContact",
				updateLeadContact: "updateLeadContact",
				deleteClientContact: "deleteClientContact",
				storeClientBillingInfoProperty: "storeClientBillingInfoProperty",
			}),
			async getLangs() {
				try {
					const result = await this.$http.get("/api/languages");
					this.languages = Array.from(result.body);
				} catch (err) {
					this.alertToggle({
						message: "Error in Languages",
						isShow: true,
						type: "error",
					});
				}
			},
			async getIndustries() {
				try {
					const result = await this.$http.get("/api/industries");
					this.industries = result.body;
				} catch (err) {
					this.alertToggle({
						message: "Error in Industries",
						isShow: true,
						type: "error",
					});
				}
			},
			async getServices() {
				try {
					const result = await this.$http.get("/api/services");
					this.services = result.body;
				} catch (err) {
					this.alertToggle({
						message: "Error in Services",
						isShow: true,
						type: "error",
					});
				}
			},
			async getUnits() {
				try {
					const result = await this.$http.get("/api/units");
					this.units = result.body;
				} catch (err) {
					this.alertToggle({
						message: "Error in Units",
						isShow: true,
						type: "error",
					});
				}
			},
			async getSteps() {
				try {
					const result = await this.$http.get("/api/steps");
					this.steps = result.body;
				} catch (err) {
					this.alertToggle({
						message: "Error in Steps",
						isShow: true,
						type: "error",
					});
				}
			},
			async getTimezones() {
				try {
					const result = await this.$http.get("/api/timezones");
					this.timezones = result.body;
				} catch (err) {
					this.alertToggle({
						message: "Error in Timezones",
						isShow: true,
						type: "error",
					});
				}
			},
		},
		computed: {
			...mapGetters({
				allClients: "getClients",
				currentClient: "getCurrentClient",
			}),
			sourceLanguagesClientData() {
				if(this.clientDataInCreated.sourceLanguages.length) {
					return this.clientDataInCreated.sourceLanguages.map(i => i.lang);
				}
			},
			targetLanguagesClientData(){
			  if(this.clientDataInCreated.targetLanguages.length){
				  return this.clientDataInCreated.targetLanguages.map(i => i.lang);
			  }
			},

		},
		components: {
			DiscountChart,
			ClientServices,
			General,
			OldGeneral,
			Button,
			ValidationErrors,
			ContactsInfo,
			IndustryTable,
			ClientSalesInfo,
			ClientBillInfo,
			StepTable,
			LangTable,
			ResultTable,
			SideGeneral,
			ClientDocuments,
			OtherClientInformation,
			RatesParameters,
		},
		created() {
			this.getClientInfo();
			this.getClientInfoLangs();
			this.getLangs();
			this.getUnits();
			this.getSteps();
			this.getIndustries();
			this.getServices();
			this.getTimezones();
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				vm.fromRoute = from.path;
			});
		},
	};
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .client-layout {
    display: flex;
  }

  .client-subinfo {
    &__general {
      margin-top: 120px;
      width: 390px;
      height: 270px;
      box-shadow: 0 0 10px #67573e9d;
    }

    &__date {
      margin-top: 146px;
      width: 390px;
      height: 270px;
      box-shadow: 0 0 10px #67573e9d;
    }
  }

  .client-info {
    padding: 40px;
    width: 1020px;
    position: relative;

    &__gen-info,
    &__services,
    &__contacts-info,
    &__rates,
    &__sales,
    &__documents,
    &__chart,
    &__billing {
      margin: 20px 10px 40px 10px;
      padding: 40px;
      box-shadow: 0 0 10px #67573e9d;
      box-sizing: border-box;
    }

    &__documents {
      position: relative;
    }

    &__services {
      position: relative;
    }

    &__rates {
      padding: 40px;
    }

    &_error-shadow {
      box-shadow: 0 0 5px $red;
    }

    &__tables-row {
      display: flex;

      .lang-table {
        width: 33%;
      }

      .industry-table {
        width: 26%;
      }

      .step-table {
        width: 42%;
      }
    }
  }

  .title {
    font-size: 22px;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-right: 10px;
  }

  .button {
    margin-left: 30px;
    width: 138px;
    height: 33px;
    color: white;
    font-size: 14px;
    border-radius: 10px;
    -webkit-box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
    background-color: #d15f45;
    border: 1px solid #d15f45;
    cursor: pointer;
    outline: none;

    .delete-approve & {
      margin-left: 0;
    }
  }

  .delete-approve {
    position: absolute;
    width: 332px;
    height: 270px;
    top: 10%;
    left: 50%;
    margin-left: -166px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 10px #67573e;
    background-color: #fff;
    z-index: 20;

    p {
      font-size: 21px;
      width: 50%;
      text-align: center;
    }

    .approve-block {
      margin-bottom: 15px;
    }
  }

  input {
    color: #67573e;
  }
</style>
