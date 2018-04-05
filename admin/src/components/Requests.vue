<template lang="pug">
  .container
    FullOrder(
      :visibleOrderInfo='visibleInfo' 
      :date='formatDate(fullOrderInfo.date)' 
      :contactName='fullOrderInfo.contactName' 
      :contactEmail="fullOrderInfo.contactEmail" 
      :service="fullOrderInfo.service" 
      :industry="fullOrderInfo.industry" 
      :status="fullOrderInfo.status" 
      :accountManager="fullOrderInfo.accountManager" 
      :contactPhone="fullOrderInfo.phone" 
      :contactSkype="fullOrderInfo.skype" 
      :companyWeb="fullOrderInfo.web" 
      :companyName="fullOrderInfo.companyName"
      :sourceLanguage="fullOrderInfo.sourceLanguage"
      :targetLanguages="fullOrderInfo.targetLanguages"
      :brief="fullOrderInfo.brief"
      :createdAt="formatDate(fullOrderInfo.createdAt)"
      @hide='hideFullOrder'
      @updateStatus='updateStatusR'
      @updateManager='updateManagerR'
      @save='saveChangesToOrder'
      )
    .header
      h1 REQUESTS
      .export
        input(type='submit', value='Export')
      .filter
        .dates
          label
            | Date
          .dates-picker
            datepicker(ref="dateFrom" placeholder="dd-mm-yyyy" format="dd-MM-yyyy" clear-button=true v-model="dateFrom").date-from
            img(src="../assets/images/calendar.png" @click="openPickerFrom")
            span to
            datepicker(ref="dateTo" placeholder="dd-mm-yyyy" format="dd-MM-yyyy" clear-button=true v-model="dateTo").date-to
            img(src="../assets/images/calendar.png" @click="openPickerTo")
        .name
          label Name
          input(type='text')
        .service
          label Service is
          .select.services(@blur='() => servicesDrop = false' role='button' tabindex='0')
            span.select__text 
              span.text(:class="{text_opacity: serviceSelect != 'None selected'}") {{ serviceSelect }}
              .text-wrapper(@click="showServices")
              .icon(:class="{reverse: servicesDrop}")
                i.fa.fa-caret-down
            .services__drop(v-if='servicesDrop')
              .services__drop-list(v-for="(service, index) in services")
                span.list-item(@click="chooseService(index)") {{ service.title }}
                  input.check(type="checkbox" :checked="service.check")
        .industry
          label Industry is
          .select.industries(@blur='() => industriesDrop = false' role='button' tabindex='1')
            span.select__text 
              span.text(:class="{text_opacity: industrySelect != 'None selected'}") {{ industrySelect }}
              .text-wrapper(@click="showIndustries")
              .icon(:class="{reverse: industriesDrop}")
                i.fa.fa-caret-down
            .industries__drop(v-if='industriesDrop')
              .industries__drop-list(v-for="(industry, index) in industries")
                span.list-item(@click="chooseIndustry(index)") {{ industry.title }}
                  input.check(type="checkbox" :checked="industry.check")
        .status
          label Status
          .select.status(@blur='() => statusDrop = false' role='button' tabindex='2')
            span.select__text
              span.text(:class="{text_opacity: statusSelect != 'None selected'}") {{ statusSelect }}
              .text-wrapper(@click="showStatus")
              .icon(:class="{reverse: statusDrop}")
                i.fa.fa-caret-down
            .status__drop(v-if='statusDrop')
              .status__drop-list(v-for="(status, index) in statuses")
                span.list-item(@click="chooseStatus(index)") {{ status.title }}
                  input.check(type="checkbox" :checked="status.check")
        .manager
          label Account Manager
          .select.manager(@blur='() => managersDrop  = false' role='button' tabindex='3')
            span.select__text
              span.text(:class="{text_opacity: managerSelect != 'None selected'}") {{ managerSelect }}
              .text-wrapper(@click="showManagers")
              .icon(:class="{reverse: managersDrop}")
                i.fa.fa-caret-down
            .manager__drop(v-if='managersDrop')
              .manager__drop-list(v-for="(manager, index) in managers")
                span.list-item(@click="chooseManager(index)") {{ manager.title }}
                  input.check(type="checkbox" :checked="manager.check")    
      .view
        | View
        i.fa.fa-caret-down
        span {{ amount }} of {{ orders.length }}
    table.table
      tr
        th.dateColumn Date
        th.nameCol Contact Name
        th.emailCol Contact Email
        th.serviceCol Services
        th.industryCol Industry
        th.statusCol Status
        th.managerCol Account Manager
        th.iconCol
      tr(v-for="(order, index) in filteredOrders" ref="row")
        //- td
        //-   label.customInput.customInput__main
        //-     input(type='checkbox', :checked='checkInputs')
        //-     span.checkmark
        td.dateColumn
          | {{ formatDate(order.createdAt) }}
        td.nameCol
          | {{ order.contactName }}
        td.emailCol
          | {{ order.contactEmail }}
        td.serviceCol
          | {{ order.service.title }}
        td.industryCol
          | {{ order.industry }}
        td.statusCol
          | {{ order.status }}
        td.managerCol
          | {{ order.accountManager }}
        td.iconCol
          i.fa.fa-pencil(aria-hidden='true' @click='showMoreDetails(index)')

</template>
<script>
import Datepicker from "vuejs-datepicker";
import { mapGetters, mapActions } from "vuex";
import FullOrder from "./FullOrder.vue";
import moment from "moment";

export default {
  data() {
    return {
      fullOrderInfo: {
        date: "",
        contactName: "",
        contactEmail: "",
        service: "",
        industry: "",
        status: "",
        accountManager: "",
        web: "",
        skype: "",
        phone: "",
        companyName: "",
        sourceLanguage: "",
        targetLanguages: [],
        brief: ""
      },
      dateFrom: '',
      dateTo: '',
      indexOfFilter: 0,
      indexOfOrders: 0,
      visibleInfo: false,
      servicesDrop: false,
      industriesDrop: false,
      statusDrop: false,
      managersDrop: false,
      checked: false,
      fullOrder: false,
      unchangedOrder: '',
      services: [
        { title: "Translation", check: false },
        { title: "Graphic design", check: false },
        { title: "Market Research", check: false },
        { title: "Marketing & Copywriting", check: false }
      ],
      industries: [
        { title: "Hotel & Real Estates", check: false },
        { title: "Games", check: false },
        { title: "Casino", check: false },
        { title: "Real Estate", check: false },
        { title: "Cryptocurrency", check: false },
        { title: "Other", check: false }
      ],
      statuses: [
        { title: "New", check: false },
        { title: "Assigned", check: false },
        { title: "Open", check: false },
        { title: "Close", check: false },
        { title: "Canceled", check: false }
      ],
      managers: [
        { title: "manager1", check: false },
        { title: "manager2", check: false },
        { title: "manager3", check: false },
        { title: "manager4", check: false },
        { title: "manager5", check: false }
      ],
      // filteredOrder: [],
      orders: []
    };
  },
  methods: {
    formatDate(date){
      return moment(date).format("DD-MM-YYYY");
    },
    updateStatusR(status) {
      this.fullOrderInfo.status = status.status;
      // console.log(this.fullOrderInfo);
    },
    updateManagerR(manager) {
      this.fullOrderInfo.accountManager = manager.accountManager;
    },
    toggleFullOrder() {
      this.fullOrder = !this.fullOrder;
    },
    saveChangesToOrder() {
      // console.log(this.fullOrderInfo);
      
      this.$http.put("/request", this.fullOrderInfo)
        .then((res)=> {
          console.log(res)
        })
        .catch((err)=> {
          console.log(err)
        })
      this.saveAndExit();
    },
    saveAndExit() {
      this.filteredOrders.splice(this.indexOfFilter, 1, this.fullOrderInfo)
      this.visibleInfo = false;
    },
    hideFullOrder() {
      this.filteredOrders.splice(this.indexOfFilter, 1, this.unchangedOrder);
      this.visibleInfo = false;
    },
    showMoreDetails(index) {
      this.indexOfFilter = index;
      this.fullOrderInfo = this.filteredOrders[index];
      this.visibleInfo = true;

      this.unchangedOrder = _.cloneDeep(this.filteredOrders[index]);
      // this.filteredOrders.map(item => {
      //   for(let i = 0; i < this.orders.length; i++) {
      //     if(this.orders[i]._id == item._id) {
      //       this.orders.splice(i, 1)
      //       this.indexOfOrders = i     
      //     }
      //   }
        console.log(this.unchangedOrder)
      // })
      
      this.toggleFullOrder();
    },
    showServices() {
      this.toggleServices();
    },
    toggleServices() {
      this.servicesDrop = !this.servicesDrop;
    },
    chooseService(index) {
      this.services[index].check = !this.services[index].check;
      // this.toggleServices()
    },
    showIndustries() {
      this.toggleIndustries();
    },
    toggleIndustries() {
      this.industriesDrop = !this.industriesDrop;
    },
    chooseIndustry(index) {
      this.industries[index].check = !this.industries[index].check;
      // this.toggleIndustries()
    },
    showStatus() {
      this.toggleStatus();
    },
    toggleStatus() {
      this.statusDrop = !this.statusDrop;
    },
    chooseStatus(index) {
      this.statuses[index].check = !this.statuses[index].check;
      // this.toggleStatus()
    },
    showManagers() {
      this.toggleManagers();
    },
    toggleManagers() {
      this.managersDrop = !this.managersDrop;
    },
    chooseManager(index) {
      this.managers[index].check = !this.managers[index].check;
      // this.toggleManagers()
    },
    openPickerFrom() {
      this.$refs.dateFrom.showCalendar();
    },
    openPickerTo() {
      this.$refs.dateTo.showCalendar();
    },
    ...mapActions(["incrementCounter"])
  },
  computed: {
    ...mapGetters({
      count: "getCount"
    }),
    serviceSelect() {
      let result = [];
      let filterArray = this.services.filter(item => {
        return item.check == true;
      });

      if (!filterArray.length) {
        result.push("None selected");
      } else {
        filterArray.map(item => {
          result.push(item.title);
        });
      }

      return result.join(", ");
    },
    industrySelect() {
      let result = [];
      let filterArray = this.industries.filter(item => {
        return item.check == true;
      });

      if (!filterArray.length) {
        result.push("None selected");
      } else {
        filterArray.map(item => {
          result.push(item.title);
        });
      }

      return result.join(", ");
    },
    statusSelect() {
      let result = [];
      let filterArray = this.statuses.filter(item => {
        return item.check == true;
      });

      if (!filterArray.length) {
        result.push("None selected");
      } else {
        filterArray.map(item => {
          result.push(item.title);
        });
      }

      return result.join(", ");
    },
    managerSelect() {
      let result = [];
      let filterArray = this.managers.filter(item => {
        return item.check == true;
      });

      if (!filterArray.length) {
        result.push("None selected");
      } else {
        filterArray.map(item => {
          result.push(item.title);
        });
      }

      return result.join(", ");
    },
    filteredOrders() {
      let result = [];
      let arrayOfFilters = {services: [], industries: [], statuses: [], managers: []};
      let filteredService = this.services.filter(item => {
        return item.check == true;
      });
      let filteredIndustry = this.industries.filter(item => {
        return item.check == true;
      });
      let filteredStatus = this.statuses.filter(item => {
        return item.check == true;
      });
      let filteredManager = this.managers.filter(item => {
        return item.check == true;
      });
      if(!filteredService.length && !filteredIndustry.length && !filteredStatus.length && !filteredManager.length) {
        result = this.orders
      } else {
        filteredService.map(item => {
          if(item) arrayOfFilters.services.push(item.title);
        });
        filteredIndustry.map(item => {
          if(item) arrayOfFilters.industries.push(item.title);
        });
        filteredStatus.map(item => {
          if(item) arrayOfFilters.statuses.push(item.title);
        });
        filteredManager.map(item => {
          if(item) arrayOfFilters.managers.push(item.title);
        });
        this.orders.map(item => {
          for(let key in arrayOfFilters) {
            if(!arrayOfFilters[key]) {
              console.log(arrayOfFilters[key].length);
              result.push(item)
            } else {
              console.log(arrayOfFilters[key].length);
              if(key == "services") {
                for(let i = 0; i <= arrayOfFilters.services.length; i++) {
                  if(item.service == arrayOfFilters.services[i]) {
                    // if(!result.length) {
                    //   result.forEach((element, index, array) => {
                    //     if(element.service != arrayOfFilters.services[i]) {
                    //       array.splice(index, 1)
                    //     }
                    //   })
                    // } else 
                    result.push(item)
                  }
                }
              } else if (key == "industries") {
                  for(let i = 0; i <= arrayOfFilters.industries.length; i++) {
                    if(item.industry == arrayOfFilters.industries[i]) {
                      result.push(item)
                    }
                  }
                } else if (key == 'statuses') {
                    for(let i = 0; i <= arrayOfFilters.statuses.length; i++) {
                      if(item.status == arrayOfFilters.statuses[i]) {
                        result.push(item)
                      }
                    }
                  } else if (key == 'managers') {
                      for(let i = 0; i <= arrayOfFilters.managers.length; i++) {
                        if(item.accountManager == arrayOfFilters.managers[i]) {
                          result.push(item)
                        }
                      }
                    }
            }
          }
        })
        // console.log(arrayOfFilters);
      }

      let resultDateFiltered = result.filter((item) => {
        let from = moment(this.dateFrom);
        let to = moment(this.dateTo);
        let date = moment(item.createdAt);
        from.set({hour:0,minute:0,second:0,millisecond:0});
        date.set({hour:0,minute:0,second:0,millisecond:0});
        if(this.dateFrom && !this.dateTo) {
          // console.log("1: " + date);
          return date >= from
        } else if (this.dateTo && !this.dateFrom) {
          return date <= to
        } else if (this.dateFrom && this.dateTo) {
          return ((date >= from) && (date <= to))
        } else {
          return item
        }
      })
      // console.log('dateFrom: ' + moment(this.dateFrom));
      // console.log('dateTo: ' + moment(this.dateTo));
      let uniqueArray = _.uniq(resultDateFiltered, (item, key, a) => { 
        return item.a;
      });
        // console.log(result);
        // console.log(uniqueArray);
      return uniqueArray;
    },
    amount() {
      return this.filteredOrders.length;
    },
    getOrders() {
      this.$http.get("/requests").then(
        response => {
          console.log(JSON.parse(response.bodyText)[0]._id)
          this.orders = JSON.parse(response.bodyText);
        },
        err => {
          console.log(`You have to log in ${err}`);
          this.$router.push('/login')
        }
      );
    }
  },
  mounted() {
    // console.log(this)
    this.getOrders;
  },
  components: {
    Datepicker,
    FullOrder
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

</style>
