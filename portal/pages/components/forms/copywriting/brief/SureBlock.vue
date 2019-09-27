<template lang="pug">
    .copywriting-sure
        .top
            .top__item
                TextInput(label="Topics to mention or not mention" :isInfo="true" :isAsterisk="true" customClass="long-tip" :isDisabled="isNotSure"
                    @setInputVal="setTopics"
                    tip="What main topics should or should not be discussed in the article? Please be as detailed as possible.")
            .top__item or
            .top__item 
                Button(value="I am not sure" @makeAction="toggleOption" :buttonClass="isNotSure ? 'white-back': ''")
        .bottom(v-if="isNotSure")
            .bottom__title If you are unsure of what points the article should cover, please select one of the following:
                span.bottom__asterisk *
            .bottom__options
                .bottom__option(:class="{'bottom_shadow': isFreedom}"  @click="toggleFreedom('isFreedom', 'isOutline')")
                    .bottom__radio
                        CustomRadio(:isChecked="isFreedom" @toggleRadio="toggleFreedom('isFreedom', 'isOutline')")
                    .bottom__text Give the copywriter freedom
                .bottom__option(:class="{'bottom_shadow': isOutline}" @click="toggleFreedom('isOutline', 'isFreedom')")
                    .bottom__radio
                        CustomRadio(:isChecked="isOutline" @toggleRadio="toggleFreedom('isOutline', 'isFreedom')")
                    .bottom__text Request an outline from the copywriter
</template>

<script>
import TextInput from "./TextInput";
import Button from "@/components/buttons/Button";
import CustomRadio from "@/components/CustomRadio";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            isNotSure: false,
            isFreedom: true,
            isOutline: false
        }
    },
    methods: {
        ...mapActions(["setOrderNestedDetail"]),
        setTopics({value}) {
            this.setOrderNestedDetail({rootProp: 'genbrief', prop: 'Topics', value});
        },
        toggleOption() {
            this.isNotSure = !this.isNotSure;
            this.setOrderNestedDetail({rootProp: 'genbrief', prop: 'isNotSure', value: this.isNotSure});
            if(this.isNotSure) {
                this.setOrderNestedDetail({rootProp: 'genbrief', prop: 'isFreedom', value: this.isFreedom});
            }
        },
        toggleFreedom(trueProp, falseProp) {
            this[trueProp] = true;
            this[falseProp] = false;
            this.setOrderNestedDetail({rootProp: 'genbrief', prop: 'isFreedom', value: this.isFreedom});
            this.setOrderNestedDetail({rootProp: 'genbrief', prop: 'isOutline', value: this.isOutline});
        }
    },
    components: {
        TextInput,
        Button,
        CustomRadio
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors.scss";

%flexed {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.top {
    @extend %flexed;
    margin-bottom: 20px;
    &__item {
        &:first-child {
            width: 55%;
            overflow: visible;
        }
        &:nth-of-type(2) {
            padding-bottom: 5px;
        }
    }
}

.bottom {
    &__title {
        font-size: 14px;
    }
    &__asterisk {
        font-size: 16px;
        color: red;
    }
    &__options {
        @extend %flexed;
        margin-top: 5px;
    }
    &__option {
        font-size: 14px;
        border: 1px solid $main-color;
        padding: 20px;
        box-sizing: border-box;
        height: 100px;
        width: 45%;
        transition: all 0.2s;
        cursor: pointer;
    }
    &__radio {
        @extend %flexed;
        justify-content: center;
    }
    &__text {
        text-align: center;
        margin-top: 20px;
    }
    &_shadow {
        box-shadow: 0 0 10px $brown-shadow;
    }
}

</style>
