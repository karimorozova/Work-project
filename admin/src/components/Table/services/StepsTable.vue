<template lang="pug">
    .steps
        .steps__table
</template>

<script>
import SettingsTable from "../SettingsTable";
import Add from "@/components/Add";
import tableFields from "@/mixins/tableFields";
import crudIcons from "@/mixins/crudIcons";
import { mapGetters } from "vuex";

export default {
    mixins: [tableFields, crudIcons],
    data() {
        return {
            fields: [
                {label: "Title", headerKey: "headerTitle", key: "title", width: Math.floor(700*0.24), padding: "0"},
                {label: "Stage 1", headerKey: "headerStage1", key: "stage1", width: Math.floor(700*0.12), padding: "0"},
                {label: "Stage 2", headerKey: "headerStage2", key: "stage2", width: Math.floor(700*0.12), padding: "0"},
                {label: "Editor", headerKey: "headerEditor", key: "editor", width: Math.floor(700*0.12), padding: "0"},
                {label: "Active", headerKey: "headerActive", key: "active", width: Math.floor(700*0.12), padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: 0, padding: "0"},
            ],
        }
    },
    methods: {

    },
    computed: {
        ...mapGetters({
            vuexSteps: "getVuexSteps"
        })
    },
    components: {
        SettingsTable,
        Add
    }
}
</script>

<style lang="scss" scoped>

</style>
