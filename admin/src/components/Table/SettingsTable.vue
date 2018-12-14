<template lang="pug">
.table
    .table__thead
        .table__thead-row
            .table__thead-cell(v-for="field of fields" :style="{width: field.width}")
                slot(:name="field.headerKey" :field="field")
    .table__tbody
        .table__tbody-row(v-for="(row, index) of tableData" @click="onClick(index)")
            .table__tbody-cell(v-for="field of fields" :style="{width: field.width, padding: field.padding}")
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
        activeIndex: {
            type: Number
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
@import '../../assets/scss/colors.scss';

.table {
    width: 100%;
    overflow: hidden;
    &__thead {
        .table__thead-row {
            background-color: $thead-background;
            color: $white;
        }
    }
    &__tbody {
        max-height: 600px;
        overflow-y: overlay;
        margin-bottom: 20px;
    }
    &__thead-cell {
        box-sizing: border-box;
        font-size: 14px;
        padding: 7px 5px 5px 6px;
        border: 0.5px solid $cell-border;
        border-right: none;
        border-left: 0.5px solid $white;
        &:first-child {
            border-left: 0.5px solid $cell-border;
        }
        &:last-child {
            border-right: 0.5px solid $cell-border;
        }
    }
    &__tbody-cell {
        box-sizing: border-box;
        font-size: 14px;
        padding: 7px 5px 5px 6px;
        border: 1px solid $cell-border;
        border-right: none;
        &:last-child {
            border-right: 0.5px solid $cell-border;
        }
        &:focus-within {
            box-shadow: inset 0 0 5px $cell-border;
        }
    }
    &__thead-row, &__tbody-row {
        display: flex;
    }
    &_scroll-padding {
        padding-right: 15px;
    }
    &_bottom-bordered {
        border-bottom: 0.5px solid $cell-border;
    }
}
</style>
