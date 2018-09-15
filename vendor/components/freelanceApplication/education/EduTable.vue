<template lang="pug">
.table
    .table__thead
        .table__cell(v-for="field of fields") {{ field.label }}
    .table__tbody
        template
            .table__row(v-for="row of tableData")
                .table__cell
                    slot(v-for="field of fields" :style="{width: field.width}") {{ row[field.key] }}
</template>

<script>
export default {
    props: {
        fields: {
            type: Array
        },
        tableData: {
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

.table__table {
    border-collapse: collapse;
    font-size: 14px;
}
.table__thead, .table__row {
    display: flex;
}

</style>
