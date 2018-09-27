<template lang="pug">
.table
    .table__thead
        .table__row
            .table__thead-cell(v-for="field of fields" :style="{width: field.width}") 
                slot(:name="field.label" :field="field")
                slot(name="hasScroll")
    .table__tbody
        .table__row(v-for="(row, index) of tableData" @click="onClick(index)")
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
    methods: {
        onClick(index) {
            this.$emit("onRowClicked", {index: index})
        }
    }
}
</script>

<style lang="scss" scoped>
.table {
    width: 100%;
    overflow: hidden;
    &__thead {
        background-color: #938676;
        color: #FFF;
        margin-bottom: 5px;
    }
    &__tbody {
    height: 200px;
    overflow: auto;
        .table__row {
            margin-bottom: 3px;
            cursor: pointer;
            &:nth-of-type(odd) {
                background-color: #f4f0ee;
            }
            &:hover {
                background-color: #ddd3c8;
            }
        }
    }
    &__thead-cell {
        font-size: 14px;
        padding: 7px 5px 5px 6px;
        border: 0.5px solid #938676;
        border-right: none;
        border-left: 0.5px solid #FFF;
        &:first-child {
            border-left: 0.5px solid #938676;
        }
        &:last-child {
            border-right: 0.5px solid #938676;
        }
    }
    &__tbody-cell {
        font-size: 14px;
        padding: 7px 5px 5px 6px;
        border: 0.5px solid #938676;
        border-right: none;
        &:last-child {
            border-right: 0.5px solid #938676;
        }
        &:focus-within {
            box-shadow: inset 0 0 5px #938676;
        }
    }
    &__row {
        display: flex;
    }
}

</style>
