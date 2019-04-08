<template lang="pug">
  .dashboard
    .maininfoWrapper
      .mainInfo
        .clientsAll
          .quotesComponent
            .clientsAll__dropMenu.openQuotes(:class="{borderAngle: openQuotes}")
              .clientsAll__dropMenu_select(@click="showQuotes" :class="{bottomLine: openQuotes}") Open Quotes
                img(src="../../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openQuotes}")
              .clientsAll__dropMenu_item.quotesTable(v-if="openQuotes")
                Quotesinfo(@quoteDetails="quoteDetails" :quotes="quotes")
          .projectsComponent
            .clientsAll__dropMenu.openProjects(:class="{borderAngle: openProjects}")
              .clientsAll__dropMenu_select(@click="showProjects" :class="{bottomLine: openProjects}") Open Projects
                img(src="../../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openProjects}")
              .clientsAll__dropMenu_item.projectsTable(v-if="openProjects")
                projectsInfo(@projectDetails="projectDetails" :projects="projects" :project="project")
    //- nuxt-child(:project="project" :quoteIndex="quoteIndex" :projectIndex="projectIndex" :quotes="quotes" :projects="projects"  :jobsById="jobsById" :user="user" :quote="quote")
</template>

<script>

  import Quotesinfo from "~/components/quotes/Qoutesinfo";
  import ProjectsInfo from "~/components/projects/ProjectsInfo";

  export default {
    props: {
      projects: {
        type: Array
      },
      quotes: {
        type: Array
      },
      user: {
        type: Object
      },
      project: {
        type: Object
      },
    },
    data() {
      return {
        openQuotes: false,
        openProjects: true,
        quote: {
          name: 'some name',
          idNumber: 345345,
          status: 'SENT',
          totalAgreed: {
            formattedAmount: 1000
          },
          projectManager: {
            name: 'Sam'
          },
          service: 'Special',
          specialization: 'Some spec',
          startDate: {
            formatted: '1980 07 15'
          },
          deadline: {
            formatted: '2980 07 15'
          }
        },
        quoteIndex: 0,
        projectIndex: 0,
        jobsById: [],
      }
    },
    methods: {
      showQuotes() {
        this.openQuotes = !this.openQuotes;
      },
      showProjects() {
        this.openProjects = !this.openProjects;
      },
      quoteDetails(data) {
        this.quote = data.quote;
        this.$router.push('/dashboard/quotes-info');
      },
      projectDetails(data) {
        this.project = data.project;
        this.jobsById = data.jobs;
        this.$router.push('/dashboard/project-info');
      },
    },
    components: {
      Quotesinfo,
      projectsInfo: ProjectsInfo,
    }
  }
</script>

<style lang="scss" scoped>
  .dashboard {
    padding-top: 80px;
  }

  .maininfoWrapper {
    width: 100%;
    margin-left: 58px;
  }

  .projectsComponent,
  .quotesComponent {
    width: 1010px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .quotesComponent {
    margin-bottom: 40px;
  }

  .mainInfo {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
    .buttonPanel {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 5%;

      button {
        color: #fff;
        font-size: 15px;
        box-shadow: 0 5px 8px rgba(103, 87, 62, 0.5);
        background-color: #D15F45;
        border-radius: 18px;
        border: none;
        width: 180px;
        height: 43px;
        margin: 15px 18px 0;
        outline: none;
        cursor: pointer;
      }
    }
  }

  .clientsAll {
    display: flex;
    flex-direction: column;
    align-items: center;
    &__dropMenu {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      border-radius: 18px;
      box-shadow: 0 3px 13px rgba(0, 0, 0, 0.3);
      margin-right: 36px;
      margin-bottom: 10px;
      padding: 0 14px;
      color: #67573e;
      transition: all 0.2s;
      &_select {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 1.5%;
        cursor: pointer;
      }
      &_item {
        width: 100%;
        padding: 1.5%;
        transition: all 0.4s;
      }
      .reverseImage {
        transform: rotate(180deg);
      }
    }
  }

  .clientsAll {
    display: flex;
    flex-direction: column;
    align-items: center;
    &__dropMenu {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      border-radius: 18px;
      box-shadow: 0 3px 13px rgba(0, 0, 0, 0.3);
      margin-right: 36px;
      margin-bottom: 10px;
      padding: 0 14px;
      color: #67573e;
      transition: all 0.2s;
      &_select {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 1.5%;
        cursor: pointer;
      }
      &_item {
        width: 100%;
        padding: 1.5%;
        transition: all 0.4s;
      }
      .reverseImage {
        transform: rotate(180deg);
      }
    }
  }

  .borderAngle {
    border-radius: 0;
    border: none;
    margin-bottom: 0;
  }
</style>
