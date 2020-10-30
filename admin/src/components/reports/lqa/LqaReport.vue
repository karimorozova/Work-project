<template lang="pug">
  .lqa
    .lqa__filters
      LqaReportFilter(
        :isLqa="false"
        :allSources="['allSources']"
        :allTargets="['allTargets']"
        :allVendors="['Vendors']"
        :targetFilter="targetFilter"
        :sourceFilter="sourceFilter"
        :tierFilter="tierFilter"
        :industryFilter="industryFilter"
        :vendorFilter="vendorFilter"
        @setTierFilter="setTierFilter"
        @setTargetFilter="setTargetFilter"
        @setSourceFilter="setSourceFilter"
        @setIndustryFilter="setIndustryFilter"
        @setVendorFilter="setVendorFilter"
      )
    .lqa__languages
      .lqa__language(v-for="{ sourceLanguage, targetLanguage, industries } in reportData")
        .lqa__text {{ sourceLanguage }} >> {{ targetLanguage }}
        .lqa__industries(v-for="{industry, vendors} in industries")
          .lqa__industry {{ industry }}
            Table(:vendorsData="vendors")

      //.lqa__form(v-if="false")
        NewVendor(:languages="allXtrfLangs" @close="closeForm" @saveVendor="saveVendor")
</template>

<script>
	import NewVendor from "../NewVendor";
	import Table from "./Table";
	import { mapActions } from "vuex";
	import LqaReportFilter from "./LqaReportFilter";

	export default {
		data() {
			return {
				reportData: null,
				nameFilter: "",

				sourceFilter: "All",
				targetFilter: "All",
				industryFilter: "All",
				tierFilter: "All",
				vendorFilter: "All",

				languages: [],
				allLangs: [],
				isLanguages: true
			}
		},
		methods: {
			...mapActions(['alertToggle']),
			async getReport() {
				try {
					// const result = await this.$http.post("/reportsapi/xtrf-lqa-report", { filters: this.filters });
					this.reportData = [
						{
							sourceLanguage: 'EN',
							targetLanguage: 'FR',
							industries: [{
								industry: 'Finance',
								vendors: [{
									name: 'KDJ ajsk',
									email: 'ghjasda@asjhd.asd',
									wordCount: 12738,
									otherInfo: []
								},
									{
										name: ' asdf sadfsa f',
										email: 'ghjasda@asjhd.asd',
										wordCount: 234234234,
										otherInfo: []
									},
									{
										name: 'Kasd fsdafsdk',
										email: 'ghjasda@asjhd.asd',
										wordCount: 12723121238,
										otherInfo: []
									}
								],
							},
								{
									industry: 'Finance',
									vendors: [{
										name: 'ASDSAD SAD',
										email: 'ghjasda@asjhd.asd',
										wordCount: 12738,
										otherInfo: []
									}],
								},
								{
									industry: 'IGaming',
									vendors: [{
										name: 'SAKJDKSAN asd',
										email: 'ghjasda@asjhd.asd',
										wordCount: 333,
										otherInfo: []
									}],
								}
							]
						},
						{
							sourceLanguage: 'EN',
							targetLanguage: 'GB',
							industries: [{
								industry: 'Finance',
								vendors: [{
									name: 'asd asd 21 ',
									email: 'ghjasda@asjhd.asd',
									wordCount: 7777,
									otherInfo: []
								}],
							}]
						}, {
							sourceLanguage: 'EN',
							targetLanguage: 'FR',
							industries: [{
								industry: 'IGaming',
								vendors: [{
									name: 'JAHSD ASHD',
									email: 'ghjasd2a@asjhd.asd',
									wordCount: 5555,
									otherInfo: []
								}],
							}]
						}];
					console.log(this.reportData);


					// const languages = await this.$http.get("/api/languages");
					// this.allLangs = languages.data;
					//
					// if(this.isLanguages) {
					// 	this.languages = [...new Set(languages.data.map(item => item.group))];
					// 	this.languages.unshift("All");
					// }
					//
					// this.isLanguages = false;
				} catch (err) {
					this.alertToggle({ message: "Error on getting LQA report", isShow: true, type: "error" });
				}
			},

			async setTierFilter({ value }) {
				this.tierFilter = value;
				await this.getReport();
			},
			async setSourceFilter({ option }) {
				this.sourceFilter = option;
				await this.getReport();
			},
			async setTargetFilter({ option }) {
				this.targetFilter = option;
				await this.getReport();
			},
			async setVendorFilter({ option }) {
				this.vendorFilter = option;
				await this.getReport();
			},
			async setIndustryFilter({ option }) {
				this.industryFilter = option;
				await this.getReport();
			},
		},
		computed: {
			filters() {
				let result = {};
				if(this.targetFilter !== 'All') {
					result.targetFilter = this.targetFilter;
				}
				if(this.sourceFilter !== 'All') {
					result.sourceFilter = this.sourceFilter;
				}
				if(this.tierFilter !== 'All') {
					result.tierFilter = this.tierFilter;
				}
				if(this.industryFilter !== "All") {
					result.industryFilter = this.industryFilter;
				}
				if(this.vendorFilter !== "All") {
					result.vendorFilter = this.vendorFilter;
				}
				return result;
			}
		},
		components: {
			LqaReportFilter,
			NewVendor,
			Table
		},
		mounted() {
			this.getReport();
		}
	}
</script>

<style lang="scss" scoped>
  .lqa {
    margin: 40px 40px 40px 20px;
    width: 1100px;
    box-shadow: 0 0 10px rgba(104, 87, 62, .5);
    padding: 20px;

    &__text {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    &__industry {
      font-size: 20px;
    }
  }

</style>
