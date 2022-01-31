<template lang="pug">
.personal
    .personal__main-title PERSONAL INFORMATION
        span.personal__asterisk *
    .personal__info-block.personal_margin
        .personal__item.personal_contacts-height
            TextInput(
                label="Name"
                name="firstName"
                @setValue="setInfoValue"
            )
            TextInput(
                :label="emailMediaValue.label"
                :name="emailMediaValue.name"
                example="example@example.com"
                @setValue="setInfoValue"
            )
        .personal__item.personal_contacts-height
            TextInput(
                :label="surnameMediaValue.label"
                :name="surnameMediaValue.name"
                @setValue="setInfoValue"
            )
            TextInput(
                label="Phone Number"
                name="phone"
                @setValue="setInfoValue"
            )
    .personal__info-block.personal_height
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
    .personal__info-block.personal_flex-reverse
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
import Add from "@/components/pangea/Add" ;
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
            this.$emit("setValue", {property: 'native', value: lang._id})
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
            this.$emit("setValue", {property: 'positions', value: this.selectedPositions});
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
            this.$emit("setValue", {property: 'positions', value: this.selectedPositions});
            this.$emit("closeOtherChoice", {variable: 'otherPositionVisibile'})
        }
    },
    computed: {
        emailMediaValue() {
            let values = {
                label: "Email",
                name: "email"
            }
            if(process.browser) {
                let body = document.getElementsByTagName("body")[0];
                if(body.offsetWidth <= 450) {
                    values.label = "Surname";
                    values.name = "surname";
                }
            }
            return values;
        },
        surnameMediaValue() {
            let values = {
                label: "Surname",
                name: "surname"
            }
            if(process.browser) {
                let body = document.getElementsByTagName("body")[0];
                if(body.offsetWidth <= 450) {
                    values.label = "Email";
                    values.name = "email";
                }
            }
            return values;
        },
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
        font-size: 14px;
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
        @media (max-width: 450px) {
            justify-content: center;
            width: 100%;
        }
    }
    &_contacts-height {
        height: 160px;
    }
    &_height {
        @media (max-width: 450px) {
            height: 95px;
        }
    }
}

.personal__main-title {
    font-size: 20px;
    position: relative;
    margin-bottom: 20px;
    &:before {
        content: "1";
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

.personal__info-block {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    position: relative;
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
    @media (max-width: 450px) {
        flex-direction: column;
    }
}

.personal_margin {
    @media (max-width: 450px) {
        margin-bottom: 0;
    }
}

.personal_flex-reverse {
    @media (max-width: 450px) {
        flex-direction: column-reverse;
        margin-top: 40px;
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
