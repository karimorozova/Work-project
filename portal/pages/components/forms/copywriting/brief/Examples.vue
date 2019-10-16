<template lang="pug">
    .copywriting-examples
        .title Examples
        .main
            .block
                input.block__input(typ="text" placeholder="www.example.com" @input="setExamples")
                .block__text URL
            .block
                UploadFileButton(comment="" @uploadedFile="setFiles")
                .block__text Upload Reference File
        .files-list(v-if="orderDetails.refFiles")
            .files-list__item(v-for="(file, index) in orderDetails.refFiles")
                span.files-list__remove(@click="(e) => deleteFile(e, index)") +
                span.file-list__name {{ file.name }}

</template>

<script>
import UploadFileButton from "@/components/buttons/UploadFileButton";
import { mapActions, mapGetters } from "vuex";

export default {
    methods: {
        ...mapActions([
            "setOrderNestedDetail", 
            "setOrderDetail",
            "removeFile"
        ]),
        setExamples(e) {
            const { value } = e.target;
            this.setOrderNestedDetail({rootProp: 'genbrief', prop: 'Examples', value});
        },
        setFiles({files}) {
            this.setOrderDetail({prop: 'refFiles', value: Array.from(files)});
            const fileInput = document.querySelector(".upload-file__input");
            fileInput.value = "";
        },
        deleteFile(e, index) {
            this.removeFile({prop: 'refFiles', index});
        }
    },
    computed: {
        ...mapGetters({
            orderDetails: "getOrderDetails"
        })
    },
    components: {
        UploadFileButton
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors.scss";

.copywriting-examples {
    margin-top: 30px;
}

.title {
    font-size: 14px;
    margin-bottom: 10px;
}

.main {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.block {
    display: flex;
    flex-direction: column;
    align-items: center;
    &__input {
        box-sizing: border-box;
        width: 180px;
        padding: 10px;
        margin-bottom: 5px;
        border: 1px solid $main-color;
        border-radius: 10px;
        outline: none;
    }
    &__text {
        font-size: 12px;
        opacity: 0.8;
        margin-top: 3px;
    }
    ::-webkit-input-placeholder {
        text-align: center;
    }
}

.files-list {
    margin-top: 10px;
    &__item {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        font-size: 12px;
    }
    &__remove {
        font-size: 18px;
        font-weight: 700;
        transform: rotate(45deg);
        cursor: pointer;
        margin-right: 5px;
    }
}

</style>
