<template lang="pug">
    .clientsportalWrapper
        .clientsTop
            .clientsTop__clientName
                h2.clientsPortal {{ clientPortal }}
            .clientsTop__searchBlock
                .searchWrapper
                    img.search(src="../assets/images/search.png")
                .womanWrapper
        .clientsMainWrapper
            .clientsNavbar
                ul.navbar__ulist
                  li(v-for="note in navbarList") 
                    img.intothelist(:src="note.img")
                    br
                    span(v-if="false") {{ note.describe }}
                .logoImage(v-if="false")
                .balloons(v-else)
            .clientsAll
                .buttonPanel
                    button.quote {{ newQuote }}
                    button.project {{ newProject }}
                .openQuotes {{ openQuotes }}
                    img(src="../assets/images/open-close-arrow-brown.png")
                .openProjects {{ openProjects }}
                    img(src="../assets/images/open-close-arrow-brown.png")
</template>

<script>
export default {
  data() {
    return {
      companyName: "",
      clientPortal: "CLIENT PORTAL",
      navbarList: [
        {
          describe: "DASHBOARD",
          img: require("../assets/images/dashboard.png")
        },
        {
          describe: "PROJECTS",
          img: require("../assets/images/projects.png")
        },
        {
          describe: "INVOICES",
          img: require("../assets/images/invoices.png")
        },
        {
          describe: "DOCUMENTS",
          img: require("../assets/images/documents.png")
        }
      ],
      newQuote: "New Quote",
      newProject: "New Project",
      openQuotes: "Open Quotes",
      openProjects: "Open Projects"
    };
  },
  methods: {
    getCookie() {
      let sessionCookie = document.cookie.split("=")[1];
      if (sessionCookie) {
        return true;
      } else {
        console.log("Redirected to login page");
        window.location.replace("http://localhost:3000/sign");
      }
    },
    async clientInfo() {
      const result = await this.$axios.request({
        method: "get",
        url: "/clientsinfo",
        withCredentials: true
      });
      console.log(result);
      this.companyName = result.data.name;
    }
  },
  mounted() {
    this.getCookie();
    this.clientInfo();
  }
};
</script>

<style lang="scss">
body {
  margin: 0;
}

.clientsportalWrapper {
  max-width: 1190px;
  margin: 0 auto;
}

.clientsTop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #67573e;
  .company {
    span {
      font-weight: 600;
      font-size: 24px;
      font-weight: bold;
      color: darkslategray;
      font-style: italic;
    }
  }

  .clientsTop__clientName {
    .clientsPortal {
      color: #fff;
      margin-left: 7%;
      width: 100%;
    }
  }

  .clientsTop__searchBlock {
    margin-right: 1%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .searchWrapper {
      margin-left: -55%;
    }
    .womanWrapper {
      margin-right: 20%;
      border: 2px solid #fff;
      border-radius: 30px;
      width: 33px;
      height: 33px;
    }
  }
}

.clientsMainWrapper {
  display: flex;
  justify-content: center;

  .clientsNavbar {
    background-color: #67573e;
    height: 100%;
    width: 12%;
    opacity: 0.67;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .navbar__ulist {
      list-style: none;
      font-size: 15px;
      font-weight: bold;
      padding: 0;

      li {
        // margin-top: 40%;
        margin-bottom: 40%;

        .intothelist {
          margin-bottom: 78%;
        }
      }

      span {
        margin-left: -13%;
        color: #fff;
      }
    }

    .logoImage {
      display: flex;
      justify-content: center;
      align-items: center;
      background-image: url("../assets/images/logo.png");
      background-size: cover;
      background-position: no-repeat;
      margin-left: 8%;
      width: 175px;
      height: 59px;
    }

    .balloons {
      display: flex;
      justify-content: center;
      align-items: center;
      background-image: url("../assets/images/balloons.png");
      background-size: contain;
      background-repeat: no-repeat;
      width: 80px;
      height: 100px;
    }
  }

  .clientsAll {
    width: 88%;

    .buttonPanel {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 7%;

      button {
        color: #fff;
        font-size: 15px;
        box-shadow: 0 5px 8px rgba(103, 87, 62, 0.5);
        background-color: #f5876e;
        border-radius: 18px;
        border: none;
        width: 200px;
        height: 50px;
        margin: 2% 1% 0 1%;
      }
    }

    .openQuotes, .openProjects {
        border: 0.4px solid #67573e;
        border-radius: 12px;
        box-shadow: 0 3px 13px rgba(0, 0, 0, .3);
        margin-left: 6%;
        margin-right: 4%;
        margin-bottom: 13%;
        padding: 1.5%;
        color: #67573e;
        img {
            margin-left: 87%;
        }
    }
  }
}
</style>
