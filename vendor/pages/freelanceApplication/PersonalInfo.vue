<template lang="pug">
.personal
    .personal__main-title PERSONAL INFORMAITON
        span.personal__asterisk *
    .personal__info-block
        .personal__item.init-contact
            TextInput(
                label="Name"
                name="name"
                @setValue="setInfoValue"
            )
            TextInput(
                label="Email"
                name="email"
                @setValue="setInfoValue"
            )
        .personal__item.init-contact
            TextInput(
                label="Surname"
                name="surname"
                @setValue="setInfoValue"
            )
            TextInput(
                label="Phone Number"
                name="phone"
                example="example@example.com"
                @setValue="setInfoValue"
            )
    .personal__info-block
        .personal__item
            SelectLanguage(
                label="Mother tongue"
                placeholder="Select"
                :selectedLang="selectedTongue"
                @chooseLang="setMotherTongue"
            )
        .personal__item
            SelectTimezone(
                :timezoneSelected="selectedTimezone"
                @chooseZone="chooseTimezone"
            )
    .personal__label Language pairs:
    .personal__info-block
        LanguagePairs(
            @setLangPair="setLangPair"
        )
    .personal__info-block
        .personal__item
            UploadFileButton(
                label="CV"
                @uploadedFile="uploadCvFile"
            )
        .personal__item
            SelectPosition(
                :selectedPositions="selectedPositions"
                :otherChoice="otherChoice"
                @choosePosition="choosePosition"
            )
    FilesList(v-if="cvFiles.length"
        :files="cvFiles"
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
import Add from "@/components/buttons/Add" ;
import TextInput from "@/components/TextInput";
import FilesList from "@/components/FilesList";

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
        setInfoValue({property, value}) {
            this.$emit("setValue", {property: property, value: value})
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
        Add,
        TextInput,
        FilesList
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
    &__item {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        width: 42%;
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

.personal__info-block {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    position: relative;
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
}

.plus {
    font-size: 28px;
}

</style>
