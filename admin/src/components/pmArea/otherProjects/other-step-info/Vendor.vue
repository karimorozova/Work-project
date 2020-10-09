<template lang="pug">
  .step-vendor
    .step-vendor__title Vendor:
    .step-vendor__info
      .step-vendor__current-vendor
        input.step-vendor__input-text(type="text" value="Will be Vendor" disabled)
      .step-vendor__contacts
        .step-vendor__icon(@click="alert('gotToVendorInfo will be')")
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
				type: [Object, String]
			},
			step: {
				type: Object
			},
		},
		data() {
			return {}
		},
		methods: {
			currentVendorName(vendor) {
				// return vendor ? vendor.firstName + ' ' + vendor.surname : "";
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
			gotToVendorInfo() {
				// window.open(`/vendors/details/${this.vendor._id}`, '_blank');
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
</style>
