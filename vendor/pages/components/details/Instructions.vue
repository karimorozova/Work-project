<template lang="pug">
    .instructions
        .instructions__textarea
            .instructions__title Instructions:
            p.instructions__text Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.
        .instructions__files
            .instructions__files-item
                .instructions__title Reference:
                img.instructions__download(src="../../../assets/images/download.png" :class="{'instructions_opacity05': !job.refFiles || !job.refFiles.length}" @click="downloadRef")
            .instructions__files-item
                .instructions__title Terminology:
                img.instructions__download(src="../../../assets/images/download.png" :class="{'instructions_opacity05': !job.terminology}" @click="downloadTerm")    
</template>

<script>
export default {
    props: {
        job: {type: Object}
    },
    methods: {
        downloadRef() {
            if(!this.job.refFiles || !this.job.refFiles.length) return;
            for(let file of this.job.refFiles) {
                let a = document.createElement("a");
                a.href = this.domain + file.split('./dist')[1];
                a.click(); 
            }    
        },
        downloadTerm() {
            if(!this.job.terminology) return;
            console.log('downloading...');
        },
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.instructions {
    margin-top: 20px;
    padding-right: 10px;
    &__textarea {
        padding: 8px;
        box-sizing: border-box;
        border: 2px solid $light-brown;
        border-radius: 5px;
        max-height: 125px;
        overflow-y: overlay;
    }
    &__text {
        margin: 10px 0;
        font-size: 14px;
    }
    &__files {
        display: flex;
        margin: 15px 0;
        padding-left: 8px;
    }
    &__files-item {
        display: flex;
        align-items: center;
        width: 30%;
    }
    &__download {
        margin-left: 15px;
        padding-bottom: 3px;
        cursor: pointer;
    }
    &_opacity05 {
        opacity: 0.5;
        cursor: default;
    }
}


</style>
