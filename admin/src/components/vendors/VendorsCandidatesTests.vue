<template lang="pug">
  .vendorTests
    .vendorTests__approve(v-if="isDeleting")
      ApproveModal(
        text="Are you sure?",
        approveValue="Yes",
        notApproveValue="Cancel",
        @approve="deveteVendorsTest",
        @notApprove="setDefaults",
        @close="setDefaults"
      )
    .vendorTests__table
      Datatable(
        :fields="fields",
        :tableData="vendorTests",
        :bodyClass="['candidates-vendor-table', { 'tbody_visible-overflow': vendorTests.length < 17 }]",
        :tableheadRowClass="vendorTests.length < 17 ? 'tbody_visible-overflow' : ''",
        @onRowClicked="editData"
      )
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .vendorTests__head-title {{ field.label }}

        template(slot="file", slot-scope="{ row, index }")
          .vendorTests__no-file.vendorTests__data(v-if="!row.fileName") No file loaded
          .vendorTests__data(v-if="row.fileName && currentActive !== index")
            a(@click.stop="", :href="domain + row.path") {{ row.fileName }}

        template(slot="evaluationName", slot-scope="{ row, index }")
          .vendorTests__data {{ row.evaluationName }}

        template(slot="evaluationType", slot-scope="{ row, index }")
          .vendorTests__data {{ row.evaluationType }}

        template(slot="uploaded", slot-scope="{ row, index }")
          .vendorTests__data {{ getFormattedDate(row.uploadDate) }}

        template(slot="source", slot-scope="{ row, index }")
          .vendorTests__data {{ presentSource(row.source) }}

        template(slot="targets", slot-scope="{ row, index }")
          .vendorTests__data {{ presentTargets(row.targets) }}

        template(slot="industry", slot-scope="{ row, index }")
          .vendorTests__data {{ presentArrays(row.industries, 'name') }}

        template(slot="step", slot-scope="{ row, index }")
          .vendorTests__data {{ presentArrays(row.steps, 'title') }}

        template(slot="icons", slot-scope="{ row, index }")
          .vendorTests__icons
            img.vendorTests__icon(v-for="(icon, key) in icons", :src="icon.icon", @click.stop="makeAction(index, key)")

    Add(@add="addData")
    ValidationErrors(v-if="areErrors", :errors="errors", :isAbsolute="true", @closeErrors="closeErrors")

    .vendorTests__popup(v-if="isPopup")
      .popup__inputRow
        .popup__inputName Evaluation Name:
        input.popup__input(type="text", v-model="currentEvaluationName", placeholder="Name")
      .popup__selectRow
        .popup__select Evaluation Type:
        .popup__select
          .radio
            input#test(
              name="evaluationType",
              type="radio",
              @change="setEvaluationType('Test')",
              :checked="currentEvaluationType === 'Test'"
            )
            label.radio-label(for="test")
              span Test
        .popup__select
          .radio
            input#sample(
              name="evaluationType",
              type="radio",
              @change="setEvaluationType('Sample')",
              :checked="currentEvaluationType === 'Sample'"
            )
            label.radio-label(for="sample")
              span Sample
      .popup__selectRow
        .popup__select Language Type:
        .popup__select
          .radio
            input#duo(
              name="languageType",
              type="radio",
              @change="setLanguageType('Duo')",
              :checked="currentLanguageType === 'Duo'"
            )
            label.radio-label(for="duo")
              span Duo
        .popup__select
          .radio
            input#mono(
              name="languageType",
              type="radio",
              @change="setLanguageType('Mono')",
              :checked="currentLanguageType === 'Mono'"
            )
            label.radio-label(for="mono")
              span Mono

      .popup__dropRow
        .popup__drop(v-if="currentLanguageType === '' || currentLanguageType === 'Duo'")
          .popup__drop-title Source:
          SelectSingle(
            placeholder="Select",
            :hasSearch="true",
            :selectedOption="currentSource.hasOwnProperty('lang') ? currentSource.lang : ''",
            :options="sourceData | firstEnglishLanguage",
            @chooseOption="setSource"
          )
        .popup__drop.disabled-drop(v-else)
          .popup__drop-title Source:
          SelectSingle(
            placeholder="Select target",
            :selectedOption="currentSource.hasOwnProperty('lang') ? currentSource.lang : ''"
          )

        .popup__drop
          .popup__drop-title Targets:
          SelectMulti(
            placeholder="Select",
            :hasSearch="true",
            :selectedOptions="selectedTargets || []",
            :options="targetData",
            @chooseOptions="setTargets"
          )
      .popup__dropRow
        .popup__drop
          .popup__drop-title Steps:
          SelectMulti(
            placeholder="Select",
            :hasSearch="true",
            :selectedOptions="currentSteps.map((i) => i.title) || []",
            :options="stepsData",
            @chooseOptions="setSteps"
          )
        .popup__drop
          .popup__drop-title Industries:
          SelectMulti(
            placeholder="Select",
            :hasSearch="true",
            :selectedOptions="currentIndustries.map((i) => i.name) || []",
            :options="industryData",
            @chooseOptions="setIndustries"
          )
      .popup__uploadRow
        .popup__upload(v-if="currentEvaluationType === 'Test'")
          input#file.popup__uploadIcon(type="file", ref="file", @change="uploadDocument")
        .popup__uploadDisabled(v-else)
          .popup__uploadIconDisabled

      .popup__buttonRow
        .pupup_button
          Button(:value="currentIndex >= 0 ? 'Update' : 'Create'", @clicked="saveTest")
      .popup__close
        i.fa.fa-times(aria-hidden="true", @click="closeAddData")
</template>
<script>
	import { mapGetters, mapActions } from "vuex";
	import moment from "moment";
	import Add from "../Add";
	import Button from "../Button";
	import SelectSingle from "../SelectSingle";
	import SelectMulti from "../SelectMulti";
	import Datatable from "../DataTable";
	import scrollDrop from "@/mixins/scrollDrop";
	import ValidationErrors from "../ValidationErrors";
	import ApproveModal from "../ApproveModal";

export default {
		mixins: [scrollDrop],
		data() {
			return {
				fields: [
					{
						label: "Evaluation Name",
						headerKey: "headerEvaluatioName",
						key: "evaluationName",
						width: "14%",
						padding: "0",
					},
					{
						label: "Evaluation Type",
						headerKey: "headerEvaluationType",
						key: "evaluationType",
						width: "10%",
						padding: "0",
					},
					{
						label: "Source",
						headerKey: "headerSource",
						key: "source",
						width: "12%",
						padding: "0",
					},
					{
						label: "Targets",
						headerKey: "headerTarget",
						key: "targets",
						width: "12%",
						padding: "0",
					},
					{
						label: "Industries",
						headerKey: "headerIndustry",
						key: "industry",
						width: "12%",
						padding: "0",
					},
					{
						label: "Steps",
						headerKey: "headerStep",
						key: "step",
						width: "12%",
						padding: "0",
					},
					{
						label: "File Name",
						headerKey: "headerFile",
						key: "file",
						width: "15%",
						padding: "0",
					},
					{
						label: "Uploaded",
						headerKey: "headerUploaded",
						key: "uploaded",
						width: "8%",
						padding: "0",
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						width: "5%",
						padding: "0",
					},
				],
				icons: {
					delete: { icon: require("../../assets/images/Other/delete-icon-qa-form.png") },
				},
				vendorTests: [],
				currentActive: -1,
				currentFile: "",
				currentSource: "",
				currentTargets: [],
				currentIndustries: [],
				currentSteps: [],
				currentEvaluationType: "",
				currentLanguageType: "",
				currentEvaluationName: "",
				currentIndex: -1,

				industries: [],
				sources: [],
				targets: [],
				steps: [],

				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1,
				isTableDropMenu: true,
				domain: "http://localhost:3001",
				isPopup: false,
			};
		},
		methods: {
			...mapActions(["saveLangTest", "removeLangTest", "alertToggle"]),
			setEvaluationType(type) {
				this.currentEvaluationType = type;
			},
			setLanguageType(type) {
				this.currentLanguageType = type;
				this.currentSource = "";
				this.currentTargets = [];
			},
			async makeAction(index, key) {
				if(key === "delete") this.manageDeleteClick(index);
			},
			togglePopup(action) {
				this.isPopup = action;
			},
			addData() {
				this.currentIndex = -1;
				this.togglePopup(true);
			},
			closeAddData() {
				this.togglePopup(false);
				this.setDefaults();
				this.getTests();
			},
			async saveTest() {
				this.errors = [];
				if(!this.currentSource) this.errors.push("Source should not be empty!");
				if(this.selectedTargets.length === 0) this.errors.push("Target should not be empty!");
				if(!this.currentIndustries.length) this.errors.push("Industries should not be empty!");
				if(!this.currentSteps.length) this.errors.push("Steps should not be empty!");
				if(!this.currentEvaluationType) this.errors.push("Evaluation type should not be empty");
				if(!this.currentLanguageType) this.errors.push("Language type should not be empty");
				if(!this.currentEvaluationName) this.errors.push("Evaluation name should not be empty");
				if(this.currentIndex === -1 && this.currentEvaluationType === "Test") {
					if(!this.currentFile) this.errors.push("File should not be empty!");
				}
				if(this.isTestSame()) this.errors.push("Such a test already exists");
				if(this.isSameTestName()) this.errors.push("This evaluation name already exists");
				if(this.errors.length) {
					this.areErrors = true;
					return;
				}
				await this.sendSaveTest();
			},
			isSameTestName() {
				const allVendorsTests = this.vendorTests.filter((test) =>
						this.currentIndex >= 0 ? test._id !== this.vendorTests[this.currentIndex]._id : true
				);
				return allVendorsTests.map((test) => test.evaluationName).includes(this.currentEvaluationName);
			},
			searchSame(type) {
				let result = false;
				const allVendorsTests = this.currentIndex !== -1 ? this.vendorTests.filter((test) => test._id !== this.vendorTests[this.currentIndex]._id) : this.vendorTests;

				for (const element of allVendorsTests) {
					const source = element.source.lang === this.currentSource.lang;
					const currentTargetForSearch = this.currentTargets[0].lang === "All" ? this.sources : this.currentTargets;
					const target = element.targets.find((target) =>
							currentTargetForSearch.some((currentTarget) => target.lang === currentTarget.lang)
					);
					const industry = element.industries.find((industry) =>
							this.currentIndustries.some((currentIndustry) => industry.name === currentIndustry.name)
					);
					const step = element.steps.find((steps) =>
							this.currentSteps.some((currentStep) => steps.title === currentStep.title)
					);
					result =
							source &&
							Object.keys(target !== undefined ? target : {}).length > 0 &&
							Object.keys(industry !== undefined ? industry : {}).length > 0 &&
							Object.keys(step !== undefined ? step : {}).length > 0;

					if(result) {
						break;
					}
				}
				return result;
			},

			isTestSame() {
				return this.searchSame();
				// if (this.currentEvaluationType === "Test") {
				// } else {
				//   return this.searchSame("Sample");
				// }
			},
			async sendSaveTest() {
				const targets =
						this.currentTargets[0].lang === "All"
								? this.targets.filter((item) => item.lang !== "All")
								: this.currentTargets;
				let testData = {
					evaluationName: this.currentEvaluationName,
					evaluationType: this.currentEvaluationType,
					languageType: this.currentLanguageType,
					targets,
					source: this.currentSource,
					industries: this.currentIndustries,
					steps: this.currentSteps,
					index: this.currentIndex >= 0 ? this.currentIndex : "",
					oldPath: this.currentIndex >= 0 ? this.vendorTests[this.currentIndex].path : "",
					fileName: this.currentIndex >= 0 ? this.vendorTests[this.currentIndex].fileName : "",
					_id: this.currentIndex >= 0 ? this.vendorTests[this.currentIndex]._id : "",
				};
				try {
					await this.saveLangTest({ testData, file: this.currentFile });
					await this.getTests();
				} catch (err) {
				} finally {
					this.setDefaults();
				}
			},
			editData({ index }) {
				this.currentFile = "";
				this.currentSource = this.vendorTests[index].source;
				this.currentIndustries = this.vendorTests[index].industries;
				this.currentSteps = this.vendorTests[index].steps;
				this.currentTargets = this.vendorTests[index].targets;
				this.currentEvaluationType = this.vendorTests[index].evaluationType;
				this.currentLanguageType = this.vendorTests[index].languageType;
				this.currentEvaluationName = this.vendorTests[index].evaluationName;
				this.currentIndex = index;
				this.togglePopup(true);
			},
			getFormattedDate(date) {
				if(!date) return "";
				return moment(date).format("DD-MM-YYYY");
			},
			uploadDocument(e) {
				this.currentFile = this.$refs.file.files[0];
			},
			setDefaults() {
				this.isDeleting = false;
				this.isPopup = false;
				this.currentFile = "";
				this.currentSource = "";
				this.currentIndustries = [];
				this.currentSteps = [];
				this.currentTargets = [];
				this.currentEvaluationType = "";
				this.currentLanguageType = "";
				this.currentEvaluationName = "";
				this.currentIndex = "";
			},
			async manageDeleteClick(index) {
				this.togglePopup(false);
				this.deleteIndex = index;
				this.isDeleting = true;
			},
			async deveteVendorsTest() {
				const { _id, path } = this.vendorTests[this.deleteIndex];
				try {
					await this.removeLangTest({ _id, path });
					await this.getTests();
				} catch (err) {
				} finally {
					this.setDefaults();
					this.isDeleting = false;
				}
			},
			closeErrors() {
				this.areErrors = false;
			},
			setIndustries({ option }) {
				const position = this.currentIndustries.map((item) => item.name).indexOf(option);
				if(position !== -1) {
					this.currentIndustries.splice(position, 1);
				} else {
					const industry = this.industries.find((item) => item.name === option);
					this.currentIndustries.push(industry);
				}
			},
			setSteps({ option }) {
				const position = this.currentSteps.map((item) => item.title).indexOf(option);
				if(position !== -1) {
					this.currentSteps.splice(position, 1);
				} else {
					const service = this.steps.find((item) => item.title === option);
					this.currentSteps.push(service);
				}
			},
			setSource({ option }) {
				this.currentSource = this.sources.find((item) => item.lang === option);
			},
			setTargets({ option }) {
				if(this.currentLanguageType === "Mono") {
					const lang = this.targets.find((item) => item.lang === option);
					this.currentTargets = [lang];
					this.currentSource = lang;
				} else {
					const position = this.selectedTargets.indexOf(option);
					this.currentTargets = this.currentTargets.filter((item) => item.lang !== "All");
					if(position !== -1) {
						this.currentTargets.splice(position, 1);
					} else {
						const lang = this.targets.find((item) => item.lang === option);
						this.currentTargets.push(lang);
					}
					if(option === "All" || !this.selectedTargets.length) {
						this.currentTargets = [{ lang: "All" }];
					}
				}
			},
			presentArrays(Arr, key) {
				if(!Arr.length) return "";
				return Arr.reduce((acc, cur) => acc + `${ cur[key] }; `, "");
			},
			presentSource(source) {
				return source ? source.lang : "NA";
			},
			presentTargets(targets) {
				if(!targets.length) return "";
				if(targets.length === this.targets.filter((item) => item.lang !== "All").length) return "All";
				return targets.reduce((acc, cur) => acc + `${ cur.lang }; `, "");
			},
			async getTests() {
				try {
					const result = await this.$http.get("/vendorsapi/lang-tests");
					this.vendorTests = result.body;
				} catch (err) {
					this.alertToggle({ message: "Error on getting tests", isShow: true });
				}
			},
			async getLangs() {
				try {
					const result = await this.$http.get("/api/languages");
					this.sources = Array.from(result.body);
					this.targets = Array.from(result.body);
					this.targets.unshift({ lang: "All" });
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async getSteps() {
				try {
					const result = await this.$http.get("/api/steps");
					this.steps = result.body;
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async getIndustries() {
				try {
					const result = await this.$http.get("/api/industries");
					this.industries = result.body;
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
		},
		computed: {
			sourceData() {
				return this.sources.map((item) => item.lang);
			},
			targetData() {
				if(this.currentLanguageType === "Mono") {
					const firstElement = this.targets.shift();
					return this.targets.map((item) => item.lang);
				} else {
					const isAll = this.targets.find((item) => item.lang == "All");
					if(isAll) {
						return this.targets.map((item) => item.lang);
					} else {
						this.targets.unshift({ lang: "All" });
						return this.targets.map((item) => item.lang);
					}
				}
			},
			industryData() {
				return this.industries.map((item) => item.name);
			},
			stepsData() {
				return this.steps.map((item) => item.title);
			},
			selectedTargets() {
				return this.currentTargets.length ? this.currentTargets.map((item) => item.lang) : [];
			},
		},
		mounted() {
			this.domain = __WEBPACK__API_URL__;
		},
		created() {
			this.getTests();
			this.getLangs();
			this.getSteps();
			this.getIndustries();
		},
		components: {
			SelectSingle,
			Datatable,
			SelectMulti,
			Add,
			Button,
			ValidationErrors,
			ApproveModal,
		},
	};
</script>
<style lang="scss" scoped>
  @import "../../assets/styles/settingsTable.scss";

  a{
    color: #d15f45;
  }
  .vendorTests {
    @extend %setting-table;
    width: 1160px;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    position: relative !important;

    &__approve {
      position: absolute;
      left: 40%;
      top: 40%;
    }

    &__data {
      @extend %table-data;
      overflow-x: hidden;
      display: grid;
    }

    &__icons {
      @extend %table-icons;
      height: 30px;
      justify-content: center;
    }

    &__icon {
      @extend %table-icon;
      opacity: 1;
      margin: 0;
    }

    &__popup {
      width: 500px;
      background: #fff;
      padding: 40px;
      min-height: 40px;
      position: absolute;
      box-shadow: 0 0 10px $brown-shadow;
      top: 15%;
      left: 300px;
    }

    .popup {
      &__close {
        position: absolute;
        top: 15px;
        right: 15px;
      }

      &__buttonRow {
        display: flex;
        justify-content: center;
      }

      &__uploadRow {
        display: flex;
        justify-content: center;
        height: 50px;
        margin-top: 10px;
      }

      &__upload {
        width: 48px;
        height: 31px;
        position: relative;
        background: url("../../assets/images/upload-red-icon.png");
        background-position: center;
        background-repeat: no-repeat;
      }

      &__uploadIcon {
        width: 48px;
        height: 31px;
        border: none;
        outline: none;
        opacity: 0;
        z-index: 2;
        font-size: 0;
        position: absolute;
        cursor: pointer;
      }

      &__uploadDisabled {
        width: 48px;
        height: 31px;
        position: relative;
        background: url("../../assets/images/upload-red-icon-disabled.png");
        background-position: center;
        background-repeat: no-repeat;
      }

      &__uploadIconDisabled {
        width: 48px;
        height: 31px;
        border: none;
        outline: none;
        opacity: 0;
        z-index: 2;
        font-size: 0;
        position: absolute;
        cursor: not-allowed;
      }

      &__inputRow {
        display: flex;
        height: 55px;
      }

      &__inputName {
        width: 140px;
      }

      &__input {
        font-size: 14px;
        color: #67573e;
        border: 1px solid #67573e;
        border-radius: 4px;
        padding: 0 5px;
        outline: none;
        width: 277px;
        height: 30px;
        box-sizing: border-box;
        margin-top: -6px;
      }

      &__selectRow {
        display: flex;
        height: 55px;
      }

      &__select {
        width: 170px;
      }

      &__dropRow {
        display: flex;
        justify-content: space-between;
        height: 75px;
      }

      &__drop {
        position: relative;
        width: 190px;

        &-title {
          padding: 5px 0;
        }
      }
    }
  }

  $color1: #fff;
  $color2: #67573e;
  span {
    margin-left: 10px;
  }

  .fa-times {
    font-size: 18px;
    padding: 5px;
    cursor: pointer;
  }

  .disabled-drop {
    filter: opacity(0.5);
  }

  .radio {
    input[type="radio"] {
      position: absolute;
      opacity: 0;

      .radio-label {
        font-size: 14px;
      }

      + .radio-label {
        &:before {
          content: "";
          border-radius: 100%;
          border: 1px solid #67573e;
          display: inline-block;
          width: 16px;
          height: 16px;
          position: relative;
          vertical-align: top;
          cursor: pointer;
          text-align: center;
          transition: all 200ms ease;
        }
      }

      &:checked {
        + .radio-label {
          &:before {
            background-color: $color2;
            box-shadow: inset 0 0 0 4px $color1;
          }
        }
      }

      &:focus {
        + .radio-label {
          &:before {
            outline: none;
            border-color: $color2;
          }
        }
      }

      &:disabled {
        + .radio-label {
          &:before {
            box-shadow: inset 0 0 0 4px $color1;
            border-color: darken($color1, 25%);
            background: darken($color1, 25%);
          }
        }
      }

      + .radio-label {
        &:empty {
          &:before {
            margin-right: 0;
          }
        }
      }
    }
  }
</style>