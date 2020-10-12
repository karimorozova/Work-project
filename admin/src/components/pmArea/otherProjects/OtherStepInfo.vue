<template lang="pug">
  .step-info
    span.step-info__close(@click="closeInfo") +
    .step-info__block.size Step ID - {{ step.stepId }}
    .step-info__block
      Vendor(
        :step="step"
        :vendor="testVendor"
      )
    .step-info__block
      Finance(
        :step="step"
        @refreshFinance="refreshFinance"
        :originallyUnits="originallyUnits"
      )
</template>

<script>
	import Vendor from "./other-step-info/Vendor";
	import Finance from "./other-step-info/Finance";
	import { mapGetters, mapActions } from "vuex";

	export default {
		props: {
      // vendors: {
      // 	type: Array,
      // },
      step: {
        type: Object,
      },
      // task: {
      // 	type: Object,
      // },
      index: {
        type: [Number, String],
      },
    },
		data() {
			return {
        matrixData: [],
        originallyUnits: [],
        originallyLanguages: [],

        // step: {
        // 	"serviceStep": {
        // 		"size": 1,
        // 		"step": {
        // 			"_id": ' ObjectId("5f7434b377514d2c2805532d")',
        // 			"title": "Translation",
        // 			"calculationUnit": [],
        // 			"symbol": "translation",
        // 			"isStage1": true,
        // 			"isStage2": false,
        // 			"isEditor": true,
        // 			"isActive": true,
        // 			"__v": 0
        // 		},
        // 		"unit": {
        // 			"_id": ' ObjectId("5f7434b377514d2c2805532a")',
        // 			"type": "CAT Wordcount",
        // 			"steps": [],
        // 			"active": true,
        // 			"editable": false,
        // 			"sizes": [],
        // 			"__v": 0
        // 		},
        // 		"memoqAssignmentRole": 0,
        // 		"title": "Translation"
        // 	},
        // 	"finance": {
        // 		"Wordcount": {
        // 			"receivables": 4,
        // 			"payables": 4
        // 		},
        // 		"Price": {
        // 			"receivables": 4,
        // 			"payables": 4
        // 		}
        // 	},
        // 	"memoqDocIds": [
        // 		"7b43367f-651a-4424-9e6d-709e50b9a12b"
        // 	],
        // 	"size": 1,
        // 	"vendorsClickedOffer": [],
        // 	"isVendorRead": false,
        // 	"_id": 'ObjectId("5f7d6b6a4967885e00e83908")',
        // 	"stepId": "2020 10 07 [02] T01 S01",
        // 	"taskId": "2020 10 07 [02] T01",
        // 	"name": "Translation",
        // 	"sourceLanguage": "EN-GB",
        // 	"targetLanguage": "AF",
        // 	"memoqProjectId": "11ea5d14-6d08-eb11-90ed-82bb18d08256",
        // 	"memoqSource": "eng-GB",
        // 	"memoqTarget": "afr",
        // 	"vendor": 'ObjectId("5f7b0e50a2c17e32fc1853aa")',
        // 	"start": "2020-10-07T07:16:44.925Z",
        // 	"deadline": "2020-10-31T08:16:00.000Z",
        // 	"progress": {
        // 		"7b43367f-651a-4424-9e6d-709e50b9a12b": {
        // 			"wordsDone": 0,
        // 			"totalWordCount": 4,
        // 			"fileName": "1-for_test.txt"
        // 		},
        // 		"wordsDone": 0,
        // 		"totalWordCount": 4
        // 	},
        // 	"status": "Created",
        // 	"clientRate": {
        // 		"value": 1,
        // 		"active": true
        // 	},
        // 	"vendorRate": {
        // 		"value": 1,
        // 		"active": true
        // 	},
        // 	"totalWords": 4,
        // 	"check": false,
        // 	"service": {
        // 		"sortIndex": 1,
        // 		"title": "Translation",
        // 		"symbol": "tr",
        // 		"formType": "Translation",
        // 		"icon": "/static/services/Translation_Localization.png",
        // 		"active": true,
        // 		"isRequestQuote": true,
        // 		"crud": false,
        // 		"calculationUnit": null,
        // 		"languageForm": "Duo",
        // 		"source": true,
        // 		"languages": [
        // 			{
        // 				"source": [
        // 					"AF",
        // 				],
        // 				"target": [
        // 					"AF",
        // 				]
        // 			}
        // 		],
        // 		"xtrf": "11",
        // 		"projectType": "regular",
        // 		"_id": "5f7434b377514d2c28055320",
        // 		"steps": [
        // 			{
        // 				"_id": "5f76f01e2eea602770e5701c",
        // 				"stage": "stage1",
        // 				"step": {
        // 					"title": "Translation",
        // 					"calculationUnit": [
        // 						"5f7434b377514d2c2805532a"
        // 					],
        // 					"symbol": "translation",
        // 					"_id": "5f7434b377514d2c2805532d",
        // 					"isStage1": true,
        // 					"isStage2": false,
        // 					"isEditor": true,
        // 					"isActive": true,
        // 					"__v": 0
        // 				}
        // 			},
        // 			{
        // 				"_id": "5f76f01e2eea602770e5701d",
        // 				"stage": "stage2",
        // 				"step": {
        // 					"title": "Revising",
        // 					"calculationUnit": [
        // 						"5f7434b377514d2c2805532a"
        // 					],
        // 					"symbol": "revising",
        // 					"_id": "5f7434b377514d2c2805532e",
        // 					"isStage1": false,
        // 					"isStage2": true,
        // 					"isEditor": true,
        // 					"isActive": true,
        // 					"__v": 0
        // 				}
        // 			}
        // 		],
        // 		"createdAt": "2020-09-30T07:33:07.878Z",
        // 		"__v": 0
        // 	},
        // 	"quantity": 4
        // },
        testVendor: {
          '_id': 'ObjectId("5f7b0e50a2c17e32fc1853aa")',
          'rates': {
            'basicPricesTable': [
              {
                'basicPrice': 1,
                'altered': false,
                'notification': '',
                '_id': 'ObjectId("5f7b0e9ba2c17e32fc1853ba")',
                'type': 'Duo',
								"sourceLanguage": 'ObjectId("5f7434b477514d2c280553bc")',
								"targetLanguage": 'ObjectId("5f7434b477514d2c2805539e")'
							}
						],
						"stepMultipliersTable": [
							{
								"multiplier": 100,
								"defaultSize": true,
								"altered": false,
								"notification": "",
								"_id": 'ObjectId("5f7b0e9ba2c17e32fc1853bb")',
								"step": 'ObjectId("5f7434b377514d2c2805532d")',
								"unit": 'ObjectId("5f7434b377514d2c2805532a")',
								"size": 1
							},
							{
								"multiplier": 100,
								"defaultSize": true,
								"altered": false,
								"notification": "",
								"_id": 'ObjectId("5f7b0e9ba2c17e32fc1853bc")',
								"step": 'ObjectId("5f7434b377514d2c2805532e")',
								"unit": 'ObjectId("5f7434b377514d2c2805532a")',
								"size": 1
							}
						],
						"industryMultipliersTable": [
							{
								"multiplier": 100,
								"altered": false,
								"notification": "",
								"_id": 'ObjectId("5f7b0e9ba2c17e32fc1853bd")',
								"industry": 'ObjectId("5f7434b477514d2c28055401")'
							}
						],
						"pricelistTable": [
							{},
							{}
						]
					},
					"guid": "97d8076f-6e07-4145-b0dc-a77f2e9a15e3",
					"photo": "",
					"currency": "EUR",
					"firstName": "MAX TRANSLATOR",
					"website": "",
					"status": "Active",
					"surname": "",
					"email": "maksym@pangea.global",
					"phone": "",
					"timezone": "",
					"native": null,
					"gender": "",
					"skype": "",
					"companyName": "",
					"linkedin": "",
					"whatsapp": "",
					"basicRate": "",
					"tqi": "",
					"experienceYears": "",
					"availability": "",
					"catExperience": "",
					"internetAccess": "Yes",
					"softwares": [],
					"isTest": false,
					"professionalLevel": "",
					"documents": [
						{
							"fileName": "",
							"path": "1601900112853",
							"category": "NDA"
						},
						{
							"fileName": "",
							"path": "1601900112930",
							"category": "Contract"
						},
						{
							"fileName": "",
							"path": "1601900112983",
							"category": "Resume"
						}
					],
					"profExperiences": [],
					"educations": [],
					"industries": [
						'ObjectId("5f7434b477514d2c28055401")'
					],
					"positions": [],
					"password": "$2y$10$BD5uiSRNnKwFo4fJYHDarub7qV8F/ZlaC8kHlEAW8cmyn7bIThKL6",
					"matrix": {
						"xTranslated": {
							"text": "X translated",
							"rate": 10
						},
						"repeat": {
							"text": "Repetition",
							"rate": 20
						},
						"contextMatch": {
							"text": "Context match",
							"value": 20
						},
						"repeat100": {
							"text": "100%",
							"rate": 20
						},
						"repeat50": {
							"text": "50-74%",
							"rate": 100
						},
						"repeat75": {
							"text": "75-84%",
							"rate": 80
						},
						"repeat85": {
							"text": "85-94%",
							"rate": 60
						},
						"repeat95": {
							"text": "95-99%",
							"rate": 25
						},
						"noMatch": {
							"text": "No match",
							"rate": 100
						}
					},
					"cvFiles": [],
					"coverLetterFiles": [],
					"languagePairs": [],
					"competencies": [
						{},
						{}
					],
					"qualifications": [
						{
							"steps": [],
							"status": "Passed",
							"tqi": 77,
							"testType": "Test",

						}
					],
					"assessments": [],
					"wordCountInfo": [],
					"__v": 0
				},
			};
		},
		methods: {
      // stepFilesFiller(arr, category) {
      // 	let files = [];
      // 	for (let file of arr) {
      // 		const nameArr = file.split("/");
      // 		const filePath = __WEBPACK__API_URL__ + file.split("./dist")[1];
      // 		const fileName = nameArr[nameArr.length - 1];
      // 		const targetFile = this.task.targetFiles
      // 				? this.task.targetFiles.find((item) => item.fileName === fileName)
      // 				: "";
      // 		files.push({
      // 			check: false,
      // 			fileName: fileName,
      // 			category: category,
      // 			source: filePath,
      // 			target: targetFile ? __WEBPACK__API_URL__ + targetFile.path : "",
      // 		});
      // 	}
      // 	return files;
      // },
      refreshFinance ({ costs }) {
        console.log('refresh finance', costs);
      },
      closeInfo () {
        this.$emit('closeStepInfo');
      },
      ...mapActions({
        alertToggle: 'alertToggle',
        updateMatrix: 'updateMatrix',
      }),
			async getOriginallyLanguages() {
				try {
					const result = await this.$http.get("/api/languages");
					this.originallyLanguages = result.body;
				} catch (err) {
					this.alertToggle({
						message: "Error in Originally Languages",
						isShow: true,
						type: "error",
					});
				}
			},
			async getOriginallyUnits() {
				try {
					const result = await this.$http.get("/api/units");
					this.originallyUnits = result.body;
				} catch (err) {
					this.alertToggle({
						message: "Error in Originally Units",
						isShow: true,
						type: "error",
					});
				}
			},
		},
		computed: {
      ...mapGetters({
        currentProject: 'getCurrentProject',
      }),
      // stepFiles() {
      // 	let result = [];
      // 	if(this.task.sourceFiles) {
      // 		result.push(
      // 				...this.stepFilesFiller(this.task.sourceFiles, "Source file")
      // 		);
      // 	}
      // 	if(this.task.refFiles) {
      // 		result.push(
      // 				...this.stepFilesFiller(this.task.refFiles, "Reference file")
      // 		);
      // 	}
      // 	return result;
      // },
    },
		async created() {
			await this.getOriginallyLanguages();
			await this.getOriginallyUnits();
		},
		components: {
			Vendor,
			Finance,
		},
	};
</script>

<style lang="scss" scoped>
  .step-info {
    padding: 20px;
    position: relative;

    &__block {
      margin-bottom: 20px;
    }

    &__close {
      position: absolute;
      top: 3px;
      right: 8px;
      transform: rotate(45deg);
      font-size: 24px;
      font-weight: 600;
      cursor: pointer;
    }
  }

  .size {
    font-size: 20px;
  }
</style>
