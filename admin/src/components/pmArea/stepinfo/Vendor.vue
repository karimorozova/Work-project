<template lang="pug">
  .step-vendor
    .step-vendor__vendor
      .step-vendor__title Vendor:
      .step-vendor__drop(v-if="isVendorSelect")
        PersonSelect(
          :selectedPerson="currentVendorName(vendor)"
          :persons="extendedVendors(index)"
          :isExtended="isAllShow"
          :isAdditionalShow="true"
          @setPerson="setVendor"
          @togglePersonsData="toggleVendors"
          @scrollDrop="personSelectDrop(step)"
          @removeVendorFromStep="removeVendorFromStep"
        )
      .step-vendor__current-vendor(v-else)
        input(type="text" :value="currentVendorName(vendor)" :disabled="true")

    .step-vendor__links(v-if="!!vendor")
      .link
        .link__title Vendor Page:
        .link__icon(@click="gotToVendorInfo")
          i.fas.fa-external-link-alt
      .link
        .link__title Vendor Portal:
        .link__icon(@click="goToVendor")
          i.fas.fa-external-link-alt

      //.link
      //  .link__title Send email message to vendor:
      //  .link__icon(@click="sendEmail")
      //    i.fa.fa-envelope

    //.step-vendor__options(v-if="isVendorSelect")
      //.step-vendor__check
        //CustomRadio(:isChecked="isAfterRejectCheck" @toggleRadio="(e) => toggleRadio(e,'isAfterRejectCheck')")
        //.step-vendor__text Send next vendor after rejection
      //.step-vendor__check
        //CustomRadio(:isChecked="isAfterTimeCheck" @toggleRadio="(e) => toggleRadio(e,'isAfterTimeCheck')")
        //.step-vendor__text Send next vendor after
        //.step-vendor__time(:class="{'step-vendor_gap': isTimeDouble}")
          //input.step-vendor__time-select(type="number" v-model="nextSendTime" min="1" max="24")
</template>

<script>
	import PersonSelect from "../PersonSelect"
	import SelectSingle from "../../SelectSingle"
	import CustomRadio from "../../CustomRadio"
	import { mapGetters, mapActions } from 'vuex'
	import stepVendor from "@/mixins/stepVendor"

	export default {
		mixins: [ stepVendor ],
		props: {
			vendor: {
				type: [ Object, String ]
			},
			step: {
				type: Object
			},
			originallyLanguages: {
				type: Array
			},
			index: {
				type: Number
			}
		},
		data() {
			return {
				isAfterRejectCheck: false,
				isAfterTimeCheck: false,
				nextSendTime: 1,
				isAllShow: false,
				currentStepIdForRemoveVendor: null
			}
		},
		methods: {
			async removeVendorFromStep() {
				try {
					const project = await this.$http.post('/pm-manage/remove-vendor-from-step', {
						projectId: this.currentProject._id,
						stepId: this.currentStepIdForRemoveVendor
					})
					this.setCurrentProject(project.data)
					this.alertToggle({ message: "Vendor removed from Step.", isShow: true, type: 'success' })
				} catch (err) {
					this.alertToggle({ message: "Error can't remove Vendor from Step", isShow: true, type: 'success' })
				}
			},
			personSelectDrop(step) {
				const { stepId } = step
				if (this.vendor) this.currentStepIdForRemoveVendor = stepId
			},
			currentVendorName(vendor) {
				return vendor ? vendor.firstName + ' ' + vendor.surname : ""
			},
			async setVendor({ person }) {
				if (this.vendor && this.vendor._id && person._id === this.vendor._id) return
				const index = this.currentProject.steps.findIndex(item => item._id === this.step._id)
				try {
					await this.setStepVendor({ vendor: person, index })
				} catch (err) {
				}
			},
			toggleRadio(e, key) {
				this[key] = !this[key]
			},
			toggleVendors({ isAll }) {
				this.isAllShow = isAll
			},
			async sendEmail() {
				// try {
				// 	if (!this.step.vendor) return
				// 	await this.$http.post("/vendorsapi/step-email", { projectId: this.currentProject._id, step: this.step })
				// 	this.alertToggle({ message: "Email has been sent", isShow: true, type: "success" })
				// } catch (err) {
				// 	this.alertToggle({ message: "Internal server error / Cannot send email to vendor", isShow: true, type: "error" })
				// }
			},
			gotToVendorInfo() {
				window.open(`/pangea-vendors/all/details/${ this.vendor._id }`, '_blank')
			},
			async goToVendor() {
				const { data } = await this.$http.post("/service-login/vendor", { vendorId: this.vendor._id })
				const domain = window.location.origin.indexOf('pangea') !== -1 ? '.pangea.global' : 'localhost'
				const redirectTo = window.location.origin.indexOf('pangea') !== -1 ? 'https://vendor.pangea.global/dashboard' : 'http://localhost:3002/dashboard'
				document.cookie = `vendor=${ data }; path=/; domain=${ domain }`
				window.open(redirectTo, '_blank')
			},
			...mapActions({
				alertToggle: "alertToggle",
				setStepVendor: "setStepVendor",
				setCurrentProject: "setCurrentProject"
			})
		},
		computed: {
			...mapGetters({
				vendors: "getAllVendorsForProject",
				currentProject: "getCurrentProject",
				userGroup: "getUserGroup"
			}),
			isTimeDouble() {
				return this.nextSendTime.length === 2
			},
			isVendorSelect() {
				const statuses = [ 'Started', 'Cancelled', 'Cancelled Halfway', 'Completed' ]
				return statuses.indexOf(this.step.status) === -1
			}
		},
		components: {
			SelectSingle,
			PersonSelect,
			CustomRadio
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .link {
    display: flex;
    height: 32px;
    align-items: center;

    &__title {
      width: 100px;
    }

    &__icon {
      transition: .2s ease-out;
      color: $dark-border;
      cursor: pointer;

      &:hover {
        color: $text;
      }
    }
  }

  .step-vendor {
    padding: 20px;
    box-shadow: $box-shadow;
    border-radius: 4px;

    &__links {
      margin: 20px 0;
      border-left: 3px solid $border;
      padding: 0 10px;
    }

    &__vendor {
      display: flex;
      height: 32px;
      align-items: center;
      gap: 15px;
    }

    &__drop {
      position: relative;
      width: 220px;
      height: 32px;
    }

    &__title {
      font-size: 18px;
    }

    input {
      font-size: 14px;
      color: $text;
      border: 1px solid $border;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 0 7px;
      outline: none;
      width: 220px;
      height: 32px;
      transition: .1s ease-out;

      &:focus {
        border: 1px solid $border-focus;
      }
    }

    i {
      font-size: 16px;
    }
  }
</style>
