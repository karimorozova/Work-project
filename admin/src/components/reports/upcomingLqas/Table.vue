<template lang="pug">
    .lqa-vendors-table(v-if="vendorsData")
        DataTable(
          :fields="fields"
          :tableData="vendorsData"
          :bodyClass="vendorsData.length < 24 ? 'tbody_visible-overflow height-700' : 'height-700'"
          :tableheadRowClass="vendorsData.length < 24 ? 'tbody_visible-overflow' : ''"
          @onRowClicked="selectVendor"
        )
          .lqa-vendors-table__header(slot="headerVendor" slot-scope="{ field }") {{ field.label }}
          .lqa-vendors-table__header(slot="headerWords" slot-scope="{ field }") {{ field.label }}
          .lqa-vendors-table__header(slot="headerIndustry" slot-scope="{ field }") {{ field.label }}
          .lqa-vendors-table__header(slot="headerTier" slot-scope="{ field }") {{ field.label }}
          .lqa-vendors-table__header(slot="headerLqa" slot-scope="{ field }") {{ field.label }}
          .lqa-vendors-table__header(slot="headerSourceLang" slot-scope="{ field }") {{ field.label }}
          .lqa-vendors-table__header(slot="headerTargetLang" slot-scope="{ field }") {{ field.label }}
          .lqa-vendors-table__data(slot="vendor" slot-scope="{ row }") {{ row.name }}
          .lqa-vendors-table__data(slot="words" slot-scope="{ row }") {{ presentWordcount(row.wordCount) | roundWordCount }}
          .lqa-vendors-table__data(slot="industry" slot-scope="{ row }") {{ row.industries }}
          .lqa-vendors-table__data(slot="tier" slot-scope="{ row }") {{ row.tier || '-'}}
          .lqa-vendors-table__data(slot="lqa" slot-scope="{ row }") {{  row.LQA }}
          .lqa-vendors-table__data(slot="sourceLanguage" slot-scope="{ row }") {{ row.sourceLang }}
          .lqa-vendors-table__data(slot="targetLanguage" slot-scope="{ row }") {{ row.targetLang }}
</template>

<script>
import DataTable from "@/components/DataTable";

export default {
    props: {
        vendorsData: {type: Array, default: () => []}
    },
    data() {
        return {
            fields: [
              { label: 'Vendor Name', headerKey: 'headerVendor', key: 'vendor', width: '25%' },
              { label: 'Wordcount', headerKey: 'headerWords', key: 'words', width: '10%' },
              { label: 'Industry', headerKey: 'headerIndustry', key: 'industry', width: '10%' },
              { label: 'Tier', headerKey: 'headerTier', key: 'tier', width: '5%' },
              { label: 'LQA#', headerKey: 'headerLqa', key: 'lqa', width: '10%' },
              { label: 'Source Language', headerKey: 'headerSourceLang', key: 'sourceLanguage', width: '20%' },
              { label: 'Target Language', headerKey: 'headerTargetLang', key: 'targetLanguage', width: '20%' },
            ]
        }
    },
    methods: {
        // getLqaNumber(row) {
        //     let result = 1;
        //     if(row.isLqa2) result = 2;
        //     result = row.isLqa3 ? 3 : result;
        //     return result;
        // },
        presentWordcount(words) {
            if(words.toString().indexOf(".") !== -1) {
                return words.toFixed(2);
            }
            return words;
        },
        selectVendor({index}) {
            this.$emit('selectVendor', {vendor: this.vendorsData[index]});
        }
    },
    components: {
        DataTable
    }
}
</script>

<style lang="scss" scoped>

.lqa-vendors-table {
    width: 70%;
    max-width: 1030px;
    margin: 10px 0 20px;
    &_red {
        color: red;
    }
    &_green {
        color: green;
    }
}

</style>
