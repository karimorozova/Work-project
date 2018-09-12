<template lang="pug">
    .personal-wrap
        .main-title PERSONAL INFORMAITON
        .info-block
            .info-block__item
                .item-initials
                    .item-initials__title Name:
                    input.item-initials__text-field(type="text")
                .item-initials
                    .item-initials__title Surname:
                    input.item-initials__text-field(type="text")
            .info-block__item
                .item-contacts
                    .item-contacts__title Phone Number:
                    input.item-contacts__text-field(type="text")
                .item-contacts
                    .item-contacts__title Email:
                    input.item-contacts__text-field(type="text")
                    span.item-contacts__example example@example.com
        .info-block
            .info-block__item
                NativeLanguageSelect(
                    :selectedLang="selectedTongue"
                    @chooseLang="setMotherTongue"
                )
            .info-block__item
                TimezoneSelect(
                    :timezoneSelected="selectedTimezone"
                    @chooseZone="chooseTimezone"
                )
        .info-block
            .info-block__item
            .info-block__item
</template>

<script>
import NativeLanguageSelect from "./personInfo/NativeLanguageSelect"
import TimezoneSelect from "./personInfo/TimezoneSelect"

export default {
    data() {
        return {
            selectedTongue: {},
            selectedTimezone: ""
        }
    },
    methods: {
        setMotherTongue(data) {
            this.selectedTongue = data.lang;
        },
        chooseTimezone(data) {
            this.selectedTimezone = data.zone;
        }
    },
    components: {
        NativeLanguageSelect,
        TimezoneSelect
    }
}
</script>

<style lang="scss" scoped>

.personal-wrap {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.main-title {
    font-size: 24px;
    position: relative;
    margin-bottom: 20px;
    &::before {
        content: "1";
        position: absolute;
        left: -20px;
        bottom: -2px;
        font-size: 28px;
    }
    &::after {
        content: "*";
        position: absolute;
        top: -3px;
        right: 240px;
        color: red;
        font-size: 18px;
    }
}

.info-block {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    &__item {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 160px;
    }
}

.item-initials, .item-contacts {
    position: relative;
    &__title {
        font-size: 12px;
        margin-bottom: 5px;
    }
    &__text-field {
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

</style>
