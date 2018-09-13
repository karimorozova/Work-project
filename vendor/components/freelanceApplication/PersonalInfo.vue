<template lang="pug">
    .personal
        .personal__main-title PERSONAL INFORMAITON
        .row
            .row__item.init-contact
                .personal-initials
                    .personal-initials__label Name:
                    input.personal-initials__input(type="text")
                .personal-initials
                    .personal-initials__label Surname:
                    input.personal-initials__input(type="text")
            .row__item.init-contact
                .personal-contacts
                    .personal-contacts__label Phone Number:
                    input.personal-contacts__input(type="text")
                .personal-contacts
                    .personal-contacts__label Email:
                    input.personal-contacts__input(type="text")
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
        .row.lang-pairs(v-for="(pair, index) in selectedLangPairs")
            .row__item
                SelectLanguage(
                    refersTo="source"
                    :parentIndex="index"
                    placeholder="Select language"
                    :selectedLang="pair.source"
                    @chooseLang="setPairLanguage"
                )
            img.row__image(src="../../assets/images/arrow_open.png")
            .row__item
                SelectLanguage(
                    refersTo="target"
                    :parentIndex="index"
                    placeholder="Select language"
                    :selectedLang="pair.target"
                    @chooseLang="setPairLanguage"
                )
        .row.add-button
            .row__add-pair(@click="addLanguagePair")
                span.plus +
        .row
            .row__item
                UploadFileButton(
                    label="CV"
                    @uploadedFile="uploadCvFile"
                )
            .row__item
                SelectPosition(
                    :selectedPositions="selectedPositions"
                    @choosePosition="addPosition"
                )

</template>

<script>
import SelectLanguage from "./personInfo/SelectLanguage";
import SelectTimezone from "./personInfo/SelectTimezone";
import UploadFileButton from "./personInfo/UploadFileButton";
import SelectPosition from "./personInfo/SelectPosition";


export default {
    data() {
        return {
            selectedTongue: {},
            selectedLangPairs: [{ source: {}, target: {} }],
            selectedTimezone: "",
            cvFiles: [],
            selectedPositions: []
        }
    },
    methods: {
        setMotherTongue({lang}) {
            this.selectedTongue = lang;
        },
        setPairLanguage({lang, index, refersTo}) {
            this.selectedLangPairs[index][refersTo] = lang;
        },
        chooseTimezone({zone}) {
            this.selectedTimezone = zone;
        },
        addLanguagePair() {
            this.selectedLangPairs.push({
                source: {}, target: {}
            })
        },
        uploadCvFile({files}) {
            this.cvFiles = files;
        },
        addPosition({position}) {
            let isExist = false;
            if(this.selectedPositions.indexOf(position) != -1) {
                isExist = true;
            }
            if(isExist) {
                for(let index in this.selectedPositions) {
                    if(this.selectedPositions[index] == position) {
                        this.selectedPositions.splice(index, 1)
                    }
                }
            } else {
                this.selectedPositions.push(position);
            }
        }
    },
    components: {
        SelectLanguage,
        SelectTimezone,
        UploadFileButton,
        SelectPosition
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
    &:after {
        content: "*";
        position: absolute;
        top: -3px;
        right: 240px;
        color: red;
        font-size: 18px;
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
    &__image {
        transform: rotate(-90deg);
        position: absolute;
        top: 20px;
        left: 49%;
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

.lang-pairs{
    margin-bottom: 50px;
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
        width: 204px;
        height: 30px;
        outline: none;
        border: 1px solid #67573E;
        border-radius: 15px;
        color: #67573E;
        box-shadow: 0 3px 8px rgba(103, 87, 62, 0.5);
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
