<template lang="pug">
    .copywriting-form
        form.form
            .form__block
                .form__item.name
                    ProjectName
                .form__item.deadline
                    Deadline
            .form__block
                .form__item
                    Language(:languages="clientInfo.targetLanguages")
            .form__block
                .form__item
                    Package
            .form__block(v-if="!isMarketing")
                .form__item
                    Type
            .form__block
                .form__item
                    GeneralBrief(:isMarketing="isMarketing")
            .form__block(v-if="!isMarketing")
                .form__item
                    Structure
            .form__block
                .form__item
                    Style
            .form__block
                .form__item
                    ToneOfVoice
            .form__block(v-if="!isMarketing")
                .form__item
                    Design
            .form__block(v-if="!isMarketing")
                .form__item
                    Seo
            .form__block
                QuoteDecision(:quoteDecision="quoteDecision" @setQuoteDecision="setQuoteDecision")
            .form__submit
                Button(value="Submit" @makeAction="checkErrors")
                p.form__note Please note that all copywriting jobs come with one free round of edits. Rewriting requests come at separate cost.
</template>

<script>
import ProjectName from "../ProjectName";
import Deadline from "../Deadline";
import Language from "./Language";
import Package from "./Package";
import Type from "./Type";
import GeneralBrief from "./GeneralBrief";
import Structure from "./Structure";
import Style from "./Style";
import ToneOfVoice from "./ToneOfVoice";
import Design from "./Design";
import Seo from "./Seo";
import QuoteDecision from "../QuoteDecision";
import Button from "@/components/buttons/Button";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        service: {
          type: Object
        },
        isMarketing: {
          type: Boolean
        },
        clientInfo: {
          type: Object,
        }
    },
    methods: {
        ...mapActions([
            "setOrderDetail"
        ]),
        setQuoteDecision({value}) {
            this.setOrderDetail({prop: 'quoteDecision', value});
        },
        checkErrors() {
            this.$emit('checkErrors');
        }
    },
    computed: {
        ...mapGetters({
            orderDetails: "getOrderDetails"
        }),
        quoteDecision() {
            return this.orderDetails.quoteDecision || "Send";
        }
    },
    components: {
        ProjectName,
        Deadline,
        Language,
        Package,
        Type,
        GeneralBrief,
        Structure,
        Style,
        ToneOfVoice,
        Design,
        Seo,
        QuoteDecision,
        Button
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.form {
    &__block {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        box-sizing: border-box;
        &:last-child {
            margin-bottom: 20px;
        }
    }
    &__item {
        width: 100%;
        box-sizing: border-box;
    }
    .name {
        width: 247px;
    }
    .deadline {
        width: 42%;
    }
    &_centered {
        justify-content: center;
    }
    &__submit {
        text-align: center;
        position: relative;
    }
    &__note {
        position: absolute;
        color: $main-color;
        font-size: 12px;
        width: 120%;
        left: -10%;
        bottom: 100%;
        opacity: 0.8;
    }
}

</style>
