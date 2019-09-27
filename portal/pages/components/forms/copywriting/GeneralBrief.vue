<template lang="pug">
    .general-brief
        TitleInput(title="GENERAL BRIEF:")
            .main
                .main__block
                    TextInput(label="Description" :isArea="true" :isInfo="true" @setTextareaVal="(e) => setValue(e, 'Description')" :isAsterisk="true" growClass="breif-area"
                        tip="Please give a brief description of the project in as match detail as possible.")
                .main__block
                    TextInput(label="Targeted Audience" :isInfo="true" @setInputVal="(e) => setValue(e, 'Targeted Audience')"
                        tip="What kind of audience will read this article?")
                .main__block
                    TextInput(label="Suggested title" @setInputVal="(e) => setValue(e, 'Suggested title')")
                .main__block
                    SureBlock
                .main__block
                    Examples
</template>

<script>
import TitleInput from "../TitleInput";
import TextInput from "./brief/TextInput";
import SureBlock from "./brief/SureBlock";
import Examples from "./brief/Examples";
import { mapActions } from "vuex";

export default {
    methods: {
        ...mapActions(["setOrderNestedDetail"]),
        setValue({value}, prop) {
            this.setOrderNestedDetail({rootProp: 'genbrief', prop, value});
        }
    },
    components: {
        TitleInput,
        TextInput,
        SureBlock,
        Examples
    }
}
</script>

<style lang="scss" scoped>

.main {
    margin-top: 10px;
    padding-left: 12px;
    box-sizing: border-box;
    &__block {
        margin-top: 20px; 
    }
}

</style>
