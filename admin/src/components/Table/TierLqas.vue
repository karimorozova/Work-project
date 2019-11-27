<template lang="pug">
.tierlqas
    SettingsTable(
        :fields="fields"
        :tableData="tierlqas"
    )
        .tierlqas__head-title(slot="headerCategory" slot-scope="{ field }") {{ field.label }}
        .tierlqas__head-title(slot="headerLqa1" slot-scope="{ field }") {{ field.label }}
        .tierlqas__head-title(slot="headerLqa2" slot-scope="{ field }") {{ field.label }}
        .tierlqas__head-title(slot="headerLqa3" slot-scope="{ field }") {{ field.label }}
        .tierlqas__data(slot="category" slot-scope="{ row, index }") Tier {{ row.category }}
        .tierlqas__data(slot="lqa1" slot-scope="{ row, index }") {{ row.lqa1 }} words translated
        .tierlqas__data(slot="lqa2" slot-scope="{ row, index }") {{ row.lqa2 }} words translated
        .tierlqas__data(slot="lqa3" slot-scope="{ row, index }") {{ row.lqa3 }} words translated
</template>

<script>
import SettingsTable from "./SettingsTable";
import { mapGetters, mapActions } from "vuex";
import crudIcons from "@/mixins/crudIcons";

export default {
    mixins: [crudIcons],
    data() {
        return {
            fields: [
                {label: "Language Category", headerKey: "headerCategory", key: "category", width: "25%", padding: "0"},
                {label: "LQA 1", headerKey: "headerLqa1", key: "lqa1", width: "25%", padding: "0"},
                {label: "LQA 2", headerKey: "headerLqa2", key: "lqa2", width: "25%", padding: "0"},
                {label: "LQA 3", headerKey: "headerLqa3", key: "lqa3", width: "25%", padding: "0"}
            ],
            tierlqas: []
        }
    },
    methods: {
        async getTierlqas() {
            try {
                const result = await this.$http.get("/api/tier-lqas");
                this.tierlqas = result.body;
            } catch(err) {
                this.alertToggle({message: "Error on getting tier lqas.", isShow: true, type: "error"});
            }
        },
        ...mapActions({
            alertToggle: "alertToggle"
        })
    },
    components: {
        SettingsTable
    },
    mounted() {
        this.getTierlqas();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.tierlqas {
    @extend %setting-table;
    width: 900px;
    &__data, &__editing-data {
        height: 32px;
        padding: 0 5px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
    }
    &__editing-data {
        box-shadow: inset 0 0 7px $brown-shadow;
    }
    &__data-input {
        box-sizing: border-box;
        width: 100%;
        border: none;
        outline: none;
        color: $main-color;
    }
    &__icons {
        padding-top: 3px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    &__icon {
        cursor: pointer;
        opacity: 0.5;
        margin-right: 8px;
    }
    &_opacity {
        opacity: 1;
    }
}
</style>
