<template lang="pug">
    .photo
        .photo__wrap(v-if="!vendor.photo")
            input.photo__file(type="file" @change="previewPhoto")
            .photo__text(v-if="!isImageExist")
                p.photo__message upload your photo                          
            img.photo__image(v-if="isImageExist")
        .photo__wrap(v-if="vendor.photo")
            input.photo__file(type="file" @change="previewPhoto")                       
            img.photo__image(:src="domain+vendor.photo")
</template>

<script>
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            photoFile: [],
            isImageExist: false,
            domain: ""
        }
    },
    methods: {
        previewPhoto() {
            let input = document.getElementsByClassName('photo__file')[0];
            if(input.files && input.files[0]) {
                this.photoFile = input.files;
                this.isImageExist = true;
                let reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementsByClassName('photo__image')[0].src = e.target.result;
                }
                reader.readAsDataURL(input.files[0]);
            }
        },
    },
    computed: {
        ...mapGetters({
            vendor: "getVendor"
        })
    },
    mounted() {
        this.domain = process.env.domain;
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.photo {
    &__wrap {
        box-sizing: border-box;
        width: 180px;
        height: 157px;
        border: 1px solid $main-color;
        position: relative;
        overflow: hidden;
        margin-bottom: 20px;
        display: flex;
        justify-content: center;
    }
    &__image {
        max-width: 100%;
        max-height: 100%;
    }
    &__file {
        position: absolute;
        top: -25px;
        left: -100px;
        height: 180px;
        background-color: transparent;
        outline: none;
        border: none;
        z-index: 5;
    }
    &__text {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }
    &__message {
        font-size: 18px;
        opacity: 0.5;
        width: 50%;
        text-align: center;
    }
}

</style>
