<template lang="pug">
.step-files
    StepInfoTitle(title="Files" :isIconReversed="isFilesShown" @titleClick="toggleFilesShow")
    .step-files__table(v-if="isFilesShown")
        DataTable(
            :fields="fields"
            :tableData="stepFiles"
        )
            template(slot="Check" slot-scope="{ field }")
                input.step-files__check(type="checkbox" v-model="isAllChecked")
            template(slot="File Name" slot-scope="{ field }")
                span.step-files__label {{ field.label }}
            template(slot="Category" slot-scope="{ field }")
                span.step-files__label {{ field.label }}
            template(slot="Source" slot-scope="{ field }")
                span.step-files__label {{ field.label }}
            template(slot="Target" slot-scope="{ field }")
                span.step-files__label {{ field.label }}
            template(slot="check" slot-scope="{ row, index }")
                input.step-files__check(type="checkbox" v-model="row.check")
            template(slot="fileName" slot-scope="{ row, index }")
                span.step-files__data {{ row.fileName }}
            template(slot="category" slot-scope="{ row, index }")
                span.step-files__data {{ row.category }}
            template(slot="source" slot-scope="{ row, index }")
                img.step-files__image(src="../../../assets/images/download-big-b.png")
            template(slot="target" slot-scope="{ row, index }")
                img.step-files__image(src="../../../assets/images/download-big-b.png")                            
</template>

<script>
import StepInfoTitle from "./StepInfoTitle";
import DataTable from "../../DataTable";

export default {
    props: {
        stepFiles: {
            type: Array
        }
    },
    data() {
        return {
            isFilesShown: false,
            isAllChecked: false,
            fields: [
                {label: "Check", key: "check", width: "5%"},
                {label: "File Name", key: "fileName", width: "33%"},
                {label: "Category", key: "category", width: "22%"},
                {label: "Source", key: "source", width: "20%", cellClass: "step-files_centered"},
                {label: "Target", key: "target", width: "20%", cellClass: "step-files_centered"},
            ]
        }
    },
    methods: {
        toggleFilesShow() {
            this.isFilesShown = !this.isFilesShown;
        }
    },
    components: {
        StepInfoTitle,
        DataTable
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.step-files {
    box-shadow: 0 0 5px $brown-shadow;
    padding: 10px;
    &__table {
        margin-top: 20px;
    }
    &__image {
        height: 18px;
        width: 18px;
        cursor: pointer;
    }
}

</style>
