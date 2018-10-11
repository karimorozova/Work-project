<template lang="pug">
.table
    .table__thead(:class="{'table_scroll-padding': hasScroll}")
        .table__row
            .table__thead-cell(v-for="field of fields" :style="{width: field.width}") 
                slot(:name="field.label" :field="field")
    .table__tbody(:class="{'table_bottom-bordered': hasScroll}")
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
        },
        hasScroll: {
            type: Boolean
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
    }
    &__tbody {
    max-height: 180px;
    overflow-y: auto;
    margin-bottom: 20px;
        .table__row {
            cursor: pointer;
            &:nth-of-type(odd) {
                background-color: #f4f0ee;
            }
            &:hover {
                background-color: #ddd3c8;
            }
            .steps__table & {
                cursor: default;
            }
        }
        .steps__table & {
            overflow-y: overlay;
        }
    }
    &__thead-cell {
        box-sizing: border-box;
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
        box-sizing: border-box;
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
        .steps__table & {
            display: flex;
            align-items: center;
            &:nth-of-type(4) {
                padding: 0;
            }
        }
    }
    &__row {
        display: flex;
    }
    &_scroll-padding {
        padding-right: 15px;
    }
    &_bottom-bordered {
        border-bottom: 0.5px solid #938676;
    }
}

</style>
