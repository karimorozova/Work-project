<template lang="pug">
    .review
        span.review__close(@click="close") +
        .review__title Delivery Review
        .review__check
            .review__check-item
                Check(@toggleApprovement="(e) => toggle(e, 'areFilesChecked')" 
                    :isApproved="areFilesChecked"
                    text="Download and check file")
            .review__check-item
                Check(@toggleApprovement="(e) => toggle(e, 'areFilesConverted')" 
                    :isApproved="areFilesConverted"
                    text="Make sure to convert all doc files into PDF")
        .review__table
            Table(:tableData="stepFiles")
        .review__options
            Options(
                :isDeliver="isDeliver"
                :isNotify="isNotify"
                @toggleDelivery="(e) => toggle(e, 'isDeliver')"
                @toggleNotify="(e) => toggle(e, 'isNotify')"
            )
        .review__button
            Button(v-if="areFilesChecked && areFilesConverted"
                value="Approve Deliverable"
                @clicked="approve"
            )
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Table from "../review/Table";
import Check from "../review/Check";
import Options from "../review/Options";
const Button = () => import("@/components/Button");

export default {
    data() {
        return {
            stepFiles: [],
            areFilesChecked: false,
            areFilesConverted: false,
            isDeliver: true,
            isNotify: false
        }
    },
    props: {
        task: {type: Object}
    },
    methods: {
        close() {
            this.$emit("close")
        },
        getStepFiles() {
            const { sourceFiles } = this.task;
            this.stepFiles = sourceFiles.reduce((prev, cur) => {
                const fileName = cur.split("/").pop();
                prev.push({
                    fileName,
                    pair: `${this.task.sourceLanguage} >> ${this.task.targetLanguage}`,
                    taskId: this.task.taskId
                })
                return [...prev];
            }, [])
        },
        toggle(e, prop) {
            this[prop] = !this[prop];
        },
        approve() {
            console.log("Approving...")
        }
    },
    computed: {
        ...mapGetters({
            project: "getCurrentProject"
        })
    },
    components: {
        Table,
        Check,
        Options,
        Button
    },
    mounted() {
        this.getStepFiles();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.review {
    display: flex;
    flex-direction: column;
    width: 80%;
    padding: 20px;
    box-sizing: border-box;
    box-shadow: 0 0 10px $brown-shadow;
    background-color: $white;
    position: relative;
    &__title {
        font-size: 22px;
        font-weight: 600;
        display: flex;
        justify-content: center;
    }
    &__close {
        position: absolute;
        top: 0;
        right: 10px;
        transform: rotate(45deg);
        cursor: pointer;
        font-size: 30px;
        font-weight: 600;
    }
    &__check {
        margin: 20px 0;
        padding-bottom: 10px;
        border-bottom: 1px solid $main-color;
    }
    &__check-item {
        &:first-child {
            margin-bottom: 10px;
        }
    }
    &__options {
        margin: 30px 0; 
        display: flex;
        justify-content: center;
    }
    &__button {
        align-self: center;
    }
}

</style>
