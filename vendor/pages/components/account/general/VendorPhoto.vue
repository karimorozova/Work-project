<template lang="pug">
    .photo
        .photo__wrap(v-if="!accountInfo.photo")
            input.photo__file(type="file" @change="previewPhoto")
            .photo__text(v-if="!isImageExist")
                p.photo__message(v-if="!isFileError") upload your photo
                    span.photo__extensions *.jpg/jpeg/png
                    span.photo__size <= 2MB
            img.photo__image(v-if="isImageExist")
            p.photo__error-message(v-if="isFileError") Incorrect file type or size
        .photo__wrap(v-if="accountInfo.photo")
            input.photo__file(type="file" @change="previewPhoto")                       
            img.photo__image(:src="domain+accountInfo.photo")
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            photoFile: [],
            isImageExist: false,
            domain: "",
            isFileError: false
        }
    },
    methods: {
        ...mapActions({
            setAccountProp: "setAccountProp"
        }),
        previewPhoto() {
            let input = document.getElementsByClassName('photo__file')[0];
            if(this.checkFile(input.files)) {
                this.setAccountProp({prop: "photoFile", value: input.files});
                this.isImageExist = true;
                let reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementsByClassName('photo__image')[0].src = e.target.result;
                }
                reader.readAsDataURL(input.files[0]);
            } else {
                this.showFileError();
                input.value = "";
            }
        },
        showFileError() {
            this.isFileError = true;
            setTimeout(() => {
                this.isFileError = false;
            }, 5000)
        },
        checkFile(files) {
            if(files &&  files[0]) {
                const types = ['jpg', 'jpeg', 'png'];
                const type = files[0].name.split('.').pop();
                return types.indexOf(type.toLowerCase()) !== -1 && files[0].size <= 2000000;
            }
            return false;
        }
    },
    computed: {
        ...mapGetters({
            accountInfo: "getAccountInfo"
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
        align-items: center;
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
    &__extensions, &__size {
        display: block;
        font-size: 12px;
        margin-top: 10px;
    }
    &__error-message {
        position: absolute;
        bottom: 30%;
        z-index: 10;
        background-color: $white;
        padding: 3px;
        box-sizing: border-box;
        color: $orange;
    }
    &__message {
        font-size: 18px;
        opacity: 0.5;
        width: 50%;
        text-align: center;
    }
}

</style>
