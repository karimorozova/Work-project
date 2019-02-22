<template lang="pug">
.file-list
    .file-list__item(v-for="(file, index) in files") {{ file.name }}
        span.file-list__delete(@click="deleteFile(index)") +
</template>

<script>
export default {
    props: {
        files: {
            type: Array
        }
    },
    methods: {
        deleteFile(index) {
            this.files.splice(index, 1);
        }
    }
}
</script>

<style lang="scss" scoped>
.file-list {
    margin-left: 70px;
    &__item {
        position: relative;
    }
    &__delete {
        position: absolute;
        left: -20px;
        top: -3px;
        font-size: 20px;
        font-weight: 700;
        transform: rotate(45deg);
        cursor: pointer;
    }
}
</style>
