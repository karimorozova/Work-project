<template lang="pug">
    .review-table
        .review-table__action
            SelectSingle(
                placeholder="Select action"
                :options="actions"
                :selectedOption="selectedAction"
            )
        DataTable(
            :fields="fields"
            :tableData="tableData"
            :bodyClass="['review-body', {'tbody_visible-overflow': tableData.length < 5}]"
            :tableheadRowClass="tableData.length < 5 ? 'tbody_visible-overflow' : ''"
        )
            .review-table__header.review-table__check-cell(slot="headerCheck" slot-scope="{ field }")
                CheckBox(:isChecked="isAllChecked" :isWhite="true" @check="(e)=>toggleAll(e, true)" @uncheck="(e)=>toggleAll(e, false)" customClass="tasks-n-steps")
            .review-table__header(slot="headerName" slot-scope="{ field }") {{ field.label }}
            .review-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
            .review-table__header(slot="headerTask" slot-scope="{ field }") {{ field.label }}
            .review-table__header(slot="headerAction" slot-scope="{ field }") {{ field.label }}
            .review-table__data.review-table__check-cell(slot="check" slot-scope="{ row, index }")
                CheckBox(:isChecked="row.isChecked" @check="(e)=>toggle(e, index, true)" @uncheck="(e)=>toggle(e, index, false)" customClass="tasks-n-steps")
            .review-table__data(slot="name" slot-scope="{ row }")
                img.review-table__file-icon(src="../../../assets/images/file_icon.png")
                span.review-table__file-name {{ row.fileName }}
            .review-table__data(slot="pair" slot-scope="{ row }") {{ row.pair }}
            .review-table__data(slot="task" slot-scope="{ row }") {{ row.taskId }}
            .review-table__data(slot="action" slot-scope="{ row, index }")
                .review-table__icons
                    template(v-for="(icon, key) in allIcons")
                        img.review-table__icon(v-if="key !== 'upload'" :src="icon.src" :class="{'review-table_opacity-04': row.isFileApproved}" @click="makeAction(index, key)")
                        .review-table__upload(v-if="key === 'upload'" :class="{'review-table_opacity-04': row.isFileApproved}")
                            input.review-table__file-input(type="file" :disabled="row.isFileApproved" @change="(e) => uploadFile(e, index)")
                    i.review-table__check-icon.fa.fa-check-circle(:class="{'review-table_green': row.isFileApproved}" @click="approveFile(index)")
        Add
</template>

<script>
import DataTable from "@/components/DataTable";
import SelectSingle from "@/components/SelectSingle";
import CheckBox from "@/components/CheckBox"
import Add from "@/components/Add"

export default {
    props: {
        tableData: {type: Array}
    },
    data() {
        return {
            fields: [
                {label: "", headerKey: "headerCheck", key: "check", width: "4%", padding: 0},
                {label: "File Name", headerKey: "headerName", key: "name", width: "36%", padding: 0},
                {label: "Language pair", headerKey: "headerPair", key: "pair", width: "20%", padding: 0},
                {label: "Task ID", headerKey: "headerTask", key: "task", width: "20%", padding: 0},
                {label: "Action", headerKey: "headerAction", key: "action", width: "20%", padding: 0},
            ],
            icons: {
                download: {src: require("../../../assets/images/Other/Download-icon.png")},
                upload: {src: require("../../../assets/images/Other/upload-icon.png")},
                delete: {src: require("../../../assets/images/Other/delete-icon-qa-form.png")}
            },
            selectedAction: "",
            actions: ["Action 1", "Action 2"]
        }
    },
    methods: {
        approveFile(index) {
            this.$emit('approveFile', { index });
        },
        makeAction(index, key) {
            const file = this.tableData[index];
            if(file.isFileApproved) return;
            if(key === 'download') {
                return this.createLinkAndDownolad(file.path);
            }
        },
        createLinkAndDownolad(href) {
            let link = document.createElement('a');
            link.href = __WEBPACK__API_URL__ + href;
            link.target = "_blank";
            link.click();
        },
        uploadFile(e, index) {
            const file = e.target.files[0];
            this.$emit('uploadFile', {file, index});
            e.target.value = "";
        },
        toggleAll(e, bool) {
            this.$emit("checkAll", {bool});
        },
        toggle(e, index, bool) {
            this.$emit("checkFile", { index, bool });
        }
    },
    computed: {
        allIcons() {
            let result = this.icons;
            if(this.tableData.length > 1) {
                result = {
                    ...result, 
                    delete: {src: require("../../../assets/images/Other/delete-icon-qa-form.png")}};
            }
            return result;
        },
        isAllChecked() {
            return !this.tableData.find(item => !item.isChecked);
        }
    },
    components: {
        DataTable,
        SelectSingle,
        CheckBox,
        Add
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.review-table {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    &__action {
        position: relative;
        width: 191px;
        height: 30px;
        align-self: flex-end;
        margin-bottom: 10px;
    }
    &__data {
        height: 30px;
        box-sizing: border-box;
        padding-left: 5px;
        display: flex;
        align-items: center;
    }
    &__check-cell {
        display: flex;
        justify-content: center;
        padding-left: 0;
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
    &__upload {
        position: relative;
        background: url("../../../assets/images/Other/upload-icon.png");
        background-repeat: no-repeat;
        background-position-y: center;
        width: 20px;
        height: 21px;
        overflow: hidden;
        input[type=file],
        input[type=file]::-webkit-file-upload-button {
            cursor: pointer; 
        }
    } 
    &__file-input {
        padding-left: 0;
        padding-right: 0;
        width: 30px;
        height: 22px;
        border: none;
        outline: none;
        opacity: 0;
        z-index: 2;
        position: absolute;
        left: -5px;
        cursor: pointer;
        font-size: 0;
    }
    &_green {
        color: $green-approve;
    }
    &_opacity-04 {
        opacity: 0.4;
        cursor: default;
        input[type=file],
        input[type=file]::-webkit-file-upload-button {
            cursor: default;
        }
    }
}

</style>
