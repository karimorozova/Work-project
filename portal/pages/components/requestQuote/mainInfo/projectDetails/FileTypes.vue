<template lang="pug">
    .file-types(v-click-outside="closeList")
        .file-types__title Supported File Types
        .file-types__types
            .file-types__images
                img.file-types__image(v-for="src in images" :src="src")
            .file-types__list-link(@click="toggleFullList") Full List
        .file-types__full-list(v-if="isFullList") 
            FilesList(@close="closeList")
</template>

<script>
import FilesList from "./FilesList";
import ClickOutside from 'vue-click-outside';

export default {
    data() {
        return {
            isFullList: false,
            images: [
                require('../../../../../assets/images/file-types/in.png'),
                require('../../../../../assets/images/file-types/excel1.png'),
                require('../../../../../assets/images/file-types/word1.png'),
                require('../../../../../assets/images/file-types/ini.png'),
                require('../../../../../assets/images/file-types/powerpoint1.png'),
                require('../../../../../assets/images/file-types/photoshop1.png')
            ]
        }
    },
    methods: {
        toggleFullList() {
            this.isFullList = !this.isFullList;
        },
        closeList() {
            this.isFullList = false;
        }
    },
    components: {
        FilesList
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors.scss";

.file-types {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    @media (max-width: 550px) {
        align-items: flex-end;
    }
    &__title {
        font-size: 12px;
        margin-bottom: 5px;
    }
    &__types {
        display: flex;
        flex-direction: column;
        align-items: center;
        @media (max-width: 550px) {
            align-items: flex-end;
        }
    }
    &__images {
        display: flex;
        justify-content: center;
        position: relative;
        width: 150px;
        @media (max-width: 550px) {
            justify-content: flex-end;
        }
    }
    &__list-link {
        font-size: 12px;
        text-decoration: underline;
        position: absolute;
        right: -30px;
        bottom: 0;
        cursor: pointer;
        @media (max-width: 550px) {
            margin-right: 30px;
            margin-top: 5px;
            position: static;
        }
    }
    &__full-list {
        position: absolute;
        top: 40px;
        right: 0px;
        z-index: 5;
        @media (max-width:550px) {
            top: 60px;
            right: 20px;
        }
    }
}

</style>
