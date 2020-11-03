<template lang="pug">
  .lqa(@scroll="handleBodyScroll")
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
        nameFilter: '',

        sourceFilter: 'All',
        targetFilter: 'All',
        industryFilter: 'All',
        tierFilter: 'All',
        vendorFilter: 'All',

        availableSources: [],
        availableTargets: [],
        availableVendors: [],
        allLangs: [],
        isLanguages: true,
        filterCount: 10,
        isDataRemain: true,
      }
		},
		methods: {
      ...mapActions(['alertToggle']),
      async handleBodyScroll (e) {
        const element = e.target;
        if (Math.ceil(element.scrollHeight - element.scrollTop) === element.clientHeight) {
          if (this.isDataRemain) {
            const result = await this.$http.post('/reportsapi/xtrf-lqa-report', { filters: this.filters });
            this.filterCount += 10;
            this.isDataRemain = result.data.length === 10;
            this.reportData.push(...result.data);
          }
        }
      },
      async getFilterOptions () {
        const result = await this.$http.get('/reportapi/xtrf-lqa-reports-options');
        for (let key in result.data) {
          if (result.data.hasOwnProperty(key)) this[key].push(...result.data[key]);
        }
      },
      async getReport (filters) {
        try {
          const result = await this.$http.post('/reportsapi/xtrf-lqa-report', { filters });
          this.reportData = result.data;
        } catch (err) {
          this.alertToggle({ message: 'Error on getting LQA report', isShow: true, type: 'error' });
        }
      },

      async setTierFilter ({ value }) {
        this.tierFilter = value;
        await this.getReport(this.filters);
      },
			async setSourceFilter({ option }) {
        this.sourceFilter = option;
        await this.getReport(this.filters);
      },
			async setTargetFilter({ option }) {
        this.targetFilter = option;
        await this.getReport(this.filters);
      },
			async setVendorFilter({ option }) {
        this.vendorFilter = option;
        await this.getReport(this.filters);
      },
			async setIndustryFilter({ option }) {
        this.industryFilter = option;
        await this.getReport(this.filters);
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
        if (this.tierFilter !== 'All') {
          result.tierFilter = this.tierFilter;
        }
        if (this.industryFilter !== 'All') {
          result.industryFilter = this.industryFilter;
        }
        if (this.vendorFilter !== 'All') {
          result.vendorFilter = this.vendorFilter;
        }
        result.countFilter = this.filterCount;
        return result;
      }
    },
    components: {
      LqaReportFilter,
      NewVendor,
      Table
    },
    created () {
      this.getFilterOptions();
    },
    mounted () {
      this.getReport(this.filters);
    }
  }
</script>

<style lang="scss" scoped>
  .lqa {
    margin: 40px 40px 40px 20px;
    width: 1100px;
    box-shadow: 0 0 10px rgba(104, 87, 62, .5);
    padding: 20px;
    max-height: 750px;
    overflow-y: auto;

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
