<template lang="pug">
    .lqa-vendors-table(v-if="vendorsData")
        DataTable(
          :fields="fields"
          :tableData="vendorsData"
          :bodyClass="vendorsData.length < 14 ? 'tbody_visible-overflow height-500' : 'height-500'"
          :tableheadRowClass="vendorsData.length < 14 ? 'tbody_visible-overflow' : ''"
          @onRowClicked="selectVendor"
        )
          .lqa-vendors-table__header(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }") {{ field.label }}
            img.lqa-vendors-table__icon(
              v-if='field.sort'
              :class="{'sort_icon_rotate': isAscSort[field.valueName] }"
              src="../../../assets/images/open-arrow_white.png"
              @click="sort(field.valueName)"
            )

          .lqa-vendors-table__data(slot="vendor" slot-scope="{ row }") {{ row.name }}
          .lqa-vendors-table__data(slot="sourceLanguage" slot-scope="{ row }") {{ row.sourceLang }}
          .lqa-vendors-table__data(slot="targetLanguage" slot-scope="{ row }") {{ row.targetLang }}
          .lqa-vendors-table__data(slot="words" slot-scope="{ row }") {{ presentWordcount(row.wordCount) | roundWordCount }}
          .lqa-vendors-table__data(slot="industry" slot-scope="{ row }") {{ row.industry.name }}
          .lqa-vendors-table__data(slot="tier" slot-scope="{ row }") {{ row.tier || '-'}}
          .lqa-vendors-table__data(slot="lqa" slot-scope="{ row }") {{  row.lqaNumber }}
          .lqa-vendors-table__data.center(slot="link" slot-scope="{ row }")
            span.icon-link(@click.stop="routeToVendor(row.vendorId)")
              i.fas.fa-external-link-alt

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
              { label: 'Vendor Name', headerKey: 'headerVendor', key: 'vendor', width: '25%'},
              { label: 'Source Language', headerKey: 'headerSourceLang', key: 'sourceLanguage', width: '20%'},
              { label: 'Target Language', headerKey: 'headerTargetLang', key: 'targetLanguage', width: '20%' },
              { label: 'Wordcount', headerKey: 'headerWords', key: 'words', width: '10%', valueName: 'wordCount', sort: true},
              { label: 'Industry', headerKey: 'headerIndustry', key: 'industry', width: '10%' },
              { label: 'Tier', headerKey: 'headerTier', key: 'tier', width: '5%' },
              { label: 'LQA', headerKey: 'headerLqa', key: 'lqa', width: '6%', valueName: 'lqaNumber', sort: true},
              { label: '', headerKey: 'headerLink', key: 'link', width: '4%'},
            ],
            activeSort: '',
            isAscSort: {}
        }
    },
    methods: {
	    routeToVendor(vendorId){
		    const route = this.$router.resolve({ path: `/vendors/all/details/${ vendorId }` });
		    window.open(route.href, "_blank");
	    },
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
      },
      sort(field) {
        this.isAscSort[field] = !this.isAscSort[field] ? true : !this.isAscSort[field]
        this.activeSort = field
        this.$emit('sortByField', {field: this.activeSort, isAscSort: this.isAscSort[field]});
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

    &__icon{
      margin-left: 10px;
      cursor: pointer;

      &.sort_icon_rotate {
        transform: rotate(180deg);
      }
    }
    &__data.center {
      text-align: center;
    }

    &_red {
        color: red;
    }

    &_green {
        color: green;
    }

    .icon-link {
      font-size: 16px;
    }
}

</style>
