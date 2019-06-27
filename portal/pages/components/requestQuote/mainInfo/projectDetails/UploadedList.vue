<template lang="pug">
    .uploaded-list
        .uploaded-list__item(v-for="(file, index) in files")
            span.uploaded-list__remove(@click="removeFile(index)") +
            .uploaded-list__name {{ file.name }}
</template>

<script>
export default {
    props: {
        files: {type: Array}
    },
    methods: {
        removeFile(index) {
            this.$emit('remove', { index });
        }
    }
}
</script>

<style lang="scss" scoped>

.uploaded-list {
    max-width: 50%;
    &__item {
        display: flex;
        align-items: center;
    }
    &__remove {
        font-size: 22px;
        font-family: MyriadBold;
        transform: rotate(45deg);
        margin-right: 3px;
        cursor: pointer;
    }
    &__name {
        font-size: 12px;
        padding-top: 3px;
    }
}

</style>
