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
</template>

<script>
import UploadFileButton from "@/components/buttons/UploadFileButton";
import { mapActions } from "vuex";

export default {
    methods: {
        ...mapActions([
            "setOrderNestedDetail", 
            "setOrderDetail"
        ]),
        setExamples(e) {
            const { value } = e.target;
            this.setOrderNestedDetail({rootProp: 'genbrief', prop: 'Examples', value});
        },
        setFiles({files}) {
            this.setOrderDetail({prop: 'refFiles', value: files});
        }
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

</style>
