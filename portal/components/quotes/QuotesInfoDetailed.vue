<template lang="pug">
    .qoutesInfoDetailedWrapper
        .container
            .container__label
                .container__label-title Quote Details
            .container__infoWrapper
              .container__info
                .container-project
                  .container-project__first-block
                    .container-project__first-block-one
                      .name Project Name:
                      .value {{ quote.name }}
                    .container-project__first-block-two
                      .name Project ID:
                      .value {{ quote.idNumber }}
                  .container-project__second-block
                    .container-project__second-block-one
                      .name Status:
                      .value {{ quote.status }}
                    .container-project__second-block-two
                      .name Total Cost:
                      .value {{ quote.totalAgreed.formattedAmount }}
                  .container-project__third-block
                    .container-project__third-block-one(@click="downloadAsPDF")
                      img(src="../../assets/images/pdf-icon.png")
                    span Download Full Report
                .tableWrapper
                  table.container-table
                    tr.row
                      td Language Pair
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Wordcount
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Cost
                    tr.row(v-for="lanCombination in quote.languageCombinations")
                      td.first-ceil {{ lanCombination.sourceLanguage.name }} >> {{ lanCombination.targetLanguage.name }}
                      td.second-ceil {{ quote.workflow }}
                      td.third-ceil(v-html="quote.totalAgreed.formattedAmount")
                .container__buttons
                    button.approve APPROVE QUOTE
                    button.reject REJECT QUOTE
              .project-manager
                .project-manager__detailed_info
                  .manager-icon
                    img(src="../../assets/images/man.png")
                  .manager-title  Project Manager
                  .manager-person {{ quote.projectManager.name }}
                .project-manager__detailed_description
                  .project-manager__detailed_description-firstblock
                    .services1 Services
                    .services2 {{ quote.service }}
                  .project-manager__detailed_description-secondblock
                    .services1 Industry
                    .services2 {{ quote.specialization }}
                  .project-manager__detailed_description-thirdblock
                    .services1 Requested On
                    .services2 {{ quote.startDate.formatted }}
                  .project-manager__detailed_description-fourthblock
                    .services1 Suggested Deadline
                    .services2(v-if="quote.deadline") {{ quote.deadline.formatted }}
</template>

<script>
export default {
  props: {
        client: {
            type: Object
        },
        user: {
            type: Object
        },
        projects : {
            type: Array
        },
        quotes: {
            type: Array
        },
        quoteIndex: {
            type: Number
        }
  },
  data() {
    return {
      quotesInfoDetailed: {
        title: "Project ID:",
        createdDate: "2018 04 11 [27]",
        projectName: "Project Name:",
        projectNameValue: "1Market Resources(Updated)",
        status: "Status:",
        statusDescription: "Wating for approval",
        totalCost: "Total Cost:",
        totalCostValue: "1000&#8364;"
      },
      projectInformations: [
        {
          projectID: "2018 04 11 [27]/EN-GB*ES-ES/1",
          languaagePair: "English(United Kingdom)>>Spanish(Spain)",
          wordcount: "100",
          cost: "32.32&#8364;"
        },
        {
          projectID: "2018 04 11 [27]/EN-GB*KO/1",
          languaagePair: "English(United Kingdom)>>Korean",
          wordcount: "200",
          cost: "32.32&#8364;"
        }
      ],
      managerPerson: "Sakis Koulos",
      services: {
        servicesTitle: "Services:",
        servicesTitleValue: "Marketing & Copyrighting",
        industryTitle: "Industry:",
        industryTitleValue: "ICO & Cryptocurrencies",
        requestedOn: "Requested On:",
        requestedOnDate: "01-Apr-2018",
        deadline: "Suggested Dedline",
        deadlineDate: "11-Apr-2018"
      },
      spanVisible: false
    };
  },
  methods: {
    hideSpan() {
      this.spanVisible = !this.spanVisible;
    },
    downloadAsPDF() {
      //stub
      console.log("Implement this method");
    }
  },
  computed: {
    quote() {
      return this.quotes[this.quoteIndex]
    }
  }
};
</script>


<style lang="scss" src="../../assets/styles/quotes/quotesinfodetailed.scss">
// @import "../../assets/styles/quotes/quotesinfodetailed.scss";

</style>