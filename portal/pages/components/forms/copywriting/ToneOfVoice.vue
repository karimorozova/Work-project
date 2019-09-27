<template lang="pug">
    .copywriting-voice
        TitleInput(title="TONE OF VOICE" :isAsterisk="true")
        .options
            .option(v-for="(tone, index) in tones")
                CheckBox(:isChecked="tone.isChecked" @check="(e) => toggle(e, index, true)" @uncheck="(e) => toggle(e, index, false)")
                .option__name {{ tone.name }}
                    textarea.option__text(v-if="tone.name === 'Other'" @click="(e) => toggle(e, index, true)" @blur="setOther")
</template>

<script>
import TitleInput from "../TitleInput";
import CheckBox from "@/components/CheckBox";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            tones: [
                {name: 'Formal', isChecked: false},
                {name: 'Informal', isChecked: false},
                {name: 'Excited', isChecked: false},
                {name: 'Straightforward', isChecked: false},
                {name: 'Serious', isChecked: false},
                {name: 'Relaxed', isChecked: false},
                {name: 'Persuasive', isChecked: false},
                {name: 'Payful/Funny', isChecked: false},
                {name: 'Other', isChecked: false},
            ]
        }
    },
    methods: {
        ...mapActions(["setOrderDetail"]),
        toggle(e, index, val) {
            this.tones[index].isChecked = val;
            let currentTones = this.orderDetails.tones || [];
            const position = currentTones.indexOf(this.tones[index].name);
            if(val && position === -1) {
                currentTones.push(this.tones[index].name);
            } else {
                currentTones.splice(position, 1);
            }
            this.setOrderDetail({prop: "tones", value: currentTones});
        },
        setOther(e) {
            const { value } = e.target;
            let currentTones = this.orderDetails.tones || [];
            currentTones = currentTones.filter(item => item.indexOf('Other') === -1);
            currentTones.push(`Other: ${value}`);
            this.setOrderDetail({prop: "tones", value: currentTones});
        }
    },
    computed: {
        ...mapGetters({
            orderDetails: "getOrderDetails"
        })
    },
    components: {
        TitleInput,
        CheckBox
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.options {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    max-height: 170px;
}

.option {
    height: 30px;
    width: 35%;
    box-sizing: border-box;
    padding-left: 12px;
    margin-top: 20px;
    display: flex;
    align-items: center;
    color: $main-color;
    font-size: 14px;
    &__name {
        margin: 0 5px;
        display: flex;
        align-items: center;
    }
    &__text {
        resize: none;
        outline: none;
        width: 50%;
        border: 1px solid $main-color;
        border-radius: 8px;
        margin-left: 5px;
        box-sizing: border-box;
        padding: 5px;
    }
}

</style>
