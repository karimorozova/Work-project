<template lang="pug">
.table
    .table__thead
        .table__row
            .table__thead-cell(v-for="field of fields" :style="{width: field.width}") 
                slot(name="th" :field="field") {{ field.label }}
            .table__empty-cell(style="width: 17px;")
    .table__tbody
        .table__row(v-for="row of tableData")
            .table__tbody-cell(v-for="field of fields" :style="{width: field.width}")
                slot(:name="field.key") {{ row[field.key] }}
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

.table {
    width: 100%;
    border: 1px solid #67563D;
    border-radius: 10px;
    overflow: hidden;
    &__thead {
        border-bottom: 0.5px solid #67563D;
        background-color: rgba(103, 86, 61, 0.7);
        color: #FFF;
    }
    &__tbody {
    overflow-y: scroll;
    max-height: 90px;
    }
    &__thead-cell {
        font-size: 12px;
        padding: 5px 0 5px 8px;
        border-right: 0.5px solid #FFF;
    }
    &__tbody-cell {
        font-size: 12px;
        padding: 5px 0 5px 8px;
        border-right: 0.5px solid #67563D;
        position: relative;
    }
    &__empty-cell {
        border-bottom: 1px solid #67563D;
    }
    &__row {
        display: flex;
        border-bottom: 0.5px solid #67563D;
        &:last-child {
            border: none;
        }
    }
}



</style>
