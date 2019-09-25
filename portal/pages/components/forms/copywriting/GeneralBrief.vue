<template lang="pug">
    .general-brief
        TitleInput(title="GENERAL BRIEF:")
            .main
                .main__block
                    TextInput(label="Description" :isArea="true" :isInfo="true" @setInputVal="setDescription" :isAsterisk="true" growClass="breif-area"
                        tip="Please give a brief description of the project in as match detail as possible.")
                .main__block
                    TextInput(label="Targeted Audience" :isInfo="true" 
                        tip="What kind of audience will read this article?")
                .main__block
                    TextInput(label="Suggested title")
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

export default {
    methods: {
        setDescription({value}) {
            console.log(value);
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
