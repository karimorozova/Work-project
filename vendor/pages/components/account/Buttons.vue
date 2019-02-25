<template lang="pug">
    .buttons
        Button(value="Save" @makeAction="save")
        Button(value="Cancel" @makeAction="cancel")
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

        },
        cancel() {

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
}
</style>
