<template lang="pug">
    .copywriting-structure
        TitleInput(title="STRUCTURE TO INCLUDE")
        .list
            .item(v-for="(structure, index) in structures")
                CustomRadio(:isChecked="structure.isChecked" @toggleRadio="toggleStructure(index)")
                .item__name {{ structure.name }}
                img.item__icon(v-if="structure.name !== 'Others'" src="../../../../assets/images/article-icon.png")
                textarea.item__text(v-else @input="setOtherStructures" @click="setOthers")
</template>

<script>
import TitleInput from "../TitleInput";
import CustomRadio from "@/components/CustomRadio";

export default {
    data() {
        return {
            structures: [
                {name: 'Sub-heading', isChecked: true}, 
                {name: 'Only Paragraphs', isChecked: false}, 
                {name: 'Bullet points', isChecked: false},
                {name: 'Others', isChecked: false}
            ]
        }
    },
    methods: {
        toggleStructure(index) {
            this.structures = this.structures.map((item, ind) => {
                item.isChecked = ind === index;
                return item;
            })
        },
        setOtherStructures(e) {
            const { value } = e.target;
            console.log(value);
        },
        setOthers() {
            this.toggleStructure(this.structures.length-1);
        }
    },
    components: {
        TitleInput,
        CustomRadio
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.list {
    display: flex;
    justify-content: space-between;
    color: $main-color;
    box-sizing: border-box;
    padding-left: 12px;
    margin-top: 20px;
}

.item {
    display: flex;
    flex-direction: column;
    align-items: center;
    &__name {
        font-size: 14px;
        margin: 10px 0;
    }
    &__text {
        resize: none;
        outline: none;
        height: 50px;
        padding: 5px;
        box-sizing: border-box;
        border: 1px solid $main-color;
        border-radius: 8px;
    }
}

</style>
