<template lang="pug">
    .mono-table
        RatesTable(
            :fields="tableFields"
            :tableData="fullInfo"
        )
            .mono-table__header(slot="headerCheck" slot-scope="{ field }")
                input.mono-table__check(type="checkbox")
            .mono-table__header(slot="headerLanguage" slot-scope="{ field }") {{ field.label }}
            .mono-table__header(slot="headerPackage" slot-scope="{ field }") {{ field.label }}
            .mono-table__header(slot="headerIndustry" slot-scope="{ field }") {{ field.label }}
            .mono-table__header(slot="headerCopywriting" slot-scope="{ field }") {{ field.label }}
            .mono-table__header(slot="headerIcons" slot-scope="{ field }") {{ field.label }}
            .mono-table__data(slot="check" slot-scope="{ row }")
                input.mono-table__check(type="checkbox")
            .mono-table__data(slot="language" slot-scope="{ row }") {{ row.targetLanguage.lang }}
            .mono-table__data(slot="package" slot-scope="{ row }") {{ row.package }}
            .mono-table__data(slot="industry" slot-scope="{ row }")
                img.mono-table__image(v-for="elem of row.industries" :src="domain + elem.industry.icon")
            .mono-table__data(slot="copywriting" slot-scope="{ row }") {{ row.rates[defaultService._id].value }}
            .mono-table__icons(slot="icons" slot-scope="{ row, index }")
                img.mono-table__icon(v-for="(icon, key) in icons" :src="icon.icon" :class="{'mono-table_opacity': isActive(key, index)}")
</template>

<script>
import RatesTable from './RatesTable';
import crudIcons from '@/mixins/crudIcons';
import { mapGetters } from "vuex";

export default {
    mixins: [crudIcons],
    props: {
        fullInfo: {type: Array}
    },
    data() {
        return {
            fields: [
                {label: "", headerKey: "headerCheck", key: "check", width: 0, padding: "0"},
                {label: "Language", headerKey: "headerLanguage", key: "language", width: 22, padding: "0"},
                {label: "Package", headerKey: "headerPackage", key: "package", width: 16, padding: "0"},
                {label: "Industry", headerKey: "headerIndustry", key: "industry", width: 22, padding: "0"},
                {label: "Copywriting", headerKey: "headerCopywriting", key: "copywriting", width: 22, padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: 15, padding: "0"},
            ],
            tableWidth: 970,
            domain: "localhost:3001",
            defaultService: {},
            defauktServiceSymbol: "co"
        }
    },
    methods: {
        setDefaultService() {
            this.defaultService = this.services.find(item => item.symbol === this.defauktServiceSymbol);
        }
    },
    computed: {
        ...mapGetters({
            services: "getVuexServices"
        }),
        tableFields() {
            let result = this.fields.map(item => {
                item.width = `${Math.round(item.width/100*this.tableWidth)}px`;
                return item;
            });
            const widthWithoutFirst = result.slice(1).reduce((prev, cur) => {
                return prev + +cur.width.split("px")[0];
            }, 0)
            result[0].width = `${this.tableWidth - widthWithoutFirst}px`;
            return result;
        }
    },
    components: {
        RatesTable
    },
    mounted() {
        this.domain = __WEBPACK__API_URL__;
        this.setDefaultService();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";
@import "../../../assets/styles/settingsTable.scss";

.mono-table {
    box-sizing: border-box;
    &__data {
        @extend %table-data;
        height: 34px;
    }
    &__editing-data {
        @extend %table-data;
        height: 34px;
        box-shadow: inset 0 0 7px $brown-shadow;
    }
    &__icons {
        @extend %table-icons;
    }
    &__icon {
        @extend %table-icon;
    }
    &__image {
        width: 18px;
        height: 18px;
        margin-right: 5px;
    }
    &_opacity {
        opacity: 1;
    }
}

</style>
