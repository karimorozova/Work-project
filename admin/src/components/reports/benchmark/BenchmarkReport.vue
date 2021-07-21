<template lang="pug">
  .benchmark
    .benchmark__filters
      BenchmarkFilter(
        :isLqa="false"
        :allSources="filtersData.allSourceLang"
        :allTargets="filtersData.allTargetLang"
        :allVendors="filtersData.allVendors"
        :allSteps="filtersData.allSteps"
        :allUnits="filtersData.allUnits"
        :allIndustries="filtersData.allIndustries"
        :targetFilter="targetFilter"
        :sourceFilter="sourceFilter"
        :stepFilter="stepFilter"
        :unitFilter="unitFilter"
        :industryFilter="industryFilter"
        :vendorFilter="vendorFilter"
        @setVendorFilter="(e) => setFilter(e, 'vendorFilter')"
        @setIndustryFilter="(e) => setFilter(e, 'industryFilter')"
        @setSourceFilter="(e) => setFilter(e, 'sourceFilter')"
        @setTargetFilter="(e) => setFilter(e, 'targetFilter')"
        @setStepFilter="(e) => setFilter(e, 'stepFilter')"
        @setUnitFilter="(e) => setFilter(e, 'unitFilter')"
        @showNewVendorForm="showNewVendorForm"
        @updateBenchmark="getBenchmark"
      )

    .benchmark__languages
      .benchmark__language(v-for="{sourceLanguage, targetLanguage, industries} in reportData")
        .benchmark__info
          span.benchmark__language-pair.benchmark__bold {{sourceLanguage.lang + ' >> ' + targetLanguage.lang}}
          .benchmark__industry(v-for="{industry, stepInfo } in industries")
            .benchmark__step-info(v-for=" {step, benchmark,vendorInfo, unit} in stepInfo")
              span.benchmark__bold Industry: &nbsp;
              span {{industry.name}} &nbsp; &nbsp;
              span.benchmark__bold Step: &nbsp;
              span {{step.title}} &nbsp; &nbsp;
              span.benchmark__bold Unit: &nbsp;
              span {{unit.type}} &nbsp; &nbsp; &nbsp;
              span.benchmark__bold Benchmark: &nbsp;
              span € {{benchmark.toFixed(4)}} &nbsp; &nbsp;

              Table(:vendorsData="vendorInfo" :benchmarkPrice="benchmark")
    //.benchmark__form(v-if="false")
    //  NewVendor(:languages="allXtrfLangs" @close="closeForm" @saveVendor="saveVendor")
</template>

<script>
	import Table from "./Table"
	import NewVendor from "../NewVendor"
	import newXtrfVendor from "@/mixins/newXtrfVendor"
	import BenchmarkFilter from "./BenchmarkFilter"

	export default {
		mixins: [ newXtrfVendor ],
		props: {
			allXtrfLangs: { type: Array, default: () => [] }
		},
		data() {
			return {
				reportData: [],
				filtersData: {},
				sourceFilter: [ "English (United Kingdom)" ],
				targetFilter: [ "All" ],
				industryFilter: [ "iGaming", "Finance" ],
				vendorFilter: [ "All" ],
				stepFilter: [ "Translation" ],
				unitFilter: [ "CAT Wordcount" ],
				languages: [],
				isLanguages: true
			}
		},
		methods: {
			async getBenchmark() {
				try {
					const result = await this.$http.post("/reportsapi/vendor-benchmark-cost", { filters: this.filters })
					this.reportData = result.body.vendorInfo
					this.filtersData = result.body.benchmarkFilters
				} catch (err) {
					console.log(err)
					// this.alertToggle({ message: "Error on getting LQA report", isShow: true, type: "error" })
				}
			},
			getPrice(prices, prop) {
				return prices ? +prices[prop] : 0
			},
			async setFilter({ option }, prop) {
				this[prop] = option
				await this.getBenchmark()
			},
			updateBenchmark({ value }) {
				this.reportData = value
			},

			async setTargetFilter({ lang }) {
				if (lang !== 'All') {
					this.targetFilter = this.targetFilter.filter(item => item !== 'All')
					const position = this.targetFilter.indexOf(lang)
					if (position === -1) {
						this.targetFilter.push(lang)
						return await this.getBenchmark()
					}
					this.targetFilter.splice(position, 1)
				}
				this.targetFilter = !this.targetFilter.length || lang === 'All' ? [ "All" ] : this.targetFilter
				await this.getBenchmark()
			}
		},
		computed: {
			filters() {
				let result = {}
				if (this.targetFilter !== 'All') {
					result.targetFilter = this.targetFilter
				}
				if (this.sourceFilter !== 'All') {
					result.sourceFilter = this.sourceFilter
				}
				if (this.industryFilter !== 'All') {
					result.industryFilter = this.industryFilter
				}
				if (this.vendorFilter !== 'All') {
					result.vendorFilter = this.vendorFilter
				}
				if (this.stepFilter !== 'All') {
					result.stepFilter = this.stepFilter
				}
				if (this.unitFilter !== 'All') {
					result.unitFilter = this.unitFilter
				}

				return result
			}
		},
		components: {
			BenchmarkFilter,
			Table,
			NewVendor
		},
		created() {
			this.getBenchmark()
		}
	}
</script>

<style lang="scss" scoped>

  h3, h4 {
    margin: 0;
    padding: 0;
  }

  .benchmark {
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    position: relative;
    width: 1200px;
    margin: 50px;
    background: white;
    padding: 20px;
    box-sizing: border-box;
    border-radius: 4px;

    &__text {
      margin: 10px 0 5px;
    }

    &__step-info {
      font-size: 14px;
      margin: 10px 0;
    }


    &__language-pair {
      font-family: "Myriad600";
      font-size: 16px;
    }

    &__languages {
      //width: 30%;
      //max-height: 680px;
      //overflow-y: auto;
      //margin-top: 40px;
    }

    &__form {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }

    &__bold {
      font-family: Myriad600;
    }
  }

</style>
