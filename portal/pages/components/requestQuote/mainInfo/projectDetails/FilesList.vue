<template lang="pug">
    .files-list
        span.files-list__close(@click="close") +
        .files-list__header SUPPORTED FILE TYPES
        .files-list__main
            .files-list__types-block(v-for="(fileTypes, key) of allTypes")
                .files-list__title {{ key }}
                .files-list__list
                    li.files-list__item(v-for="name in fileTypes")
                        span.files-list__dot &#9679;
                        span.files-list__name {{ name }}
</template>

<script>
export default {
    data() {
        return {
            allTypes: {
                'Text files': [
                    'Microsoft Office (doc, docx, xls, xlsx, xlsm, ppt, pptx)',
                    'Open Office (sxw, odt, ods, odp)', 'Microsoft Visio (vdx)',
                    'pdf (returns plain text)', 'rtf', 'txt'
                ],
                'Design files': ['Adobe Illustrator (fxg & svg)', 'Adobe FrameMaker (mif)','Adobe InDesign (idml)', 'sdf', 'svg'],
                'Web files': ['html, htm', 'xhtml, xht', 'asp, aspx', 'php', 'dita', 'tpl'],
                'Translation files': ['xlf, xliff, sdlxliff', 'Wordfast (txml)', 'Trados (ttx)'],
                'Dev files': ['yml, yaml', 'Java property files', 'iPhone apps (strings)','resx', 'ini']    
            },
        }
    },
    methods: {
        close() {
            this.$emit("close")
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors.scss";

.files-list {
    background-color: $white;
    width: 450px;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    box-shadow: 0 0px 15px $main-color;
    padding: 10px;
    box-sizing: border-box;
    position: relative;
    @media (max-width:550px) {
        width: 280px;
    }
    &__header {
        text-align: center;
        font-size: 22px;
        margin-top: 10px;
        @media (max-width:550px) {
            font-size: 18px;
            margin-bottom: 10px;
        }
    }
    &__title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
        @media (max-width:550px) {
            font-size: 16px;
        }
    }
    &__list {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 10px;
    }
    &__item {
        list-style: none;
    }
    &__dot {
        font-size: 14px;
        @media (max-width:550px) {
            font-size: 12px;
        }
    }
    &__name {
        font-size: 18px;
        margin: 0 8px 0 2px;
        @media (max-width:550px) {
            font-size: 14px;
        }
    }
    &__close {
        position: absolute;
        right: 10px;
        top: 0;
        transform: rotate(45deg);
        font-weight: bold;
        font-size: 32px;
        cursor: pointer;
        @media (max-width:550px) {
            font-size: 28px;
        }
    }
}

</style>
