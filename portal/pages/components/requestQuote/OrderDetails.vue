<template lang="pug">
    .order-details(:class="{'order-details_block': isDetails}")
        .order-details__title YOUR ORDER
        .order-details__main
            .info-block
                SectionTitle(number="1" text="SERVICE:" customClass="details-titles")
                .info-block__item 
                    span.info-block__text {{ service }}
            .info-block
                SectionTitle(number="2" text="LANGUAGE(S):" customClass="details-titles")
                .info-block__item(v-if="isServiceDuo")
                    span.info-block__label Source:
                    span.info-block__text {{ source }}
                .info-block__item
                    span.info-block__label Target(s):
                    span.info-block__text {{ targetsList }} 
            .info-block
                SectionTitle(number="3" text="INDUSTRY:" customClass="details-titles")
                .info-block__item
                    span.info-block__text {{ industry }}
            .info-block
                SectionTitle(text="SUGGESTED DEADLINE" customClass="details-titles")
                .info-block__item
                    span.info-block__text {{ deadline }}
</template>

<script>
import SectionTitle from "./mainInfo/SectionTitle";
import { mapGetters } from "vuex";
import moment from "moment";

export default {
    props: {
        isDetails: {type: Boolean}
    },
    computed: {
        ...mapGetters({
            requestDetails: "getRequestQuoteDetails"
        }),
        service() {
            return this.requestDetails.service ? this.requestDetails.service.title : "Select";
        },
        isServiceDuo() {
            return this.requestDetails.service ? this.requestDetails.service.languageForm === "Duo" : true;
        },
        source() {
            return this.requestDetails.sourceLanguage ? this.requestDetails.sourceLanguage.lang : "Select";
        },
        targetsList() {
            let result = "Select";
            const { targetLanguages } = this.requestDetails;
            if(targetLanguages && targetLanguages.length) {
                result = targetLanguages.reduce((prev, cur) => {
                    return `${prev}${cur.lang}; `
                }, "")
            }
            return result;
        },
        industry() {
            return this.requestDetails.industry ? this.requestDetails.industry.name : "Select";
        },
        deadline() {
            return this.requestDetails.deadline ? moment(this.requestDetails.deadline).format("DD-MM-YYYY") : "Select date";
        }
    },
    components: {
        SectionTitle
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.order-details {
    padding: 15px 0;
    color: $main-color;
    border: 1px solid $main-color;
    border-radius: 15px;
    width: 250px;
    box-sizing: border-box;
    &__title {
        border-bottom: 1px solid $light-brown;
        text-align: center;
        padding-bottom: 10px;
        font-size: 22px;
    }
    &__main {
        padding: 20px 20px 0 40px;
    }
    @media (max-width: 1024px) {
        display: none;
    }
}

.info-block {
    position: relative;
    margin-bottom: 20px;
    &__num {
        position: absolute;
        left: -20px;
        top: -3px;
        font-size: 24px;
        font-weight: 800;
    }
    &__item {
        margin-top: 10px;
    }
    &__label {
        margin-right: 10px;
    }
    &__text {
        font-size: 14px;
        color: $orange;
    }
}

.order-details_block {
    @media (max-width: 1024px) {
        display: block;
        background-color: $white;
        z-index: 10;
        position: fixed;
        right: 5px;
        top: 70px;
    }
}

</style>