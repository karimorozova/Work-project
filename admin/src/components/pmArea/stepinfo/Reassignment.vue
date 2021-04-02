<template lang="pug">
  .reassignment
    span.reassignment__close(@click="close") +
    .reassignment__title Reassignment of the Step
    .reassignment__main
      .reassignment__row
        LabelVal(text="Reason to reassign:")
          .reassignment__drop
            SelectSingle(
              placeholder="Select"
              :options="cancelReasons"
              @chooseOption="setReason"
              :selectedOption="reason")
      .reassignment__row
        LabelVal(text="New Vendor:")
          .reassignment__drop
            PersonSelect(
              customClass="bordered arrow-20"
              :persons="extendedVendors(index)"
              :selectedPerson="currentVendorName(newVendor)"
              :isExtended="isAllShow"
              :isAdditionalShow="true"
              @setPerson="setVendor"
              @togglePersonsData="toggleVendors"
            )
      .reassignment__row
        LabelVal(text="Should new Vendor start from the beginning?" customClass="column")
          .reassignment__check
            CheckBox(@check="(e)=>toggle(e, 'isStart', 'yes')" @uncheck="(e)=>toggle(e, 'isStart', 'yes')" :isChecked="isStart.yes")
            .reassignment__check-label Yes
          .reassignment__check
            CheckBox(@check="(e)=>toggle(e, 'isStart', 'no')" @uncheck="(e)=>toggle(e, 'isStart', 'no')" :isChecked="isStart.no")
            .reassignment__check-label No
      .reassignment__row
        LabelVal(text="Should old Vendor be paid for this part?" customClass="column")
          .reassignment__check
            CheckBox(@check="(e)=>toggle(e, 'isPay', 'yes')" @uncheck="(e)=>toggle(e, 'isPay', 'yes')" :isChecked="isPay.yes")
            .reassignment__check-label Yes
          .reassignment__check
            CheckBox(@check="(e)=>toggle(e, 'isPay', 'no')" @uncheck="(e)=>toggle(e, 'isPay', 'no')" :isChecked="isPay.no")
            .reassignment__check-label No
          .reassignment__work
            input.reassignment__percent(type="text" :value="progress" @input="setProgress" @click.stop="selectInputVal" ref="progress")
            span.reassignment__text %  is done
    .reassignment__buttons
      .reassignment__button
        Button(value="Save" @clicked="checkErrors")
      .reassignment__button
        Button(value="Cancel" @clicked="close")
    .reassignment__errors(v-if="areErrors")
      ValidationErrors(:isAbsolute="true" :errors="errors" @closeErrors="closeErrors")
</template>

<script>
	import LabelVal from "@/components/LabelVal";
	import ValidationErrors from "@/components/ValidationErrors";
	import PersonSelect from "../PersonSelect";
	import Button from "@/components/Button";
	import SelectSingle from "@/components/SelectSingle";
	import CheckBox from "@/components/CheckBox";
	import stepVendor from "@/mixins/stepVendor";
	import { mapGetters, mapActions } from "vuex";

	export default {
		mixins: [stepVendor],
		props: {
			step: {
				type: Object,
			},
			index: {
				type: Number,
			},
			originallyLanguages: {
				type: Array,
      }
		},
		data() {
			return {
				reasons: ['Unresponsive', 'Technical issues', 'Personal issues'],
				isAllShow: false,
				newVendor: null,
				reason: "",
				isStart: { yes: false, no: true },
				isPay: { yes: true, no: false },
				enteredProgress: "",
				errors: [],
				areErrors: false
			}
		},
		methods: {
			...mapActions([
				"alertToggle",
				"reassignVendor"
			]),
			selectInputVal() {
				this.$refs.progress.select();
			},
			setProgress(e) {
				const { value } = e.target;
				const regex = /^[0-9]+$/;
				const characters = value.split("").filter(item => regex.test(item));
				const clearedValue = characters.join("");
				this.enteredProgress = clearedValue.length > 3 ? clearedValue.slice(0, 3) : clearedValue;
				this.enteredProgress = this.enteredProgress > 100 ? 100 : this.enteredProgress;
				this.$refs.progress.value = this.enteredProgress;
			},
			getCurrentProgress() {
				const { progress } = this.step;
				return progress.totalWordCount ? (progress.wordsDone / progress.totalWordCount * 100).toFixed(2) : progress;
			},
			currentVendorName(vendor) {
				return vendor ? vendor.firstName + ' ' + vendor.surname : "";
			},
			toggleVendors({ isAll }) {
				this.isAllShow = isAll;
			},
			toggle(e, prop, key) {
				if(this[prop][key]) return;
				this[prop] = Object.keys(this[prop]).reduce((acc, prev) => {
					prev === key ? acc[prev] = true : acc[prev] = false;
					return { ...acc };
				}, {})
			},
			setReason({ option }) {
				this.reason = option;
			},
			setVendor({ person }) {
				if(this.step.vendor && person._id === this.step.vendor._id) return;
				this.newVendor = person
			},
			close() {
				this.$emit('close');
			},
			closeErrors() {
				this.areErrors = false;
			},
			async checkErrors() {
				this.errors = [];
				if(!this.reason) this.errors.push("Please, set the Reason.");
				if(!this.newVendor) this.errors.push("Please, set the Vendor.");
				const currentProgress = this.getCurrentProgress();
				if(this.enteredProgress > currentProgress) {
					this.errors.push("Entered progress cannot be higher than current progress.");
					this.enteredProgress = "";
				}
				if(this.errors.length) {
					return this.areErrors = true;
				}
				await this.save();
			},
			async save() {
				const reassignData = {
					step: this.step,
					progress: +this.progress,
					isStart: this.isStart.yes,
					isPay: this.isPay.yes,
					reason: this.reason,
					vendor: this.newVendor
				};
				try {
					await this.reassignVendor(reassignData);
					this.close();
				} catch (err) {
				}
			},
			// async getReasons() {
			// 	try {
			// 		const result = await this.$http.get("/api/reasons");
			// 		this.reasons = result.body;
			// 	} catch (err) {
			// 		this.alertToggle({ message: "Error on getting Reasons.", isShow: true, type: "error" });
			// 	}
			// }
		},
		computed: {
			...mapGetters({
				allVendors: "getAllVendorsForProject",
				currentProject: "getCurrentProject",
				userGroup: "getUserGroup"
			}),
			cancelReasons() {
				return this.reasons;
			},
			vendors() {
				return this.allVendors.filter(item => item._id !== this.step.vendor._id);
			},
			progress() {
				return this.enteredProgress || this.getCurrentProgress();
			}
		},
		components: {
			LabelVal,
			ValidationErrors,
			SelectSingle,
			PersonSelect,
			CheckBox,
			Button
		},
		created() {
			// this.getReasons();
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .reassignment {
    background-color: $white;
    box-shadow: 0 0 10px #67573e9d;
    padding: 20px;
    width: 400px;
    box-sizing: border-box;
    margin: 0 auto;
    position: relative;

    &__title {
      text-align: center;
      font-size: 22px;
      margin-bottom: 20px;
    }

    &__row {
      margin-bottom: 20px;
    }

    &__drop {
      position: relative;
      height: 28px;
      width: 191px;
    }

    &__check {
      display: flex;
      align-items: center;
      margin: 5px 20px 0 0;
    }

    &__check-label {
      margin-left: 5px;
    }

    &__percent {
      width: 50px;
      margin: 5px 5px 0 0;
      padding: 0 5px;
      box-sizing: border-box;
      border: 1px solid $main-color;
      outline: none;
      color: $main-color;
      transition: all 0.2s;

      &:focus {
        box-shadow: 0 0 5px $light-brown;
      }
    }

    &__buttons {
      display: flex;
      justify-content: center;
    }

    &__button {
      margin: 0 10px;
    }

    &__close {
      position: absolute;
      transform: rotate(45deg);
      top: 5px;
      right: 10px;
      font-weight: bold;
      font-size: 26px;
      cursor: pointer;
    }
  }

</style>
