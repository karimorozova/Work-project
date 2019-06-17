<template lang="pug">
.tasks-langs
    .source
        .tasks-langs__title Source Language(s):
            Asterisk(:customStyle="sourceAsteriskStyle")
        .source__drop-menu
            LanguagesSelect(
                placeholder="Source Languages"
                :langFilter="sourceFilter"
                :single='true'
                :selectedLangs="sourceLanguages"
                customClass="tasks-data__langs-mod"
                @chosenLang="setSource"
            )
    .target
        .tasks-langs__title Target Language(s):
            Asterisk(:customStyle="targetAsteriskStyle")
        .select-lang-wrapper
          .target__from
              span.target__search-value(v-model="langSearchValue" v-if="isSearching && langSearchValue") {{ langSearchValue }}
              Languages(
                  tabIndex="0"
                  :languages="targetAll"
                  :langSearchValue="langSearchValue"
                  @forceMove="forceMoveFromAll"
                  @searching="isSearching = true"
                  @searchValue="(e) => searchValue(e, 'targetAll')"
                  @slice="slice"
                  @sortBySearch="(e) => sortBySearch(e, 'targetAll')"
                  @clearSearch="(e) => clearSearch(e, 'targetAll')"
                  )
          .target__arrows
              Arrows(
                  @forward="(e) => moveTargets(e, 'targetAll', 'targetChosen')"
                  @back="(e) => moveTargets(e,  'targetChosen', 'targetAll')")
          .target__to
              Languages(
                  tabIndex="1"
                  :languages="targetChosen"
                  @forceMove="forceMoveFromChosen"
                  )
</template>

<script>
import LanguagesSelect from "../../LanguagesSelect";
import Asterisk from "../../Asterisk";
import Languages from "@/components/finance/langs/Languages";
import Arrows from "@/components/finance/langs/Arrows";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        sourceLanguages: {type: Array},
    },
    data() {
        return {
            targetAll: [],
            targetChosen: [],
            languagePairs: [],
            sourceAsteriskStyle: {right: '15px',  top: '-2px'},
            targetAsteriskStyle: {right: '16px',  top: '-2px'},
            langSearchValue: "",
            isSearching: false
        }
    },
    methods: {
        ...mapActions({
            storeProject: "storeProject"
        }),
        sortLangs(arrProp) {
            this[arrProp].sort((a,b) => {
                if(a.lang < b.lang) return -1;
                if(a.lang > b.lang) return 1;
            });
        },
        setSource({lang}) {
            this.$emit("setSourceLanguage", {symbol: lang.symbol});
            this.setPossibleTargets(lang.symbol);
            this.targetChosen = [];
        },
        setPossibleTargets(symbol) {
            const pairsWithPossibleTargets = this.languagePairs.filter(item => item.source && item.source.symbol === symbol);
            this.targetAll = !pairsWithPossibleTargets.length ? [] : pairsWithPossibleTargets.map(pair => pair.target);
            this.sortLangs('targetAll');
        },
        emitTargets() {
            this.$emit("setTargets", {targets: this.targetChosen});
        },
        forceMoveFromAll({index}) {
            const lang = this.targetAll.splice(index, 1);
            this.targetChosen.push(lang[0]);
            this.emitTargets();
            this.sortLangs('targetChosen');
        },
        forceMoveFromChosen({index}) {
            const lang = this.targetChosen.splice(index, 1);
            this.targetAll.push(lang[0]);
            this.emitTargets();
            this.sortLangs('targetAll');
        },
        moveTargets(e, from, to) {
            const checked = this[from].filter(item => item.check);
            this[from] = this[from].filter(item => !item.check);
            this[to].push(...checked);
            this.sortLangs(from);
            this.sortLangs(to);
            this.clearChecks(to);
            this.emitTargets();
        },
        searchValue({value}, prop) {
            this.langSearchValue+= value.toLowerCase();
            this[prop].filter(item => item.lang.toLowerCase().indexOf(this.langSearchValue) !== -1);
        },
        slice() {
            this.langSearchValue = this.langSearchValue.slice(0, -1);
        },
        clearChecks(prop) {
            this[prop].forEach(item => item.check = false);
            this.langSearchValue = "";
        },
        clearSearch(e, prop) {
            this.clearChecks(prop);
        },
        sortBySearch({value}, prop) {
            if(!value) return this.sortLangs(prop);
            const val = value.toLowerCase();
            for(let index in this[prop]) {
                const n = val.length;
                if(this[prop][index].lang.toLowerCase().slice(0, n) === val) {
                    let replaceLang = this[prop].splice(index, 1);
                    this[prop].unshift(replaceLang[0]);
                }
            }
        },
        async getLanguagePairs() {
            try {
                if(!this.currentProject._id) {
                    const curProject = await this.$http.get(`/pm-manage/project?id=${id}`);
                    await this.storeProject(curProject.body);
                }
                const langPairs = await this.$http.get(`/pm-manage/language-pairs?customerId=${this.currentProject.customer._id}`);
                this.setLanguages(langPairs.data);
            } catch(err) {

            }
        },
        setLanguages(langPairs) {
            this.languagePairs = langPairs;
            const pairsWithSource = langPairs.filter(item => item.source);
            const englishPair = pairsWithSource.find(item => item.source.symbol === 'EN-GB');
            const symbol = englishPair ? englishPair.source.symbol : "";
            this.$emit('setSourceLanguage', { symbol });
            this.setDefaultTargets(pairsWithSource, englishPair);
        },
        setDefaultTargets(pairs, eng) {
            if(!eng) {
                this.targetAll = pairs.map(pair => pair.target);
            } else {
                this.setPossibleTargets(eng.source.symbol);
            }
            this.sortLangs('targetAll');
        }
    },
    computed: {
        ...mapGetters({
            currentProject: "getCurrentProject"
        }),
        sourceFilter() {
            return this.languagePairs.filter(item => item.source).map(item => item.source._id);
        }
    },
    created() {
        this.getLanguagePairs();
    },
    components: {
        LanguagesSelect,
        Languages,
        Arrows,
        Asterisk
    }
}
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
        margin-bottom: 5px;
        position: relative;
        font-size: 14px;
        width: 140px;
    }
}
.source {
    margin-bottom: 30px;
    @extend %flex-column;
    &__drop-menu {
        position: relative;
        /*width: 191px;*/
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
