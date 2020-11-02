<template lang="pug">
  .tier
    .tier__body
      .tier__filters
        TierReportsFilter(
          :isLqa="false"
          :allSources="allSources"
          :allTargets="allTargets"
          :targetFilter="targetFilter"
          :sourceFilter="sourceFilter"
          :tierFilter="tierFilter"
          @setTierFilter="setTierFilter"
          @setTargetFilter="setTargetFilter"
          @setSourceFilter="setSourceFilter"
          @updateReports="updateReports"
        )
      .tier__table
        DataTable(
          :fields="fields"
          :tableData="reportData"
          bodyClass="height-700"
          @onRowClicked="showInfo"
        )
          .tier__header(slot="headerSource" slot-scope="{ field }") {{ field.label }}
          .tier__header(slot="headerTarget" slot-scope="{ field }") {{ field.label }}
          .tier__header(slot="headerAll" slot-scope="{ field }") {{ field.label }}
            img.tier__icon(
              :class="{'tier_rotated': isAllSorted}"
              src="../../../assets/images/open-arrow_white.png"
              @click="sortData('allTier', 'isAllSorted')")
          .tier__header(slot="headerFin" slot-scope="{ field }") {{ field.label }}
            img.tier__icon(
              :class="{'tier_rotated': isFinanceSorted}"
              src="../../../assets/images/open-arrow_white.png"
              @click="sortData('financeTier', 'isFinanceSorted')")
          .tier__header(slot="headerGame" slot-scope="{ field }") {{ field.label }}
            img.tier__icon(
              :class="{'tier_rotated': isGamingSorted}"
              src="../../../assets/images/open-arrow_white.png"
              @click="sortData('gameTier', 'isGamingSorted')")

          template(slot="source" slot-scope="{ row }")
            .tier__data {{ row.source }}
          template(slot="target" slot-scope="{ row }")
            .tier__data {{ row.target }}
          template(slot="all" slot-scope="{ row, index }")
            .tier__data(v-if="activeIndex !== index") Tier {{ row.hasOwnProperty('allTier') ? row.allTier.tier : '-' }}
            .tier__data.tier_orange(v-else) Clients: {{ row.hasOwnProperty('allTier') ? row.allTier.clients : '-' }}; &nbsp; &nbsp; Words: {{row.hasOwnProperty('allTier') ? row.allTier.wordcount : '-' }}
          template(slot="fin" slot-scope="{ row, index }")
            .tier__data(v-if="activeIndex !== index") Tier {{ row.hasOwnProperty('financeTier') ? row.financeTier.tier : '-' }}
            .tier__data.tier_orange(v-else) Clients: {{ row.hasOwnProperty('financeTier') ? row.financeTier.clients : '-' }}; &nbsp; &nbsp; Words: {{ row.hasOwnProperty('financeTier') ? row.financeTier.wordcount : '-' }}
          template(slot="game" slot-scope="{ row, index }")
            .tier__data(v-if="activeIndex !== index") Tier {{ row.hasOwnProperty('gameTier') ? row.gameTier.tier : '-' }}
            .tier__data.tier_orange(v-else) Clients: {{ row.hasOwnProperty('gameTier') ? row.gameTier.clients : '-' }}; &nbsp; &nbsp; Words: {{ row.hasOwnProperty('gameTier') ? row.gameTier.wordcount : '-' }}
</template>

<script>
	import DataTable from "@/components/DataTable";
	import { mapActions } from "vuex";
	import TierReportsFilter from "./TierReportsFilter";

	export default {
		data() {
			return {
				fields: [
					{ label: "Source Language", headerKey: "headerSource", key: "source", width: "23%" },
					{ label: "Target Language", headerKey: "headerTarget", key: "target", width: "23%" },
					{ label: "All Industries", headerKey: "headerAll", key: "all", width: "18%" },
					{ label: "Financial Industries", headerKey: "headerFin", key: "fin", width: "18%" },
					{ label: "Gaming Industries", headerKey: "headerGame", key: "game", width: "18%" }
				],
				reportData: [],
				isAllSorted: false,
				isFinanceSorted: false,
				isGamingSorted: false,
				tierFilter: "All",
				targetFilter: "All",
				sourceFilter: "English [grouped]",
				activeIndex: -1,
				allSources: [],
				allTargets: [],

			}
		},
		methods: {
			...mapActions(['alertToggle']),
			async updateReports() {
				await this.updateReportsCollections();
				await this.getReport();
			},
			async updateReportsCollections() {
				try {
					await this.$http.get('/reportsapi/rewrite-xtrf-tier-report');
				} catch (err) {
					this.alertToggle({ message: "Error on update tier reports", isShow: true, type: "error" })
				}
			},
			async getReport() {
				this.activeIndex = -1;
				try {
					const result = await this.$http.post("/reportsapi/xtrf-tier-report", { filters: this.filters });
					const { filteredReports, structuredReports } = result.data;
					this.reportData = filteredReports;
					if(structuredReports) {
						this.allSources = [...new Set(structuredReports.map(i => i.source))];
						this.allSources.unshift('All');
						this.allTargets = [...new Set(structuredReports.map(i => i.target))];
						this.allTargets.unshift('All');
					}
				} catch (err) {
					this.alertToggle({ message: "Error on getting tier report", isShow: true, type: "error" });
				}
			},
			sortData(tierProp, prop) {
				this.activeIndex = -1;
				this[prop] = !this[prop];

				const residualArr = this.reportData.filter(item => !item.hasOwnProperty(tierProp));
				if(this[prop]) {
					this.reportData = this.reportData.filter(item => item.hasOwnProperty(tierProp))
              .sort((a, b) => a[tierProp]['tier'] - b[tierProp]['tier']);
          this.reportData.push(...residualArr);

				} else {
					this.reportData = this.reportData.filter(item => item.hasOwnProperty(tierProp))
              .sort((a, b) => b[tierProp]['tier'] - a[tierProp]['tier'])
					this.reportData.unshift(...residualArr);
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
			showInfo({ index }) {
				this.activeIndex = this.activeIndex === index ? -1 : index;
			}
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
					result.tierFilter = +this.tierFilter;
				}
				return result;
			}
		},
		components: {
			TierReportsFilter,
			DataTable,
		},
		mounted() {
			this.getReport();
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .tier {

    &__body {
      margin: 40px 40px 40px 20px;
      width: 1100px;
      box-shadow: 0 0 10px rgba(104, 87, 62, .5);
      padding: 20px;
    }

    &__filters {
      margin-bottom: 20px;
    }

    &__table {
      position: relative;
    }

    &__icon {
      margin-left: 10px;
      cursor: pointer;
    }

    &__average {
      position: absolute;
      z-index: 20;
    }

    &_rotated {
      transform: rotate(180deg);
    }

    &_orange {
      color: $orange;
    }
  }

</style>
