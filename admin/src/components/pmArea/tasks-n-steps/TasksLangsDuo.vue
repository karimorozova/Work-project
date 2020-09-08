<template lang="pug">
  .tasks-langs
    .source
      .tasks-langs__title-source Source Language:
        Asterisk(:customStyle="sourceAsteriskStyle")
      .source__drop-menu
        SelectSingle(
          placeholder="Language",
          :options="possibleSourceLanguages",
          :selectedOption="sourceLanguages.length ? sourceLanguages[0] : ''",
          @chooseOption="setSource"
        )
    .target
      .tasks-langs__title-target Target Language(s):
        Asterisk(:customStyle="targetAsteriskStyle")
      .select-lang-wrapper
        .target__from
          span.target__search-value(v-model="langSearchValue", v-if="isSearching && langSearchValue") {{ langSearchValue }}
          Languages(
            tabIndex="0",
            :languages="targetAll",
            :langSearchValue="langSearchValue",
            @forceMove="forceMoveFromAll",
            @searching="isSearching = true",
            @searchValue="(e) => searchValue(e, 'targetAll')",
            @slice="slice",
            @sortBySearch="(e) => sortBySearch(e, 'targetAll')",
            @clearSearch="(e) => clearSearch(e, 'targetAll')"
          )
        .target__arrows
          Arrows(
            @forward="(e) => moveTargets(e, 'targetAll', 'targetChosen')",
            @back="(e) => moveTargets(e, 'targetChosen', 'targetAll')"
          )
        .target__to
          Languages(tabIndex="1", :languages="targetChosen", @forceMove="forceMoveFromChosen")
</template>

<script>
	import SelectSingle from "../../SelectSingle";
	import Asterisk from "../../Asterisk";
	import Languages from "@/components/finance/langs/Languages";
	import Arrows from "@/components/finance/langs/Arrows";
	import {mapGetters, mapActions} from "vuex";

	export default {
		props: {
			originallyLanguages: {
				type: Array,
			},
			sourceLanguages: {type: Array},
			isRequest: {type: Boolean},
		},
		data() {
			return {
				wordsRates: [],
				hoursRates: [],
				targetAll: [],
				targetChosen: [],
				languagePairs: [],
				sourceAsteriskStyle: {right: "15px", top: "-2px"},
				targetAsteriskStyle: {right: "16px", top: "-2px"},
				langSearchValue: "",
				isSearching: false,
			};
		},
		methods: {
			...mapActions({
				storeProject: "setCurrentProject",
				setDataValue: "setTasksDataValue",
			}),
			sortLangs(arrProp) {
				this[arrProp].sort((a, b) => {
					if (a.lang < b.lang) return -1;
					if (a.lang > b.lang) return 1;
				});
			},
			getDistinctLangs(langs) {
				if (!langs.length) return [];
				return langs.filter(
					(obj, index, self) =>
						self.map((item) => item.lang).indexOf(obj.lang) === index
				);
			},
			setSource({option}) {
				const {symbol} = this.currentProject.customer.sourceLanguages.find(
					(item) => item.lang === option
				);
				this.$emit("setSourceLanguage", {symbol: symbol});
				this.setPossibleTargets();
				this.targetChosen = [];
			},

			setPossibleTargets() {
				this.targetAll = this.currentProject.customer.targetLanguages
				if (this.targetAll.length) {
					this.setUniqueLangs("targetAll");
					this.sortLangs("targetAll");
				}
			},
			setUniqueLangs(arrProp) {
				this[arrProp] = this[arrProp].reduce(
					(acc, cur) =>
						acc.findIndex((el) => el._id === cur._id) < 0 ? [...acc, cur] : acc,
					[]
				);
			},
			emitTargets() {
				this.$emit("setTargets", {targets: this.targetChosen});
			},
			forceMoveFromAll({index}) {
				const lang = this.targetAll.splice(index, 1);
				this.targetChosen.push(lang[0]);
				this.emitTargets();
				this.sortLangs("targetChosen");
			},
			forceMoveFromChosen({index}) {
				const lang = this.targetChosen.splice(index, 1);
				this.targetAll.push(lang[0]);
				this.emitTargets();
				this.sortLangs("targetAll");
			},
			moveTargets(e, from, to) {
				const checked = this[from].filter((item) => item.check);
				this[from] = this[from].filter((item) => !item.check);
				this[to].push(...checked);
				this.sortLangs(from);
				this.sortLangs(to);
				this.clearChecks(to);
				this.emitTargets();
			},
			searchValue({value}, prop) {
				this.langSearchValue += value.toLowerCase();
				this[prop].filter(
					(item) => item.lang.toLowerCase().indexOf(this.langSearchValue) !== -1
				);
			},
			slice() {
				this.langSearchValue = this.langSearchValue.slice(0, -1);
			},
			clearChecks(prop) {
				this[prop].forEach((item) => (item.check = false));
				this.langSearchValue = "";
			},
			clearSearch(e, prop) {
				this.clearChecks(prop);
			},
			sortBySearch({value}, prop) {
				if (!value) return this.sortLangs(prop);
				const val = value.toLowerCase();
				for (let index in this[prop]) {
					const n = val.length;
					if (this[prop][index].lang.toLowerCase().slice(0, n) === val) {
						let replaceLang = this[prop].splice(index, 1);
						this[prop].unshift(replaceLang[0]);
					}
				}
			},
			setRequestLanguages() {
				const {symbol} = this.currentProject.sourceLanguage;
				this.$emit("setSourceLanguage", {symbol});
				this.setDataValue({
					prop: "source",
					value: this.currentProject.sourceLanguage,
				});
				this.setDataValue({
					prop: "targets",
					value: this.currentProject.targetLanguages,
				});
				this.targetChosen = [...this.currentProject.targetLanguages];
				this.targetAll = this.getFilteredTargets(this.targetChosen);
				this.sortLangs("targetChosen");
			},
			getFilteredTargets(langs) {
				const symbols = langs.length ? langs.map((item) => item.symbol) : [];
				return symbols.length
					? this.targetAll.filter((item) => symbols.indexOf(item.symbol) === -1)
					: this.targetAll;
			},
			getStartedSourceLanguage() {
				if (this.currentProject._id) {
					if (this.currentProject.customer.sourceLanguages.length === 1) {
						this.setSource({option: this.currentProject.customer.sourceLanguages[0].lang})
					}
				}
			},
		},
		created() {
			this.getStartedSourceLanguage();
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject",
			}),
			possibleSourceLanguages() {
				if (this.currentProject._id) {
					return this.currentProject.customer.sourceLanguages.map(
						(item) => item.lang
					);
				}
			},
		},
		components: {
			Languages,
			Arrows,
			Asterisk,
			SelectSingle,
		},
	};
</script>

<style lang="scss" scoped>
  %flex-row {
    display: flex;
    align-items: center;
  }

  %flex-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .tasks-langs {
    margin-bottom: 35px;

    &__title {
      &-source {
        margin-bottom: 5px;
        position: relative;
        width: 145px;
      }

      &-target {
        margin-bottom: 5px;
        position: relative;
        width: 160px;
      }
    }
  }

  .source {
    margin-bottom: 30px;
    @extend %flex-column;

    &__drop-menu {
      position: relative;
      width: 100%;
      height: 28px;
    }
  }

  .target {
    &__arrows {
      margin: 0 20px;
    }

    &__from {
      position: relative;
    }

    &__search-value {
      position: absolute;
      top: -20px;
      font-size: 14px;
      left: 100%;
    }
  }

  .select-lang-wrapper {
    @extend %flex-row;
    justify-content: space-between;
  }
</style>
