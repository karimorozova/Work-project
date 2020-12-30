<template lang="pug">
    .lqa-vendors-table(v-if="vendorsData")
        DataTable(
          :fields="fields"
          :tableData="vendorsData"
          :bodyClass="vendorsData.length < 24 ? 'tbody_visible-overflow height-700' : 'height-700'"
          :tableheadRowClass="vendorsData.length < 24 ? 'tbody_visible-overflow' : ''"
          @onRowClicked="selectVendor"
        )
          .lqa-vendors-table__header(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }") {{ field.label }}

          .lqa-vendors-table__data(slot="vendor" slot-scope="{ row }") {{ row.name }}
          .lqa-vendors-table__data(slot="sourceLanguage" slot-scope="{ row }") {{ row.sourceLang }}
          .lqa-vendors-table__data(slot="targetLanguage" slot-scope="{ row }") {{ row.targetLang }}
          .lqa-vendors-table__data(slot="words" slot-scope="{ row }") {{ presentWordcount(row.wordCount) | roundWordCount }}
          .lqa-vendors-table__data(slot="industry" slot-scope="{ row }") {{ row.industry }}
          .lqa-vendors-table__data(slot="tier" slot-scope="{ row }") {{ row.tier || '-'}}
          .lqa-vendors-table__data(slot="lqa" slot-scope="{ row }") {{  row.lqaNumber }}
          .lqa-vendors-table__data(slot="link" slot-scope="{ row }")
            a(:href="getVendorProfileLink(row.vendorId)" target="_blank" style="position: relative;")
              i.fa.fa-external-link.icon-link

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
              { label: 'Source Language', headerKey: 'headerSourceLang', key: 'sourceLanguage', width: '20%' },
              { label: 'Target Language', headerKey: 'headerTargetLang', key: 'targetLanguage', width: '20%' },
              { label: 'Wordcount', headerKey: 'headerWords', key: 'words', width: '10%' },
              { label: 'Industry', headerKey: 'headerIndustry', key: 'industry', width: '10%' },
              { label: 'Tier', headerKey: 'headerTier', key: 'tier', width: '5%' },
              { label: 'LQA#', headerKey: 'headerLqa', key: 'lqa', width: '5%' },
              { label: '', headerKey: 'headerLink', key: 'link', width: '5%' },
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
        },
      getVendorProfileLink(vendorId) {
          return '/vendors/details/' + vendorId
      }
    },
    components: {
        DataTable
    }
}
</script>

<style lang="scss" scoped>

.lqa-vendors-table {
    margin: 10px 0 20px;
    &_red {
        color: red;
    }
    &_green {
        color: green;
    }

    a{
      color: #67573e;
      text-decoration: none;

      .icon-link {
        position: absolute;
        right: -17px;
        top: 10px;
        font-size: 18px;
        cursor: pointer;
      }
    }

}

</style>
