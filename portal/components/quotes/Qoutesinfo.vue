<template lang="pug">
    .qoutesWrap 
        .row
            .shortInfo
                .row__icon
                .row__columns
                    .col
                        .col__title 
                            span Request On
                            img(src="../../assets/images/white-arrow.png")
                    .col
                        .col__title 
                            span Project ID
                            img(src="../../assets/images/white-arrow.png")                        
                    .col.col-5
                        .col__title 
                            span Project Name
                            img(src="../../assets/images/white-arrow.png")                        
                    .col.col-4
                        .col__title 
                            span Status
                            img(src="../../assets/images/white-arrow.png")                        
                    .col
                        .col__title 
                            span Deadline
                            img(src="../../assets/images/white-arrow.png")                        
                    .col.col-5
                        .col__title 
                            span Total Cost
        .row(v-for="(quote,index) in clientQuotes")
            .shortInfo
                .row__icon(@click="showFullInfo(index)")
                    img(src="../../assets/images/open.png" :class="{rotateImage: quote.fullInfoAppear}")
                .row__columns_info
                    .col {{ quote.requestOn }}
                    .col {{ quote.projectId }}
                    .col.col-5 {{ quote.projectName }}
                    .col.col-4 {{ quote.status }}
                    .col {{ quote.deadline }}
                    .col.col-5
                        span(v-for="cost in quote.totalCost") {{ cost }}
            .fullInfo(v-if="quote.fullInfoAppear")      
</template>

<script>
import moment from "moment";

export default {
    data() {
        return {
            clientQuotes: [
                {requestOn: moment(new Date()).format("DD-MM-YYYY"), projectId: "111 [33]", projectName: "1Market Resources", status: "Open", deadline: moment(new Date()).format("DD-MM-YYYY"), totalCost: ["€1000", "APPROVE", "REJECT"], fullInfoAppear: false},
                {requestOn: moment(new Date()).format("DD-MM-YYYY"), projectId: "111 [33]", projectName: "1Market Resources", status: "Open", deadline: moment(new Date()).format("DD-MM-YYYY"), totalCost: ["€1000", "APPROVE", "REJECT"], fullInfoAppear: false},
                {requestOn: moment(new Date()).format("DD-MM-YYYY"), projectId: "111 [33]", projectName: "1Market Resources", status: "Open", deadline: moment(new Date()).format("DD-MM-YYYY"), totalCost: ["€1000", "APPROVE", "REJECT"], fullInfoAppear: false},
            ],
            
        }
    },
    methods: {
        showFullInfo(index) {
            this.clientQuotes[index].fullInfoAppear = !this.clientQuotes[index].fullInfoAppear
        }
    }
}
</script>

<style lang="scss">
.qoutesWrap {
    .row {
        display: flex;
        justify-content: center;
        margin-bottom: 5px;
        flex-direction: column;
        .shortInfo {
            display: flex;
        }
        &__icon {
            width: 4%;
            display: flex;
            justify-content: center;
            align-items: center;
            img {
                cursor: pointer;
            }
            .rotateImage {
                transform: rotate(180deg);
                padding-right: 5px;
                padding-bottom: 3px;
            }
        }
        &__columns {
            width: 96%;
            display: flex;
            border-radius: 15px;
            background-color: #998e7e;
            padding: 0 12px;
            .col {
                border-right: 1px solid white;
                color: white;
                padding: 5px;
                width: 12%;
                &:last-child {
                    border-right: none;
                }
                &__title {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 5px;
                    img {
                        height: 10px;
                        cursor: pointer;
                    }
                }
            }
            .col-4 {
                width: 14%;
            }
            .col-5 {
                width: 21%;
            }
            &_info {
                width: 96%;
                display: flex;
                border-radius: 15px;
                padding: 0 12px;
                border: 0.5px solid #998e7e;
                .col {
                    border-right: 1px solid #998e7e;
                    padding: 5px;
                    width: 12%;
                    &:last-child {
                        border-right: none;
                    }
                }
                .col-4 {
                    width: 14%;
                }
                .col-5 {
                    width: 21%;
                    span {
                        border-right: 1px solid #998e7e;
                        padding: 0 3px;
                        font-size: 14px;
                        color: green;
                        &:first-child {
                            font-size: 16px;
                            color: black;
                            padding-right: 10px;
                        }
                        &:last-child {
                            border-right: none;
                            color: rgb(245, 135, 110);
                        }
                    }
                }
            }
        }
        .fullInfo {
            margin-top: 2px;
            align-self: flex-end;
            border-radius: 20px; 
            width: 95%;
            min-height: 66px;
            border: 1px solid #998e7e;
        }
    }
}
    
</style>
