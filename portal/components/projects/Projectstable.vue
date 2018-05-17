<template lang="pug">
    .root
        .row
            .shortInfo
                .row__columns
                    .col
                        .col__title 
                            span Request On
                            img.req_img(src="../../assets/images/white-arrow.png")
                    .col
                        .col__title
                            span Project ID
                            img(src="../../assets/images/white-arrow.png")                        
                    .col.col-5
                        .col__title 
                            span Project Name
                            .double_arrow
                              .up
                                img.arrow_up(src="../../assets/images/white-arrow.png")
                              .down
                                img.arrow_down(src="../../assets/images/white-arrow.png")                       
                    .col.col-4
                        .col__title 
                            span Status
                            .double_arrow
                              .up
                                img.arrow_up(src="../../assets/images/white-arrow.png")
                              .down
                                img.arrow_down(src="../../assets/images/white-arrow.png")                
                    .col
                        .col__title 
                            span Deadline
                            .double_arrow
                              .up
                                img.arrow_up(src="../../assets/images/white-arrow.png")
                              .down
                                img.arrow_down(src="../../assets/images/white-arrow.png")                  
                    .col.col-5.colSplit
                        .col__title 
                            span Total Cost
                        .col
                        .col
        .row(v-for="(quote,index) in clientQuotes")
            .shortInfo
                .row__columns_info
                    .col(@click="openQuotesInfoDetailed") {{ quote.requestOn }}
                    .col.proj(@click="openQuotesInfoDetailed") {{ quote.projectId }}
                    .col.col-5(@click="openQuotesInfoDetailed") {{ quote.projectName }}
                    .col.col-4(@click="openQuotesInfoDetailed") {{ quote.status }}
                    .col(@click="openQuotesInfoDetailed") {{ quote.deadline }}
                    .col.col-5.colSplit
                        .col
                            span(@click="openQuotesInfoDetailed") {{ quote.totalCost }}
                        .col
                            img(src="../../assets/images/Approve-icon.png")
                            .sp-wrapper
                              span.appr APPROVE QUOTE                         
                        .col
                            img(src="../../assets/images/Reject-icon.png")
                            span.rej REJECT QUOTE
            .fullInfo(v-if="quote.fullInfoAppear")
                .languagePair
                    .languagePair__title {{ languagePair }}
                        img.languagePair__image(src="../../assets/images/open-close-arrow-brown.png")
                    ul.languagePair__ul
                        li.languagePair__li(v-for="language in languagesFromTo") {{ language.description }}
                .cost
                    .cost__title {{ cost }}
                        img.cost__image(src="../../assets/images/open-close-arrow-brown.png")
                    ul.cost__ul
                        li.cos
  
</template>

<script>
export default {
    data() {
        return {
            clientQuotes: []
        }
    },
    methods: {
        getCookie() {
        // let sessionCookie = document.cookie.split("=")[1];
            if (document.cookie.indexOf("ses") >= 0) {
                return true;
            } else {
                console.log("login failed");
                // alert("Please, Log in!")
                // window.location.replace("/");
            }
        },
        async clientInfo() {
            const result = await this.$axios.request({
                method: "get",
                url: "portal/clientinfo",
                withCredentials: true
            });
            console.log(result);
            this.companyName = result.data.name;
        }
    },
    mounted() {
        this.getCookie(),
        this.clientInfo()
    }
}
</script>


<style lang="scss">
@import "../../assets/styles/projects/projectstable.scss";

</style>
