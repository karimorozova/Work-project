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
                    Language
            .form__block
                .form__item
                    Package
            .form__block
                .form__item
                    Type
            .form__block
                .form__item
                    GeneralBrief
            .form__block
                .form__item
                    Structure
            .form__block
                .form__item
                    Style
            .form__block
                .form__item
                    ToneOfVoice
            .form__block
                .form__item
                    Design
            .form__block
                .form__item
                    Seo
            .form__block
                QuoteDecision(:quoteDecision="quoteDecision" @setQuoteDecision="setQuoteDecision")
            .form__submit
                Button(value="Submit" @makeAction="checkErrors")
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
        service: {type: Object}
    },
    methods: {
        ...mapActions([
            "setOrderDetails",
            "setOrderDetail",
            "alertToggle",
            "submitForm"
        ]),
        setQuoteDecision({value}) {
            this.setOrderDetail({prop: 'quoteDecision', value});
        },
        async checkErrors() {
            let errors = [];
            if(!this.orderDetails.projectName) errors.push('Enter Project name');
            if(!this.orderDetails.deadline) errors.push('Set Suggested deadline');
            if(!this.orderDetails.targets || !this.orderDetails.targets.length) errors.push('Select Target language(s)');
            if(!this.orderDetails.genbrief.Description) errors.push('Fill the Description field');
            if(!this.orderDetails.genbrief.isNotSure && !this.orderDetails.genbrief.Topics) errors.push('Enter Topics');
            if(!this.orderDetails.tones || !this.orderDetails.tones.length) errors.push('Select Tone of Voice');
            if(errors.length) {
                return this.$emit('showErrors', { errors });
            }
            try {
                await this.submitForm({service: this.service});
            } catch(err) { }
        }
    },
    computed: {
        ...mapGetters({
            services: "getAllServices",
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
    }
}

</style>
