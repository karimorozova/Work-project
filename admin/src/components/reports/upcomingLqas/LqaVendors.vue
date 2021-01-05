<template lang="pug">
    .lqa-vendors
        .lqa-vendors__filters
            Filters(
                :isAddVendor="false"
                :isTarget="false"
                :languages="allXtrfLangs"
                :industryFilter="industryFilter"
                :tierFilter="tierFilter"
                :lqaFilter="lqaFilter"
                :nameFilter="nameFilter"
                @setNameFilter="(e) => setFilter(e, 'nameFilter')"
                @setIndustryFilter="(e) => setFilter(e, 'industryFilter')"
                @setTierFilter="(e) => setFilter(e, 'tierFilter')"
                @setLqaFilter="(e) => setFilter(e, 'lqaFilter')"
            )
        .lqa-vendors__table(v-if="this.reportData.length")
          Table(:vendorsData="allVendors" @selectVendor="openForm")
        .lqa-vendors__form(v-if="isForm")
          VendorLqa(:vendorData="lqaData", @closeForm="closeForm()", @saveVendorLqa="saveVendorLqa")
</template>

<script>
import Filters from "../Filters";
import Table from "./Table";
import VendorLqa from "../../vendors/VendorLqa";
import { mapActions } from "vuex";

export default {
    props: {
        allXtrfLangs: {type: Array, default: () => []}
    },
    data() {
        return {
            reportData: [],
            nameFilter: "",
            industryFilter: "All",
            tierFilter: "All",
            lqaFilter: "All",
            isForm: false,
            selectedVendor: null,
            languages: null,
            currentAssessment: ''
        }
    },
    methods: {
        ...mapActions({
          alertToggle: "alertToggle",
          storeAssessment: "storeCurrentVendorAssessment",
        }),
        async getReport() {
            try {
                const result = await this.$http.post("/reportsapi/xtrf-upcoming-lqa-report", { filters: this.filters });
                if(this.filters.tierFilter){
                     this.reportData = {
                       financeReports: Object.values(result.body.financeReports)
                         .filter(item => item.tier === this.filters.tierFilter),
                       gamingReports : Object.values(result.body.gamingReports)
                         .filter(item => item.tier === this.filters.tierFilter)
                     };
                }else{
                    this.reportData = result.body
                }
            } catch(err) {
                this.alertToggle({message: "Error on getting LQA report", isShow: true, type: "error"});
            }
        },
        async getLanguages(){
            try {
                const languages = await this.$http.get("/api/languages");
                this.languages = languages.data;
            } catch (error) {
                this.alertToggle({message: "Error on getting Languages", isShow: true, type: "error"});
            }
        },
        async setFilter({value}, prop) {
            this[prop] = value;
            await this.getReport();
        },
      selectVendor ({ vendor }) {
        this.selectedVendor = {vendor, ...vendor.modalLqa};
        this.isForm = true;
      },
      closeForm() {
          this.isForm = false;
      },
      openForm({ vendor }) {
        const {
          sourceLang,
          targetLang,
          sourceLangInfo,
          targetLangInfo,
          industry,
          step,
          name,
          field,
          steps,
          assessmentId,
          mainIndex,
          industryIndex,
          wordCount,
          stepIndex,
        } = vendor;

        if (wordCount <= 10000) {
          const canNextStep = ['tqi'].includes(field)
          if (!canNextStep) return;
        }
        if (wordCount <= 50000) {
          const canNextStep = ['tqi', 'Lqa1'].includes(field)
          if (!canNextStep) return;
        }
        if (wordCount <= 100000) {
          const canNextStep = ['tqi','Lqa1', 'Lqa2'].includes(field)
          if (!canNextStep) return;
        }

        if(field === "done") return;

        this.selectedVendor = vendor;

        this.lqaData = {
          vendor: {
            name: name,
            industries: industry.name,
            sourceLang,
            targetLang,
            step: step.title,
          },
          step,
          steps,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          industry,
          field,mainIndex,
          industryIndex,
          stepIndex,
          assessmentId,
          sourceLangInfo,
          targetLangInfo,
          [`is${field}`]: true,
          // stepIndex: index,
        };
        this.isForm = true;
      },
      async saveVendorLqa({ vendorData }) {
        const {
          file,
          grade,
          sourceLangInfo,
          targetLangInfo,
          sourceLanguage: source,
          targetLanguage: target,
          step,
          steps,
          industry,
          field,
          assessmentId,
          mainIndex,
          industryIndex,
          stepIndex,
        } = vendorData;
        let assessment = {}
        if(field === "tqi") {
          assessment = {
            step: [step],
            target: targetLangInfo,
            industry: [industry],
            source : sourceLangInfo,
            tqi: { fileName: "", path: "", grade },
            lqa1: {},
            lqa2: {},
            lqa3: {},
            isNew: true,
          };
        }else{
          assessment = {
            _id: assessmentId,
            isNew: false,
            step,
            steps,
            source,
            target,
            industry,
            mainIndex,
            industryIndex,
            stepIndex,
            [field.toLowerCase()]: { fileName: "", path: "", grade },
          };
        }

        let formData = new FormData();
        formData.append("vendorId", this.selectedVendor.vendorId);
        formData.append("assessment", JSON.stringify(assessment));
        formData.append("assessmentFile", file);

        try {
          const result = await this.storeAssessment(formData);
          this.alertToggle({
            message: "Assessment saved",
            isShow: true,
            type: "success",
          });
        } catch (err) {
        } finally {
          this.getReport()
          this.$emit("refreshAssessment");
          this.closeForm();
        }
      },
    },
    computed: {
        allVendors() {
          // let financeObj = this.reportData.financeReports;
          // let gamingObj = this.reportData.gamingReports
          // changeObject(financeObj, 'Finance');
          // changeObject(gamingObj, 'IGaming');
          // joinArrays(financeObj);
          // joinArrays(gamingObj);

          return this.reportData;

          function changeObject (obj, industry) {
            for (let key in obj) {
              obj[key].industry = industry;
            }
          }

          function joinArrays (obj) {
            for (let key in obj) {
                    result.push(obj[key])
                }
            }
        },
        filters() {
            let result = {nameFilter: this.nameFilter};
            if(this.industryFilter !== 'All') {
                result.industryFilter = this.industryFilter;
            }
            if(this.tierFilter !== 'All') {
                result.tierFilter = +this.tierFilter;
            }
            if(this.lqaFilter !== 'All') {
                result.lqaFilter = this.lqaFilter;
            }
            return result;
        }
    },
    components: {
        Filters,
        Table,
      VendorLqa
    },
    mounted() {
        this.getReport();
        this.getLanguages();
    }
}
</script>

<style lang="scss" scoped>
.lqa-vendors {
  margin: 40px 40px 40px 20px;
  width: 1100px;
  box-shadow: 0 0 10px rgba(104, 87, 62, .5);
  padding: 20px;
  max-height: 750px;
  overflow-y: auto;
  &__form {
    width: 70%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
