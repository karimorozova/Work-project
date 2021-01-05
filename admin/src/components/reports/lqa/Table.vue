<template lang="pug">
  .lqa-table(v-if="vendorsData")
    DataTable(
      :fields="fields"
      :tableData="vendorsData"
      :bodyClass="vendorsData.length < 6 ? 'tbody_visible-overflow' : ''"
      :tableheadRowClass="vendorsData.length < 6 ? 'tbody_visible-overflow' : ''"
    )
      .lqa-table__header(v-for="{label, headerKey} in fields" :slot="headerKey" slot-scope="{ field }") {{ label }}
      .lqa-table__header(slot="vendor" slot-scope="{ row }") {{ row.name }}
      .lqa-table__header(slot="wordcount" slot-scope="{ row }") {{ row.wordCount | roundWordCount}}
      .lqa-table__header(slot="tqi" slot-scope="{ row }")
        a(v-if="getLinkTQI(row)" :href="domain + getLinkTQI(row)" class="lqa-table__link" target="_blank")
          img(:class="'lqa-table__download'" src="../../../assets/images/download-big-b.png")
      .lqa-table__header(slot="lqa1" slot-scope="{ row }")
        a(v-if="getLinkLQAOne(row)" :href="domain + getLinkLQAOne(row)" class="lqa-table__link" target="_blank")
          img(:class="'lqa-table__download'" src="../../../assets/images/download-big-b.png")
      .lqa-table__header(slot="lqa2" slot-scope="{ row }")
        a(v-if="getLinkLQATwo(row)" :href="domain + getLinkLQATwo(row)" class="lqa-table__link" target="_blank")
          img(:class="'lqa-table__download'" src="../../../assets/images/download-big-b.png")
      .lqa-table__header(slot="lqa3" slot-scope="{ row }")
        a(v-if="getLinkLQAThree(row)" :href="domain + getLinkLQAThree(row)" class="lqa-table__link" target="_blank")
          img(:class="'lqa-table__download'" src="../../../assets/images/download-big-b.png")
      .lqa-table__header(slot="link" slot-scope="{ row }")
        a(:href="getVendorProfileLink(row.vendor._id)" target="_blank" style="position: relative")
          i.fa.fa-external-link.icon-link

</template>

<script>
	import DataTable from "@/components/DataTable";
  import { mapGetters } from "vuex";

	export default {
		props: {
			vendorsData: { type: Array, default: () => [] },
      additionalInformation: {type: Object}
		},
		data() {
			return {
				fields: [
					{ label: "Vendor Name", headerKey: "headerVendor", key: "vendor", width: "35%"},
					{ label: "Wordcount", headerKey: "headerWords", key: "wordcount", width: "12%"},
					{ label: "TQI", headerKey: "headerTqi", key: "tqi", width: "12%"},
					{ label: "LQA 1", headerKey: "headerLqa1", key: "lqa1", width: "12%"},
					{ label: "LQA 2", headerKey: "headerLqa2", key: "lqa2", width: "12%"},
					{ label: "LQA 3", headerKey: "headerLqa3", key: "lqa3", width: "12%"},
					{ label: "", headerKey: "headerLink", key: "link", width: "5%"},
				],
        domain: "http://localhost:3001",
			}
		},
		methods: {
      getStepLink(assessment, step) {
        const languages = this.additionalInformation.languagePair.split(' >> ')
        const industryGroup = this.additionalInformation.industryGroup
        const sourceLangId = this.findLanguageByTitle(languages[0])._id
        const targetLangId = this.findLanguageByTitle(languages[1])._id

        const assessmentLangPair = assessment.find(({sourceLanguage, targetLanguage}) =>
          (
            sourceLanguage.toString() ===  sourceLangId.toString()
            && targetLanguage.toString() ===  targetLangId.toString()
          )
        )

        if (!assessmentLangPair) return null;

        const assessmentIndustry = assessmentLangPair.industries.find(({industry})=>{
          return industry === industryGroup._id.toString()
        })

        return assessmentIndustry ? assessmentIndustry.steps[0][step].path : null
      },

      getLinkTQI(row) {
        return this.getStepLink(row.vendor.assessments,'tqi') || false
      },
      getLinkLQAOne(row) {
        return this.getStepLink(row.vendor.assessments,'lqa1') || false
      },
      getLinkLQATwo(row) {
        return this.getStepLink(row.vendor.assessments,'lqa2') || false
      },
      getLinkLQAThree(row) {
        return this.getStepLink(row.vendor.assessments,'lqa3') || false
      },

      findLanguageByTitle(title) {
        return this.allLanguages.find(language=>{
          return language.lang === title
        } )
      },
      getVendorProfileLink(vendorId) {
        return '/vendors/details/' + vendorId
      }
    },
    computed: {
		  ...mapGetters({
        allLanguages: 'getAllLanguages'
      }),
    },
		components: {
			DataTable
		}
	}
</script>

<style lang="scss" scoped>

  .lqa-table {
    margin-top: 3px;

    a{
      color: #67573e;
      text-decoration: none;

      .icon-link {
        font-size: 18px;
      }
    }

    &__download {
      height: 21px;
      width: 21px;
      margin: -4px 7px;
    }

  }
</style>
