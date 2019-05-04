<template lang="pug">
    .review-table
        DataTable(
            :fields="fields"
            :tableData="tableData"
            bodyClass="review-body"
        )
            .review-table__header(slot="headerName" slot-scope="{ field }") {{ field.label }}
            .review-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
            .review-table__header(slot="headerTask" slot-scope="{ field }") {{ field.label }}
            .review-table__header(slot="headerAction" slot-scope="{ field }") {{ field.label }}
            .review-table__data(slot="name" slot-scope="{ row }")
                img.review-table__file-icon(src="../../../assets/images/file_icon.png")
                span.review-table__file-name {{ row.fileName }}
            .review-table__data(slot="pair" slot-scope="{ row }") {{ row.pair }}
            .review-table__data(slot="task" slot-scope="{ row }") {{ row.taskId }}
            .review-table__data(slot="action" slot-scope="{ row, index }")
                .review-table__icons
                    img.review-table__icon(v-for="(icon, key) in icons" :src="icon.src" :class="{'review-table_opacity-04': row.isFileApproved}" @click="makeAction(index, key)")
                    i.review-table__check-icon.fa.fa-check-circle(:class="{'review-table_green': row.isFileApproved}" @click="approveFile(index)")
</template>

<script>
import DataTable from "@/components/DataTable";

export default {
    props: {
        tableData: {type: Array}
    },
    data() {
        return {
            fields: [
                {label: "File Name", headerKey: "headerName", key: "name", width: "40%", padding: 0},
                {label: "Language pair", headerKey: "headerPair", key: "pair", width: "20%", padding: 0},
                {label: "Task ID", headerKey: "headerTask", key: "task", width: "20%", padding: 0},
                {label: "Action", headerKey: "headerAction", key: "action", width: "20%", padding: 0},
            ],
            icons: {
                download: {src: require("../../../assets/images/Other/Download-icon.png")},
                upload: {src: require("../../../assets/images/Other/upload-icon.png")},
                delete: {src: require("../../../assets/images/Other/delete-icon-qa-form.png")}
            }
        }
    },
    methods: {
        approveFile(index) {
            this.$emit('approveFile', { index });
        },
        makeAction(index, key) {
            this.$emit('makeAction', { index, key })
        }
    },
    components: {
        DataTable
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.review-table {
    width: 100%;
    box-sizing: border-box;
    &__data {
        height: 30px;
        box-sizing: border-box;
        padding-left: 5px;
        display: flex;
        align-items: center;
    }
    &__icons {
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    &__icon {
        cursor: pointer;
    }
    &__check-icon {
        font-size: 20px;
        color: $light-brown;
        cursor: pointer;
    }
    &__file-icon {
        margin-right: 5px;
    }
    &_green {
        color: $green-approve;
    }
    &_opacity-04 {
        opacity: 0.4;
        cursor: default;
    }
}

</style>
