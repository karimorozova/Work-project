<template lang="pug">
    .files
        UploadFileButton(
            :isMultiple="isMultiple"
            :buttonTitle="buttonTitle"
            :label="label" 
            :comment="comment" 
            :inputName="inputName"
            @uploadedFile="setFiles")
</template>

<script>
import UploadFileButton from "@/components/buttons/UploadFileButton";
import { mapActions, mapGetters } from "vuex";

export default {
    props: {
        label: {type: String},
        buttonTitle: {type: String},
        comment: {type: String},
        inputName: {type: String},
        isMultiple: {type: Boolean, default: true}
    },
    methods: {
        ...mapActions({
            setDetail: "setRequestQuoteDetail"
        }),
        setFiles({files}) {
            if(this.inputName === 'refFiles') {
                return this.setRefFiles(files);
            }
            this.setDetailFiles(files);
        },
        setDetailFiles(files) {
            if(this.requestDetails.detailFiles && this.requestDetails.detailFiles.length) {
                let existingFiles = [...this.requestDetails.detailFiles];
                const fileNames = existingFiles.map(item => item.name);
                for(let file of files) {
                    if(fileNames.indexOf(file.name) === -1) {
                        existingFiles.push(file);
                    }
                }
                return this.setDetail({prop: 'detailFiles', value: [...existingFiles]});
            }
            this.setDetail({prop: 'detailFiles', value: [...files]});
        },
        setRefFiles(files) {
            this.setDetail({prop: 'refFiles', value: [...files]});
        }
    },
    computed: {
        ...mapGetters({
            requestDetails: "getRequestQuoteDetails"
        })
    },
    components: {
        UploadFileButton
    }
}
</script>

<style lang="scss" scoped>

</style>
