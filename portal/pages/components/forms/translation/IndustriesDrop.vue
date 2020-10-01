<template lang="pug">
    .industries-drop
        TitleInput(title="Industry:" :isAsterisk="true")
            .industries-drop__menu
                SelectSingle(
                    :selectedOption="selectedIndustry"
                    :options="industries"
                    customClass="translation-form"
                    @chooseOption="setIndustry"
                )
</template>

<script>
import SelectSingle from "~/components/dropdowns/SelectSingle";
import TitleInput from "../TitleInput";

export default {
    props: {
        industries: { type: Array },
        selectedIndustry: { type: String }
    },
    methods: {
        setIndustry({ option }) {
            this.$emit('setIndustry', { option })
        }
    },
    components: {
        TitleInput,
        SelectSingle
    }
}
</script>

<style lang="scss" scoped>

.industries-drop {
    &__menu {
        position: relative;
        margin-top: 5px;
    }
}

</style>
