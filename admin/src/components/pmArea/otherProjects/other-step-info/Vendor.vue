<template lang="pug">
  .step-vendor
    .step-vendor__title Vendor:
    .step-vendor__info
      .tooltip(v-if="XTRFVendorName")
        span#myTooltip.tooltiptext XTRF: {{ XTRFVendorName }}
        img(:style="{ cursor: 'help', 'margin-right': '5px', 'padding-bottom': '5px' }", src="../../../../assets/images/red-info-icon.png")
      .step-vendor__current-vendor
        input.step-vendor__input-text(type="text" :value="vendorName" disabled)
      .step-vendor__contacts
        .step-vendor__icon(@click="gotToVendorInfo(vendor._id)")
          i.fa.fa-info-circle
        .step-vendor__icon(@click="sendEmail")
          i.fa.fa-envelope
        .step-vendor__icon
          i.fa.fa-slack
</template>

<script>
	import { mapActions } from 'vuex';

	export default {
		props: {
			vendor: {
				type: Object
			},
			step: {
				type: Object
			},
			project: {
				type: Object
			},
			index:{
				type: Number
      }
		},
		data() {
			return {}
		},
		computed: {
			vendorName() {
				if(this.vendor) {
					return `${ this.vendor.firstName } ${ this.vendor.surname }`
				}
			},
      XTRFVendorName(){
				if(this.project){
					const stepIndex = this.step.name === 'Translation' ? 0 : 1
					return  this.project.documents[this.index]
              .UserAssignments.TranslationDocumentUserRoleAssignmentDetails[stepIndex]
                .UserInfoHeader.FullName
				}
      },
		},
		methods: {
			gotToVendorInfo(id) {
				window.open(`/vendors/details/${ id }`, '_blank');
			},
			async sendEmail() {
				// try {
				// 	if(!this.step.vendor) return;
				// 	await this.$http.post("/vendorsapi/step-email", { projectId: this.currentProject._id, step: this.step });
				// 	this.alertToggle({ message: "Email has been sent", isShow: true, type: "success" });
				// } catch (err) {
				// 	this.alertToggle({ message: "Internal server error / Cannot send email to vendor", isShow: true, type: "error" });
				// }
			},
			...mapActions({
				alertToggle: "alertToggle",
			})
		},
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .step-vendor {
    box-shadow: 0 0 5px $brown-shadow;
    padding: 20px;

    &__title {
      margin-bottom: 15px;
      font-size: 18px;
    }

    &__info {
      display: flex;
      align-items: flex-end;
      margin-bottom: 10px;
    }


    &__contacts {
      max-height: 28px;
      display: flex;
    }

    &__icon {
      margin-left: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 28px;

      i {
        font-size: 24px;
        cursor: pointer;
      }

      .fa-slack {
        border: 1px solid $light-brown;
        border-radius: 5px;
      }
    }

    &__input-text {
      width: 133px;
      height: 28px;
      border: 1px solid #68573E;
      border-radius: 5px;
      padding: 0 5px;
      color: #68573E;
      font-size: 14px;
      outline: none;
      padding-right: 30px;
    }
  }

  .tooltip {
    position: relative;
    display: flex;

    .tooltiptext {
      font-size: 14px;
      visibility: hidden;
      width: 140px;
      background-color: #67573e;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      bottom: 150%;
      left: 50%;
      margin-left: -75px;
      opacity: 0;
      transition: opacity 0.3s;

      &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #67573e transparent transparent transparent;
      }
    }

    &:hover {
      .tooltiptext {
        visibility: visible;
        opacity: 1;
      }
    }
  }
</style>
