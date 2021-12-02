<template lang="pug">
.other
    .other__main-title OTHER
    .other__options
        span.other__label Availability:
            span.other__asterisk *
        SelectSingle(
            :selectedOption="selectedAvailability"
            :options="availabilityOptions"
            @chooseOption="(e) => chooseOption(e, 'selectedAvailability')"
        )
    span.other__comment Are you willing to take a translation test (300 words)?
        span.other__asterisk *
    .other__options.test-options
        span.other__label Options:
        SelectSingle(
            :selectedOption="testAgree"
            :options="testAnswers"
            @chooseOption="(e) => chooseOption(e, 'testAgree')"
        )
    .other__options.rate-value
        span.other__label Please state your translation rate (Euro)
        input.other__input(type="text" v-model="basicRate" @change="setRate")
        .other__error(v-if="isRateIncorrect") Please enter the correct rate using only numbers "0-9" and a " . "
    .other__options.cover-letter
        .other__letter-text
            span.other__label Cover Letter:
            textarea.other__text-area(rows=4 v-model="coverLetter" @change="setCoverLetter")
        span.other__label and/or
        .other__files
            UploadFileButton(
                label="Cover Letter"
                @uploadedFile="uploadCvFile"
            )
    .other__files-list(v-if="cvFiles.length")
        FilesList(
            :files="cvFiles"
        )
        
</template>

<script>
import SelectSingle from "../../components/dropdowns/SelectSingle";
import UploadFileButton from "../../components/buttons/UploadFileButton";
import FilesList from "@/components/FilesList";

export default {
    data() {
        return {
            selectedAvailability: "",
            testAgree: "",
            availabilityOptions: ["Full-time", "Part-time", "Limited"],
            testAnswers: ["Yes", "No"],
            coverLetter: "",
            cvFiles: [],
            basicRate: "",
        }
    },
    methods: {
        chooseOption({option}, prop) {
            this[prop] = option;
            let property = prop === "testAgree" ? "testAgree": "availability";
            this.$emit("setValue", {property, value: option})
        },
        setCoverLetter() {
            this.$emit("setValue", {property: 'coverLetter', value: this.coverLetter})
        },
        uploadCvFile({files}) {
            this.cvFiles = files;
            this.$emit("uploadCoverLetter", {property: 'coverLetterFiles', files: this.cvFiles});
        },
        setRate() {
            if(!this.isRateIncorrect) {
                this.$emit("setValue", {property: "basicRate", value: this.basicRate})
            }
        }
    },
    computed: {
        isRateIncorrect() {
            let regex = /^[0-9.]+$/;
            return this.basicRate && !regex.test(this.basicRate)
        }
    },
    components: {
        SelectSingle,
        UploadFileButton,
        FilesList
    }
}
</script>

<style lang="scss" scoped>
.other {
    width: 100%;
    display: flex;
    flex-direction: column;
    &__main-title {
        font-size: 20px;
        position: relative;
        margin-bottom: 20px;
        &:before {
            content: "6";
            position: absolute;
            left: -20px;
            bottom: -2px;
            font-size: 22px;
            @media (max-width: 320px) {
                font-size: 24px;
            }
        }
        @media (max-width: 320px) {
            font-size: 20px;
        }
    }
    &__asterisk {
        position: absolute;
        padding-left: 4px;
        top: -2px;
        font-size: 14px;
        color: red;
    }
    &__options{
        margin-top: 20px;
        margin-bottom: 80px;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    &__comment, &__label {
        font-size: 14px;
    }
    &__comment {
        position: relative;
    }
    &__input {
        width: 52%;
        z-index: 0;
        padding: 12px 10px;
        border: 1px solid #66563D;
        color: #66563D;
        border-radius: 4px;
        outline: none;
        &:focus {
          cursor: pointer;
          box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
        }
        @media (max-width: 450px) {
            width: 30%;
        }
    }
    &__text-area {
        padding: 10px;
        resize: none;
        border: 1px solid #66563D;
        border-radius: 4px;
        margin-top: 10px;
        color: #66563D;
        outline: none;
        &:focus {
          cursor: pointer;
          box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
        }
    }
    &__error {
        position: absolute;
        font-size: 14px;
        color: #d66f58;
        top: -19px;
        right: -4px;
        @media (max-width: 450px) {
            font-size: 11px;
        }
    }
    &__letter-text {
        display: flex;
        flex-direction: column;
        width: 60%;
        @media (max-width: 768px) {
            width: 100%;
            margin-bottom: 20px;
        }
    }
    &__files-list {
        margin-bottom: 40px;
        display: flex;
        justify-content: flex-end;

    }
    &__files {
        @media (max-width: 1280px) {
            margin-top: 10px;
        }
    }
    .rate-value {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
    }
    .cover-letter {
        margin-bottom: 40px;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        @media (max-width: 768px) {
            flex-direction: column;
        }
    }
}

.asterisk {
    &:after {
        content: "*";
        position: absolute;
        top: -2px;
        left: 60px;
        color: red;
        font-size: 14px;
    }
}
</style>
