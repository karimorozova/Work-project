<template lang="pug">
    .mono-table 
        DataTable(
            :fields="fields"
            :tableData="filteredRates"
            bodyClass="tbody_height-150"
        )
            template(slot="headLanguage" slot-scope="{ field }")
                .mono-table__header {{ field.label }}
            template(slot="headPackage" slot-scope="{ field }")
                .mono-table__header {{ field.label }}
            template(slot="headIndustry" slot-scope="{ field }")
                .mono-table__header {{ field.label }}
            template(slot="headService" slot-scope="{ field }")
                .mono-table__header.mono-table_flex
                    span.mono-table__services-header(v-for="service in field.label") {{ service }}
            template(slot="language" slot-scope="{ row, index }")
                .mono-table__data {{ row.targetLanguage.lang }}
            template(slot="package" slot-scope="{ row, index }")
                .mono-table__data {{ row.package }}
            template(slot="industry" slot-scope="{ row, index }")
                .mono-table__data
                    .mono-table__industry-data
                        img.mono-table__image(:src="domain+row.industry.icon")
                        span.mono-table__tooltip {{ row.industry.name }}
            template(slot="services" slot-scope="{ row, index }")
                .mono-table__data
                    span.mono-table__services-rates(v-for="rate of row.industry.rates") 
                        span.mono-table__value(v-if="rate.value") {{ rate.value }} &euro;
                        span.mono-table__value(v-else) - 
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import DataTable from "@/components/Tables/DataTable";

export default {
    props: {
        langFilter: {
            type: Array,
            default: () => []
        },
        industriesFilter: {
            type: Array,
            default: () => []
        },
        packagesFilter: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            fields: [
                {label: "Language", headerKey: "headLanguage", key: "language", width: "21%", padding: "0"},
                {label: "Package", headerKey: "headPackage", key: "package", width: "21%", padding: "0"},
                {label: "Industry", headerKey: "headIndustry", key: "industry", width: "13%", padding: "0"},
                {label: ["Copywriting", "Blogging", "Seo Writing"], headerKey: "headService", key: "services", width: "45%", padding: "0"},
            ],
            rates: [],
            domain: ""
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle"
        }),
        async getRates() {
            try {
                // const result = await this.$axios.get(`/vendor/rates?form=Mono&id=${this.vendor._id}`);
                // this.rates = result.data;
            } catch(err) {
                this.alertToggle({message: err.response.data, isShow: true, type: "error"});
            }
        },
        setDefaultServices() {
            let lastIndex = this.fields.length - 1;
            const monoServices = this.services.filter(item => item.languageForm === "Mono");
            this.fields[lastIndex].label = monoServices.map(item => item.title);
        }
    },
    computed: {
        ...mapGetters({
            vendor: "getVendor",
            services: "getServices"
        }),
        filteredRates() {
            let result = this.rates;
            if(this.langFilter.length && this.langFilter[0] !== "All") {
                result = result.filter(item => this.langFilter.indexOf(item.targetLanguage.lang) !== -1);
            }
            if(this.industriesFilter.length && this.industriesFilter[0] !== "All") {
                result = result.filter(item => this.industriesFilter.indexOf(item.industry.name) !== -1);
            }
            if(this.packagesFilter.length && this.packagesFilter[0] !== "All") {
                result = result.filter(item => this.packagesFilter.indexOf(item.package) !== -1);
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

.mono-table {
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
            .mono-table__tooltip {
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
