<template lang="pug">
    .buttons
        .buttons__button
            Button(value="Save" @makeAction="save")
        .buttons__button
            Button(value="Cancel" @makeAction="cancel")
        .buttons__button
            Button(value="Delete" @makeAction="remove")
</template>

<script>
import Button from "~/components/buttons/Button";

export default {
    data() {
        return {

        }
    },
    methods: {
        save() {
            this.$emit("save");
        },
        cancel() {
            this.$router.go(-1);
        },
        remove() {

        }
    },
    components: {
        Button
    }    
}
</script>

<style lang="scss" scoped>
.buttons {
    display: flex;
    &__button {
        margin-left: 15px;
    }
}
</style>
