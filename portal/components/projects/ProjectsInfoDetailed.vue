<template lang="pug">
    .projectsInfoDetailedWrapper
        .container
            .container__label
                .container__label-title Projects Details
            .container__infoWrapper
              .container__info
                .container-project
                  .container-project__first-block
                    .container-project__first-block-one
                      .name {{ quotesInfoDetailed.projectName }}
                      .value {{ quotesInfoDetailed.projectNameValue }}
                    .container-project__first-block-two
                      .name {{ quotesInfoDetailed.title }}
                      .value {{ quotesInfoDetailed.createdDate }}
                  .container-project__second-block
                    .container-project__second-block-one
                      .name {{ quotesInfoDetailed.status }}
                      .value {{ quotesInfoDetailed.statusDescription }}
                    .container-project__second-block-two
                      .name {{ quotesInfoDetailed.totalCost }}
                      span(v-html="quotesInfoDetailed.totalCostValue")
                  .container-project__third-block
                    .container-project__third-block-one(@click="downloadAsPDF")
                      img(src="../../assets/images/pdf-icon.png")
                    span Download Full Report
                .tableWrapper
                  table.container-table
                    tr.row
                      td Language Pair
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Status
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Wordcount
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Cost
                      td
                    tr.row(v-for="projectInformation in projectInformations")
                      td.first-ceil {{ projectInformation.languaagePair }}
                      td.second-ceil {{ projectInformation.status }}
                      td.third-ceil {{ projectInformation.wordcount }}
                      td.fourth-ceil(v-html="projectInformation.cost")
                      td.fifth-ceil(@click="downloadDetail")
                        img(src="../../assets/images/download.png")
              .project-manager
                .project-manager__detailed_info
                  .manager-icon
                    img(src="../../assets/images/man.png")
                  .manager-title  Project Manager
                  .manager-person {{ managerPerson }}
                .project-manager__detailed_description
                  .project-manager__detailed_description-firstblock
                    .services1 {{ services.servicesTitle }}
                    .services2 {{ services.servicesTitleValue }}
                  .project-manager__detailed_description-secondblock
                    .services1 {{ services.industryTitle }}
                    .services2 {{ services.industryTitleValue }}
                  .project-manager__detailed_description-thirdblock
                    .services1 {{ services.requestedOn }}
                    .services2 {{ services.requestedOnDate }}
                  .project-manager__detailed_description-fourthblock
                    .services1 {{ services.deadline }}
                    .services2 {{ services.deadlineDate }}
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
          languaagePair: "English(United Kingdom)>>Spanish(Spain)",
          status: "Open",
          wordcount: "100",
          cost: "32.32&#8364;"
        },
        {
          languaagePair: "English(United Kingdom)>>Korean",
          status: "Open",
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
    },
    downloadDetail() {
      //stub
      console.log("Implement this method");
    }
  }
};
</script>


<style lang="scss" scoped>
@import "../../assets/styles/projects/projectsinfodetailed.scss";

</style>
