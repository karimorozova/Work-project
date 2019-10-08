<template lang="pug">
    .request-files(v-click-outside="cancel")
        .files-table
            DataTable(
                :fields="fields"
                :tableData="allFiles"
                :hasScroll="hasScroll"
                :bodyClass="['request-files_table', {'tbody_visible-overflow': allFiles.length < 4}]"
                :tableheadRowClass="allFiles.length < 4 ? 'tbody_visible-overflow' : ''"
                )
                template(slot="headerFile" slot-scope="{ field }")
                    .files-table__checkbox
                        CheckBox(:isChecked="!isAnyUnchecked" :isWhite="true" @check="checkAll" @uncheck="uncheckAll")
                template(slot="headerFileName" slot-scope="{ field }")
                    .files-table__label {{ field.label }}
                template(slot="headerType" slot-scope="{ field }")
                    .files-table__label {{ field.label }}
                template(slot="headerActions" slot-scope="{ field }")
                    .files-table__label {{ field.label }}
                template(slot="fileId" slot-scope="{ row, index }")
                    .files-table__checkbox.files-table_height-100
                        CheckBox(:isChecked="row.isChecked" @check="(e) => toggleFileCheck(e, index)" @uncheck="(e) => toggleFileCheck(e, index)")
                template(slot="fileName" slot-scope="{ row, index }")
                    .files-table__data.files-table_relative
                        img(src="../../../assets/images/file_icon.png" v-if="row.fileName")
                        span.files-table__name {{ row.fileName }}
                            span.files-table__full-name {{ row.fileName }}
                template(slot="type" slot-scope="{ row, index }")
                    .files-table__data(v-if="row.fileName") {{ row.type }}
                    .files-table__drop(v-else :class="{'files-table_red-shadow': !row.type}")
                        SelectSingle(
                            :isTableDropMenu="true"
                            :options="types" 
                            :selectedOption="row.type" 
                            @scrollDrop="scrollDrop"
                            @chooseOption="(e) => setType(e, index)")
                template(slot="actions" slot-scope="{ row, index }")
                    .files-table__icons
                        a.files-table__link(:href="getHref(row)" v-if="row.path")
                            img.files-table__icon(:src="icons.download")
                        .files-table__upload(v-if="row.type")
                            input.upload(type="file" @change="(e) => uploadFile(e, index)")
                        img.files-table__icon(@click.stop="deleteFile(index)" :src="icons.delete" v-if="row.fileName")
                        i.files-table__check-icon.fa.fa-check-circle(v-if="row.fileName" :class="{'files-table_green': row.isApproved}" @click="toggleApprovement(index)")
                        img.files-table__icon(v-else @click="cancel" :src="icons.cancel")
        Add(@add="addRow")
</template>

<script>
import DataTable from "@/components/DataTable";
import SelectSingle from "@/components/SelectSingle";
import CheckBox from "@/components/CheckBox";
import Add from "@/components/Add";
import { mapGetters, mapActions } from "vuex";
import ClickOutside from "vue-click-outside";
import scrollDrop from "@/mixins/scrollDrop";

export default {
    mixins: [scrollDrop],
    props: {
        allFiles: {type: Array}
    },
    data() {
        return {
            fields: [
                {label: "", headerKey: "headerFile", key: "fileId", width: "8%", padding: 0},
                {label: "File Name", headerKey: "headerFileName", key: "fileName", width: "40%", padding: 0},
                {label: "Type", headerKey: "headerType", key: "type", width: "25%", padding: 0},
                {label: "", headerKey: "headerActions", key: "actions", width: "27%", padding: 0},
            ],
            icons: {
                download: require('../../../assets/images/Other/Download-icon.png'),
                delete: require('../../../assets/images/Other/delete-icon-qa-form.png'),
                cancel: require("../../../assets/images/cancel-icon.png"),
            },
            types: ["Source File", "Reference File"]
        }
    },
    methods: {
        ...mapActions({
            addFileToRequest: "addFileToRequest",
            removeRequestFile: "removeRequestFile",
            toggleFileApprovement: "toggleRequestFileApprovement"
        }),
        isScrollDrop(drop, elem) {
            return drop && elem.clientHeight >= 130;
        },
        getHref(file) {
            return __WEBPACK__API_URL__ + file.path;
        },
        cancel() {
            this.$emit("filterTable");
        },
        setType({option}, index) {
            this.allFiles[index].type = option;
        },
        isTheSameName(fileName) {
            return this.allFiles.find(item => item.fileName === fileName);
        },
        async uploadFile(e, index) {
            if(this.isTheSameName(e.target.files[0].name)) return;
            e.target.files;
            let formData = new FormData();
            formData.append("oldFile", JSON.stringify(this.allFiles[index]));
            formData.append("id", this.currentRequest._id);
            formData.append("newFile", e.target.files[0]);
            try {
                await this.addFileToRequest(formData);
                this.$emit("parseFilesToArray");
            } catch(err) { }
        },
        async deleteFile(index) {
            this.cancel();
            const id = this.currentRequest._id;
            const { path, type } = this.allFiles[index];
            const prop = type === 'Source File' ? "sourceFiles" : "refFiles";
            try {
                await this.removeRequestFile({id, path, prop});
                this.$emit("parseFilesToArray");
            } catch(err) { }
        },
        async toggleApprovement(index) {
            this.cancel();
            const isApproved = !this.allFiles[index].isApproved;
            const file = {...this.allFiles[index], isApproved}
            const prop = this.allFiles[index].type === 'Source File' ? "sourceFiles" : "refFiles";
            const id = this.currentRequest._id;
            try {
                await this.toggleFileApprovement({id, file, prop});
                this.$emit("parseFilesToArray");
            } catch(err) { }
        },
        addRow() {
            if(this.isNewEmptyRow) return;
            this.$emit("addRow");
        },
        checkAll() {
            this.$emit("checkAll");
        },
        uncheckAll() {
            this.$emit("uncheckAll");
        },
        toggleFileCheck(e, index) {
            this.$emit("toggleFileCheck", { index });
        },
    },
    computed: {
        ...mapGetters({
            currentRequest: 'getCurrentProject',
        }),
        hasScroll() {
            return document.body.offsetWidth > 1024 && this.allFiles.length > 3;
        },
        isNewEmptyRow() {
            return this.allFiles.find(item => !item.fileName);
        },
        isAnyUnchecked() {
            return this.allFiles.find(item => !item.isChecked);
        }
    },
    components: {
        DataTable,
        SelectSingle,
        CheckBox,
        Add
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.files-table {

    &__data, &__icons {
        height: 32px;
        box-sizing: border-box;
        padding: 0 5px;
        display: flex;
        align-items: center;
    }

    &__drop {
        position: relative;
        height: 32px;
    }
    &__icons {
        justify-content: space-around;
        width: 90%;
    }

    &__file-icon {
        margin-right: 5px;
    }

    &__name {
        &:hover {
            position: relative;

            .files-table__full-name {
                display: block;
                z-index: 5;
            }
        }
    }

    &__full-name {
        position: absolute;
        background-color: $white;
        padding: 3px;
        display: none;
        max-width: 400px;
        top: -3px;
        left: 0;
        z-index: -1
    }

    &__checkbox {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    &__check-input {
        width: 18px;
        height: 18px;
    }

    &__label {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    &__check-icon {
        font-size: 16px;
        color: $light-brown;
        cursor: pointer;
    }

    &_height-100 {
        height: 100%;
    }

    &_green {
        color: $green-approve;
    }

    &__link {
        height: 16px;
    }

    &__upload {
        position: relative;
        background: url("../../../assets/images/Other/upload-icon.png");
        background-repeat: no-repeat;
        width: 16px;
        height: 18px;
        overflow: hidden;

        .upload {
            padding-left: 0;
            padding-right: 0;
            width: 20px;
            height: 20px;
            border: none;
            outline: none;
            opacity: 0;
            z-index: 2;
            position: absolute;
            cursor: pointer;
            font-size: 0;
        }
    }
    &_red-shadow {
        box-shadow: 0 0 5px $red;
    }
}

</style>
