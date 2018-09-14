<template lang="pug">
.education-table
    table.education-table__table
        slot(name="header")
            slot(name="headDeck")
        slot(name="tableBody")
            slot(name="row")
                slot(name="rowDeck")
</template>

<script>
export default {
    props: {
        heads: {
            type: Array
        },
        informations: {
            type: Array
        }
    },
    data() {
        return {
        }
    },
    methods: {

    }
}
</script>

<style lang="scss" scoped>

.education-table__table {
    border-collapse: collapse;
    font-size: 14px;
}

</style>
