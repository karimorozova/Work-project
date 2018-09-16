<template lang="pug">
.other-choice
    span.other-choice__label {{ label }}:
    input.other-choice__input(type="text" v-model="inputText")
    .other-choice__buttons
        Button(
            value="Cancel"
            @makeAction="cancelChanges"
        )
        Button(
            value="Save"
            @makeAction="saveChanges"
        )
</template>

<script>
import Button from "../../components/buttons/Button"

export default {
    props: {
        label: {
            type: String
        }
    },
    data() {
        return {
            inputText: ""
        }
    },
    methods: {
        cancelChanges({value}) {
            this.$emit("cancelChanges")
        },
        saveChanges({value}) {
            this.$emit("saveChanges", {choice: this.inputText})
        }
    },
    components: {
        Button
    }
}
</script>

<style lang="scss" scoped>

.other-choice {
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid #66563D;
    border-radius: 20px;
    width: 331px;
    padding: 30px 0 20px;
    box-shadow: 0 3px 8px rgba(103, 87, 62, 0.5);
    position:fixed;
    z-index: 10;
    background-color: #FFF;
    top: calc(50% - 150px); // half of width
    left: calc(50% - 165px);
    &__label {
        font-size: 21px;
        margin-bottom: 5px;
    }
    &__input {
        margin-bottom: 20px;
        width: 68%;
        padding: 12px 10px;
        border: 1px solid #66563D;
        border-radius: 15px;
        outline: none;
        box-shadow: 0 3px 8px rgba(103, 87, 62, 0.5);
        &:focus {
            box-shadow: 0 0 15px rgba(103, 87, 62, 0.8);
        }
    }
}

</style>
