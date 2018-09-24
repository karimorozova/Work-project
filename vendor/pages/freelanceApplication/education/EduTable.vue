<template lang="pug">
.table
    .table__thead
        .table__row
            .table__thead-cell(v-for="field of fields" :style="{width: field.width}") 
                slot(name="th") {{ field.label }}
            .table__empty-cell
    .table__tbody
        .table__row(v-for="(row, index) of tableData")
            .table__tbody-cell(v-for="field of fields" :style="{width: field.width}")
                slot(:name="field.key" :row="row" :index="index")
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
    overflow: hidden;
    &__thead {
        border-bottom: 0.5px solid #67563D;
        background-color: rgba(103, 86, 61, 0.7);
        color: #FFF;
    }
    &__tbody {
    overflow-y: scroll;
    height: 97px;
    }
    &__thead-cell {
        font-size: 12px;
        padding: 5px 0 5px 6px;
        border-right: 0.5px solid #FFF;
    }
    &__tbody-cell {
        font-size: 12px;
        padding: 2px 0 5px 5px;
        border-right: 0.5px solid #67563D;
        position: relative;
        &:focus-within {
            box-shadow: inset 0 0 5px #67563D;
        }
    }
    &__empty-cell {
        width: 16px;
    }
    &__row {
        display: flex;
        border-bottom: 0.5px solid #67563D;
    }
}



</style>
