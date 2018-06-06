<template lang="pug">
    .confirmation
        .head
            .head__title
                span.thanks THANK YOU FOR YOUR ORDER!
                span.summary SUMMARY BELOW:
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName PROJECT NAME:
                    span.itemData {{ orderData.projectName }}
            .allDetails
                .allDetails__item
                    span.itemName SUGGESTED DEADLINE:
                    span.itemData {{ deadlineSelect }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName SOURCE LANGUAGE:
                    span.itemData {{ sourceLang }}
            .allDetails
                .allDetails__item
                    span.itemName TARGET LANGUAGE(S):
                    span.itemData {{ targetLangs }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName PROJECT FILE(S):
                    span.itemData {{ detailFilesList }}
            .allDetails
                .allDetails__item
                    span.itemName REFERENCE FILE:
                    span.itemData {{ refFileName }}
        .confirmation__mainData
            .allDetails
                .allDetails__item
                    span.itemName BRIEF:
                    span.itemData {{ briefText }}
</template>

<script>
import moment from 'moment';

export default {
    props: {
    },
    data() {
        return {
            orderData: {},
        }
    },
    methods: {
        getData() {
            this.orderData = this.$store.state.orderDetails;
        }
    },
    computed: {
        deadlineSelect() {
            let date = "";            
            if(this.orderData.date) {
                date = moment(this.orderData.date).format('DD/MM/YYYY');
            }
            return date;
        },
        sourceLang() {
            let result = "";
            if(this.orderData.sourceLanguage) {
                result = this.orderData.sourceLanguage.lang;
            }
            return result;
        },
        targetLangs() {
            let result = "";
            if(this.orderData.targetLanguages) {
                for(let i = 0; i < this.orderData.targetLanguages.length; i++) {
                    result += this.orderData.targetLanguages[i].lang + "; "
                }
            }
            return result;
        },
        detailFilesList() {
            let files = "";
            if(this.orderData.detailFiles) {
                for(let i = 0; i < this.orderData.detailFiles.length; i++) {
                    files += this.orderData.detailFiles[i] + "; ";
                }
            }
            return files;
        },
        refFileName() {
            let file = "";
            if(this.orderData.refFiles) {
                file = this.orderData.refFiles;
            }
            return file;
        },
        briefText() {
            let brief = "";
            if(this.orderData.brief) {
                brief = this.orderData.brief;
            }
            return brief;
        }
    },
    mounted() {
        this.getData();
    }
}
</script>

<style lang="scss">
    .confirmation {
        color: #66573D;
        margin: 0 auto;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        .head {
            &__title {
                margin-bottom: 50px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-size: 22px;
                .summary {
                    font-size: 14px;
                }
            }
        }
        &__mainData {
            margin-bottom: 80px;
            display: flex;
            width: 60%;
            justify-content: space-between;
        }
    }
    .allDetails {
        width: 35%;
        &__item {
            display: flex;
            flex-direction: column;
        }
    }
    .itemName {
        font-size: 22px;
    }
    .itemData {
        font-size: 14px;
        color: #ff876c;
    }
</style>
