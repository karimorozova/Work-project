<template lang="pug">
.other
    .other__main-title OTHER
    .other__options
        span.other__label.asterisk Availability:
        SelectSingle(
            :selectedOption="selectedAvailability"
            refersTo="selectedAvailability"
            :options="availabilityOptions"
            @chooseOption="chooseOption"
        )
    span.other__comment Are you willing to take a translation test (300 words)?
    .other__options.test-options
        span.other__label Options:
        SelectSingle(
            :selectedOption="selectedTestAnswer"
            refersTo="selectedTestAnswer"
            :options="testAnswers"
            @chooseOption="chooseOption"
        )
    .other__options.rate-value
        span.other__label Please state your translation rate (Euro)
        input.other__input(type="text")
    .other__options.cover-letter
        span.other__label Cover Letter: (please write or upload it below)
        textarea.other__text-area(rows=4)
    .other__options
        UploadFileButton(
            label="Files"
            @uploadedFile="uploadCvFile"
        )
</template>

<script>
import SelectSingle from "./dropdowns/SelectSingle";
import UploadFileButton from "./buttons/UploadFileButton";

export default {
    data() {
        return {
            selectedAvailability: "",
            selectedTestAnswer: "",
            availabilityOptions: ["Full-time", "Part-time", "Limited"],
            testAnswers: ["Yes", "No"],
            cvFiles: []
        }
    },
    methods: {
        chooseOption({option, refersTo}) {
            this[refersTo] = option;
        },
        uploadCvFile({files}) {
            this.cvFiles = files;
        }
    },
    components: {
        SelectSingle,
        UploadFileButton
    }
}
</script>

<style lang="scss" scoped>
.other {
    width: 100%;
    display: flex;
    flex-direction: column;
    &__main-title {
        font-size: 24px;
        position: relative;
        margin-bottom: 20px;
        &:before {
            content: "6";
            position: absolute;
            left: -20px;
            bottom: -2px;
            font-size: 28px;
        }
    }
    &__options{
        margin-top: 20px;
        margin-bottom: 80px;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    &__comment, &__label {
        font-size: 12px;
    }
    &__comment {
        position: relative;
        &:after {
            content: "*";
            position: absolute;
            top: -2px;
            right: 240px;
            color: red;
            font-size: 12px;
        }
    }
    &__input {
        width: 52%;
        z-index: 0;
        padding: 12px 10px;
        border: 1px solid #66563D;
        border-radius: 15px;
        outline: none;
        box-shadow: 0 3px 8px rgba(103, 87, 62, 0.5);
        &:focus {
            box-shadow: 0 0 15px rgba(103, 87, 62, 0.8);
        }
    }
    &__text-area {
        padding: 10px;
        resize: none;
        border: 1px solid #66563D;
        border-radius: 15px;
        box-shadow: 0 3px 8px rgba(103, 87, 62, 0.5);
        margin-top: 10px;
        outline: none;
        &:focus {
            box-shadow: 0 0 15px rgba(103, 87, 62, 0.8);
        }
    }
    .rate-value {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
    }
    .cover-letter {
        margin-bottom: 20px;
    }
}

.asterisk {
    &:after {
        content: "*";
        position: absolute;
        top: -2px;
        left: 60px;
        color: red;
        font-size: 12px;
    }
}
</style>
