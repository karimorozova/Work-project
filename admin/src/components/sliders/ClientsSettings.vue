<template lang="pug">
.clients
  .adminNavbar__slider.slider(v-if="sidebarShow")
    span CLIENTS
    .slider-inner
      .slider-col General Information
  .all-clients(v-if="allClients")
    Allclients(@chosenClient="chosenClient"
      @clientCancel="clientCancel")
</template>

<script>
import Allclients from '../clients/Allclients';
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      allClients: true,
      sidebarShow: false,
    }
  },
  methods: {
    clientCancel(data) {
      this.clientData = false;
      this.sidebarShow = false;
    },
    chosenClient(data) {
      this.sidebarShow = true;
    },
    ...mapActions({
      loadingToggle: "loadingToggle"
    })
  },
  components: {
    Allclients
  },
  mounted() {
    this.loadingToggle(true);
  }
};
</script>

<style lang="scss" scoped>
.clients {
  display: flex;
  .all-clients, &__data, &__contact-details {
    margin-top: 20px;
    margin-left: 20px;
  }
}
.title {
  font-size: 22px;
}
.gen-info, .contacts-info, .rates, .sales, .billing {
  margin: 20px 10px 40px 10px;
  padding: 40px;
  box-shadow: 0 0 15px #67573e9d;
  width: 800px;
}
.rates {
  padding: 10px;
  width: 860px;
}
.gen-info {
  display: flex;
  justify-content: space-between;
  &__block {
    width: 40%;
  }
}
.block-item {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  label {
    margin-bottom: 0;
  }
  input {
    font-size: 14px;
    color: #67573e;
    border: 1px solid #67573e;
    border-radius: 5px;
    padding: 0 3px;
    outline: none;
    width: 185px;
    height: 28px;
  }
  ::-webkit-input-placeholder {
    padding: 10px 5px;
    opacity: 0.5;
  }
}
.contract {
  display: flex;
  align-items: center;
  width: 22%;
  justify-content: space-between;
  &__upload {
    position: relative;
    background: url("../../assets/images/Other/upload-icon.png");
    background-repeat: no-repeat;
    width: 40%;
    height: 22px;
    overflow: hidden;
    .upload {
      padding-left: 0;
      padding-right: 0;
      width: 33px;
      height: 22px;
      border: none;
      outline: none;
      margin-top: -3px;
      margin-right: 2px;
      opacity: 0;
      z-index: 2;
      position: absolute;
      cursor: pointer;
      left: -10px;
    }
  }
  &__download {
    width: 40%;
    cursor: pointer;
  }
}
.adminNavbar {
  position: relative;
  display: flex;
  min-height: 94vh;
  &__slider {
    height: 100%;
    background-color: #fff;
    width: 175px;
    box-shadow: 7px 1px 10px rgba(103, 87, 62, 0.4);
    display: flex;
    flex-direction: column;
    font-family: MyriadPro;
    color: #67573e;
    font-size: 22px;
    transition: all 1s;
    span {
      display: flex;
      justify-content: center;
      padding: 44px 0;
      font-weight: 700;
    }

    .slider-inner {
      display: flex;
      flex-direction: column;

      .slider-col {
        display: flex;
        justify-content: center;
        border-top: 1px solid #c4beb6;
        border-bottom: 1px solid #c4beb6;
        padding: 5px 0;
        background-color: #c4beb6;
        font-size: 18px;
        cursor: pointer;
      }
    }
  }
  .slider {
    transform: translate(-3%);
    background-color: #fff;
  }
}

.buttons {
  width: 99%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  &__button {
    margin-left: 30px;
    width: 138px;
    height: 33px;
    color: white;
    font-size: 14px;
    border-radius: 10px;
    -webkit-box-shadow: 0 3px 5px rgba(0,0,0,.4);
    box-shadow: 0 3px 5px rgba(0,0,0,.4);
    background-color: #ff876c;
    border: 1px solid #ff876c;
    cursor: pointer;
    outline: none;
  }
}

input {
  color: #67573E;
}

</style>
