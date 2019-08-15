<template lang="pug">
    .duo-table 
        DataTable(
            :fields="fields"
            :tableData="filteredRates"
            bodyClass="tbody_height-150"
        )
            template(slot="headSource" slot-scope="{ field }")
                .duo-table__header {{ field.label }}
            template(slot="headTarget" slot-scope="{ field }")
                .duo-table__header {{ field.label }}
            template(slot="headIndustry" slot-scope="{ field }")
                .duo-table__header {{ field.label }}
            template(slot="headService" slot-scope="{ field }")
                .duo-table__header.duo-table_flex
                    span.duo-table__services-header(v-for="service in field.label") {{ service }}
            template(slot="sourceLanguage" slot-scope="{ row, index }")
                .duo-table__data {{ row.sourceLanguage.lang }}
            template(slot="targetLanguage" slot-scope="{ row, index }")
                .duo-table__data {{ row.targetLanguage.lang }}
            template(slot="industry" slot-scope="{ row, index }")
                .duo-table__data
                    .duo-table__industry-data
                        img.duo-table__image(:src="domain+row.industry.icon")
                        span.duo-table__tooltip {{ row.industry.name }}
            template(slot="services" slot-scope="{ row, index }")
                .duo-table__data
                    span.duo-table__services-rates(v-for="rate of existedRates(row.industry.rates)") 
                        span.duo-table__value(v-if="rate.value") {{ rate.value }} &euro;
                        span.duo-table__value(v-else) - 
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import DataTable from "@/components/Tables/DataTable";

export default {
    props: {
        sourceFilter: {
            type: Array,
            default: () => []
        },
        industriesFilter: {
            type: Array,
            default: () => []
        },
        targetFilter: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            fields: [
                {label: "Source Language", headerKey: "headSource", key: "sourceLanguage", width: "21%", padding: "0"},
                {label: "Target Language", headerKey: "headTarget", key: "targetLanguage", width: "21%", padding: "0"},
                {label: "Industry", headerKey: "headIndustry", key: "industry", width: "13%", padding: "0"},
                {label: ["Translation", "Proofing", "QA and Testing"], headerKey: "headService", key: "services", width: "45%", padding: "0"},
            ],
            rates: [],
            domain: "",
            serviceFilter: ["tr", "pr", "qt"]
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle"
        }),
        async getRates() {
            try {
                // const result = await this.$axios.get(`/vendor/rates?form=Duo&id=${this.vendor._id}`);
                // this.rates = result.data;
            } catch(err) {
                this.alertToggle({message: err.response.data, isShow: true, type: "error"});
            }
        },
        existedRates(rates) {
            let serviceRates = Object.keys(rates).reduce((init, cur) => {
                let service = this.services.find(item => item._id === cur);
                const key = service.symbol;
                if(this.serviceFilter.indexOf(key) !== -1) {
                    init[key] = rates[cur];
                }
                return {...init};
            },{})
            return serviceRates;
        },
        setDefaultServices() {
            let lastIndex = this.fields.length - 1;
            const duoServices = this.services.filter(item => {
                return item.languageForm === "Duo" && this.serviceFilter.indexOf(item.symbol) !== -1
            });
            this.fields[lastIndex].label = duoServices.map(item => item.title);
        }
    },
    computed: {
        ...mapGetters({
            vendor: "getVendor",
            services: "getServices"
        }),
        filteredRates() {
            let result = this.rates;
            if(this.sourceFilter.length && this.sourceFilter[0] !== "All") {
                result = result.filter(item => this.sourceFilter.indexOf(item.sourceLanguage.lang) !== -1);
            }
            if(this.targetFilter.length && this.targetFilter[0] !== "All") {
                result = result.filter(item => this.targetFilter.indexOf(item.targetLanguage.lang) !== -1);
            }
            if(this.industriesFilter.length && this.industriesFilter[0] !== "All") {
                result = result.filter(item => this.industriesFilter.indexOf(item.industry.name) !== -1);
            }
            return result;
        }
    },
    components: {
        DataTable
    },
    mounted() {
        this.getRates();
        this.setDefaultServices();
        this.domain = process.env.domain;
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors.scss";

.duo-table {
    &_flex {
        display: flex;
        justify-content: space-around;
    }
    &__services-header, &__services-rates {
        width: 33%;
        display: flex;
        justify-content: center;
        border-right: 1px solid $white;
        &:last-child {
            border-right: none;
        }
    }
    &__services-rates  {
        border-right: 1px solid $cell-border;
        height: 100%;
        align-items: center;
        padding: 0 5px;
    }
    &__data {
        height: 28px;
        padding: 0 5px; 
        display: flex;
        align-items: center;
        box-sizing: border-box;
    }
    &__industry-data {
        display: flex;
        align-items: center;
        position: relative;
        &:hover {
            .duo-table__tooltip {
                z-index: 1;
                opacity: 1;
            }
        }
    }
    &__image {
        max-width: 20px;
    }
    &__tooltip {
        position: absolute;
        font-size: 10px;
        left: 20px;
        color: $orange;
        z-index: -1;
        opacity: 0;
        transition: all 0.3s;
    }
}

</style>
