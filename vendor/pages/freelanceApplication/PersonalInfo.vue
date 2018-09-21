<template lang="pug">
.personal
    .personal__main-title PERSONAL INFORMAITON
        span.personal__asterisk *
    .row
        .row__item.init-contact
            .personal-initials
                .personal-initials__label Name:
                input.personal-initials__input(type="text" name="name" @change="setInfoValue")
            .personal-initials
                .personal-initials__label Email:
                input.personal-initials__input(type="text" name="email" @change="setInfoValue")
        .row__item.init-contact
            .personal-contacts
                .personal-contacts__label Surname:
                input.personal-contacts__input(type="text" name="surname" @change="setInfoValue")
            .personal-contacts
                .personal-contacts__label Phone Number:
                input.personal-contacts__input(type="text" name="phone" @change="setInfoValue")
                span.personal-contacts__example example@example.com
    .row
        .row__item
            SelectLanguage(
                label="Mother tongue"
                placeholder="Select"
                :selectedLang="selectedTongue"
                @chooseLang="setMotherTongue"
            )
        .row__item
            SelectTimezone(
                :timezoneSelected="selectedTimezone"
                @chooseZone="chooseTimezone"
            )
    .personal__label Language pairs:
    .row
        LanguagePairs(
            @setLangPair="setLangPair"
        )
    .row
        .row__item
            UploadFileButton(
                label="CV"
                @uploadedFile="uploadCvFile"
            )
        .row__item
            SelectPosition(
                :selectedPositions="selectedPositions"
                :otherChoice="otherChoice"
                @choosePosition="choosePosition"
            )
    OtherChoice(
        v-if="otherChoiceVisibile"
        :label="otherChoicelabel"
        @cancelChanges="cancelOtherChoice"
        @saveChanges="saveOtherChoice"
    )
</template>

<script>
import LanguagePairs from "./personInfo/LanguagePairs";
import SelectLanguage from "./personInfo/SelectLanguage";
import SelectTimezone from "./personInfo/SelectTimezone";
import UploadFileButton from "../../components/buttons/UploadFileButton";
import SelectPosition from "./personInfo/SelectPosition";
import OtherChoice from "./OtherChoice";
import Add from "@/components/buttons/Add" 

export default {
    props: {
        otherChoiceVisibile: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            selectedTongue: {},
            selectedLangPairs: [{ source: {}, target: {} }],
            selectedTimezone: "",
            cvFiles: [],
            selectedPositions: [],
            otherChoice: "",
            otherChoicelabel: "",
        }
    },
    methods: {
        setMotherTongue({lang}) {
            this.selectedTongue = lang;
            this.$emit("setValue", {property: 'motherTongue', value: lang._id})
        },
        setLangPair({langPairs}) {
            this.$emit("setLangPair", {langPairs: langPairs});
        },
        chooseTimezone({zone}) {
            this.selectedTimezone = zone;
            this.$emit("setValue", {property: 'timezone', value: zone})
        },
        uploadCvFile({files}) {
            this.cvFiles = files;
            this.$emit("uploadCvFiles", {property: 'cvFiles', files: this.cvFiles})
        },
        choosePosition({position}) {
            if(position === "Other") {
                if(this.selectedPositions.indexOf(this.otherChoice) === -1) {
                    this.otherChoicelabel = "Please specify position title";
                    this.$emit("showOtherChoice", {variable: 'otherPositionVisibile'})
                } else {
                    const pos = this.selectedPositions.indexOf(this.otherChoice);
                    this.selectedPositions.splice(pos, 1);
                    this.otherChoice = "";
                }
                return
            }
            const elementPosition = this.selectedPositions.indexOf(position);
            if(elementPosition === -1){
                this.selectedPositions.push(position);
            } else {
                this.selectedPositions.splice(elementPosition, 1);
            }
            this.$emit("setValue", {property: 'position', value: this.selectedPositions});
        },
        setInfoValue({target: {value, name}}) {
            this.$emit("setValue", {property: name, value: value})
        },
        cancelOtherChoice() {
            this.$emit("closeOtherChoice", {variable: 'otherPositionVisibile'})
        },
        saveOtherChoice({referTo, choice}) {
            this.otherChoice = "Other - " + choice;
            this.selectedPositions.push(this.otherChoice);
            this.$emit("setValue", {property: 'position', value: this.selectedPositions});
            this.$emit("closeOtherChoice", {variable: 'otherPositionVisibile'})
        }
    },
    components: {
        LanguagePairs,
        SelectLanguage,
        SelectTimezone,
        UploadFileButton,
        SelectPosition,
        OtherChoice,
        Add
    }
}
</script>

<style lang="scss" scoped>

.personal {
    display: flex;
    flex-direction: column;
    width: 100%;
    &__label {
        font-size: 12px;
        margin-top: 40px;
    }
    &__asterisk {
        position: absolute;
        padding-left: 6px;
        top: -2px;
        font-size: 16px;
        color: red;
    }
}

.personal__main-title {
    font-size: 24px;
    position: relative;
    margin-bottom: 20px;
    &:before {
        content: "1";
        position: absolute;
        left: -20px;
        bottom: -2px;
        font-size: 28px;
    }
}

.row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    position: relative;
    &__item {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        width: 42%;
    }
    .init-contact {
        height: 160px;
    }
    &__add-pair {
        margin-top: 10px;
        border: 1px solid #66563D;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.8;
        cursor: pointer;
    }
}
.add-button {
    margin-bottom: 20px;
}

.personal-initials, .personal-contacts {
    position: relative;
    &__label {
        font-size: 12px;
        margin-bottom: 5px;
    }
    &__input {
        padding: 5px;
        width: 258px;
        height: 30px;
        outline: none;
        border: 1px solid #67573E;
        border-radius: 15px;
        color: #67573E;
        box-shadow: 0 3px 8px rgba(103, 87, 62, 0.5);
        &:focus {
            box-shadow: 0 0 15px rgba(103, 87, 62, 0.8);
        }
    }
    &__example {
        position: absolute;
        left: 0;
        bottom: -24px;
        font-size: 12px;
        opacity: 0.5;;
    }
}

.plus {
    font-size: 28px;
}

</style>
