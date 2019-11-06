<template lang="pug">
.tasks-files
    .tasks-files__header
        .tasks-files__header-name Files:
        .tasks-files__header-action-wrapper
            .tasks-files__header-action File Action:
            .filters__drop-menu
                SelectSingle(
                    :selectedOption="fileAction"
                    :options="actions"
                    placeholder="Select"
                    @chooseOption="makeAction"
                )
    .tasks-files__table
        FilesTable(
            :allFiles="allFiles"
            @filterTable="filterTable"
            @toggleFileCheck="toggleFileCheck"
            @checkAll="checkAll"
            @uncheckAll="uncheckAll"
            @addRow="addRow"
            @parseFilesToArray="parseFilesToArray"
        )
    .tasks-files__modal(v-if="isModal")
        ApproveModal(
            text="Are you sure?"
            approveValue="Yes"
            notApproveValue="Cancel"
            @approve="deleteCheckedFiles"
            @notApprove="closeModal"
            @close="closeModal"
        )
</template>

<script>
import FilesTable from "./FilesTable";
import SelectSingle from "@/components/SelectSingle";
import ApproveModal from "@/components/ApproveModal";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            actions: ["Delete", "Download", "Approve"],
            fileAction: "",
            isSourceFilesShow: false,
            isRefFilesShow: false,
            allFiles: [],
            isModal: false
        };
    },
    methods: {
        ...mapActions({
            deleteRequestFiles: "deleteRequestFiles",
            approveRequestFiles: "approveRequestFiles"
        }),
        closeModal() {
            this.isModal = false;
        },
        async makeAction({ option }) {
            const checked = this.allFiles.filter(item => item.isChecked);
            if(!checked.length) return;
            switch(option) {
                case "Delete":
                    this.isModal = true;
                    break;
                case "Download":
                    await this.downloadFiles(checked);
                    break;
                default:
                    await this.approveFiles(checked);
            }
        },
        filterTable() {
            this.allFiles = this.allFiles.filter(item => item.fileName);
        },
        toggleFileCheck({index}) {
            this.allFiles[index].isChecked = !this.allFiles[index].isChecked;
            this.filterTable();
        },
        checkAll() {
            this.allFiles = this.allFiles.map(item => {
                return {...item, isChecked: true}
                });
        },
        uncheckAll() {
            this.allFiles = this.allFiles.map(item => {
                return {...item, isChecked: false}
                });
        },
        addRow() {
            const type = this.currentRequest.service.calculationUnit !== "Words" ? "Reference File" : "";
            this.allFiles.push({
                fileName: "",
                type,
                path: "",
                isApproved: false,
                isChecked: false
            })
            setTimeout( () => {
                this.handleScroll();
            }, 0);
        },
        handleScroll() {
            let element = document.querySelector('.request-files_table');
            element.scrollTop = element.scrollHeight;
        },
        async deleteCheckedFiles() {
            const sourceFiles = this.allFiles.filter(item => item.isChecked && item.type === "Source File");
            const refFiles = this.allFiles.filter(item => item.isChecked && item.type === "Reference File");
            try {
                await this.deleteRequestFiles({id: this.currentRequest._id, sourceFiles, refFiles});
                this.parseFilesToArray();
                this.closeModal();
            } catch(err) { }
        },
        async downloadFiles(checked) {
            for(let file of checked) {
                let link = document.createElement("a");
                link.href = file.path;
                link.target = "_blank";
                link.click();
            }
            this.parseFilesToArray();
        },
        async approveFiles(checked) {
            const approvedFiles = this.getApprovedCheckedFiles();
            const sourceFiles = approvedFiles.filter(item => item.type === "Source File");
            const refFiles = approvedFiles.filter(item => item.type === "Reference File");
            try {
                await this.approveRequestFiles({id: this.currentRequest._id, sourceFiles, refFiles});
                this.parseFilesToArray();
            } catch(err) {

            }
        },
        getApprovedCheckedFiles() {
            return this.allFiles.map(item => {
                if(item.isChecked) {
                    item.isApproved = true;
                }
                return item;
            })
        },
        parseFilesToArray() {
            this.allFiles = [];
            const sourceFiles = this.currentRequest.sourceFiles.map(item => {
                item.type = "Source File";
                item.isChecked = false;
                return item;
            });
            const refFiles = this.currentRequest.refFiles.map(item => {
                    item.type = "Reference File";
                    item.isChecked = false;
                    return item;
                });
            this.allFiles.push(...sourceFiles, ...refFiles);
        }
    },
    computed: {
        ...mapGetters({
            currentRequest: "getCurrentProject"
        })
    },
    components: {
        FilesTable,
        SelectSingle,
        ApproveModal
    },
    mounted() {
        this.parseFilesToArray();
    },
};
</script>

<style lang="scss" scoped>
.tasks-files {
    font-size: 14px;
    position: relative;
    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    }
    &__header-action-wrapper {
        display: flex;
        align-items: center;
    }
    &__header-action {
        margin-right: 15px;
    }
    &__modal {
        position: absolute;
        top: 0;
        left: 15%;
    }
}
</style>
