<template lang="pug">
    .request-files
        .request-files__table
            DataTable(
                :fields="tableFields"
                :tableData="filesData"
            )
                .request-files__header(slot="headerCheck" slot-scope="{ field }") {{ field.label }}
                .request-files__header(slot="headerName" slot-scope="{ field }") {{ field.label }}
                .request-files__header(slot="headerType" slot-scope="{ field }") {{ field.label }}
                .request-files__header(slot="headerAdded" slot-scope="{ field }") {{ field.label }}
                .request-files__header(slot="headerModified" slot-scope="{ field }") {{ field.label }}
                .request-files__header(slot="headerSize" slot-scope="{ field }") {{ field.label }}
                .request-files__header(slot="headerAction" slot-scope="{ field }") {{ field.label }}
        .request-files__add
            Add
</template>

<script>
import DataTable from "@/components/DataTable";
import Add from "@/components/Add";
import tableFields from "@/mixins/tableFields";

export default {
    mixins: [tableFields],
    data() {
        return {
            filesData: [],
            icons: {
                download: {src: require("../../../assets/images/Other/Download-icon.png")},
                upload: {src: require("../../../assets/images/Other/upload-icon.png")},
                delete: {src: require("../../../assets/images/Other/delete-icon-qa-form.png")}
            },
            tableWidth: 1000
        }
    },
    methods: {
        setTableWidth() {
            const element = document.querySelector(".tasks-data");
            this.tableWidth = element ? element.offsetWidth-2 : 0;
        }
    },
    computed: {
        fields() {
            return [
                {label: "", headerKey: "headerCheck", key: "check", width: Math.floor(this.tableWidth*0.1), padding: 0},
                {label: "File Name", headerKey: "headerName", key: "name", width: Math.floor(this.tableWidth*0.3), padding: 0},
                {label: "Type", headerKey: "headerType", key: "type", width: Math.floor(this.tableWidth*0.1), padding: 0},
                {label: "Added By", headerKey: "headerAdded", key: "added", width: Math.floor(this.tableWidth*0.1), padding: 0},
                {label: "Last Modified", headerKey: "headerModified", key: "modified", width: Math.floor(this.tableWidth*0.1), padding: 0},
                {label: "Size", headerKey: "headerSize", key: "size", width: Math.floor(this.tableWidth*0.1), padding: 0},
                {label: "Action", headerKey: "headerAction", key: "action", width: 0, padding: 0},
            ]
        }
    },
    components: {
        DataTable,
        Add
    },
    mounted() {
        this.setTableWidth();
    }  
}
</script>

<style lang="scss" scoped>

.request-files {
    &__data {
        height: 28px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding-left: 5px;
    }
}

</style>
