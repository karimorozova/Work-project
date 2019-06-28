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
        .detailsTable
            .allDetails
                .allDetails__item
                    span.itemName PROJECT DETAILS:
        table.proofingDetails
            thead
                th.proofingDetails__title Language
                th.proofingDetails__title Total Wordcount
            tr(v-for="pair in wordcountPairs")
                td.proofingDetails__data {{ pair.lang }}
                td.proofingDetails__data {{ pair.wordcount }}
</template>

<script>
import moment from 'moment';

export default {
    data() {
        return {
            orderData: {}
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
        wordcountPairs() {
            let result = [];
            if(this.orderData.countPairs) {
                result = this.orderData.countPairs
            }
            return result;
        }
    },
    mounted() {
        this.getData();
    }
}
</script>

<style lang="scss" scoped>

.detailsTable {
    width: 60%;
}
.proofingDetails {
    width: 60%;
    border: 1px solid #978D7E;
    border-collapse: collapse;
    font-size: 14px;
    th {
        color: white;
        background-color: #978D7E;
        &:first-child {
            border-right: 1px solid white;
        }
        padding: 3px;
    }
    td {
        border: 1px solid #978D7E;
        text-align: center;
    }
    tr {
        &:nth-of-type(2n) {
            background-color: #f4f0ee;
        }
    }
}

</style>
