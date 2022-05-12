<template lang="pug">
  .module-filters
    template(v-for="({ id, name }) in tableFilters")
      .filter(v-if="id === 'f_projectName'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace

      .filter(v-if="id === 'f_customer.name'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedClients"
            :options="allClients"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setClients"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

      .filter(v-if="id === 'f_steps.stepAndUnit.step.title'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedStepsServices"
            :options="settingSteps.map(i => i.title)"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setStepsServices"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )
</template>

<script>
import SelectMulti from "../../SelectMulti"
import SelectSingle from "../../SelectSingle"
import DatePicker from "vue2-datepicker"
import LayoutWrapperMixin from "../../../mixins/LayoutWrapperMixin"
import { mapGetters } from "vuex"

export default {
  name: "CustomFilters",
  components: { SelectMulti, SelectSingle, DatePicker },
  mixins: [ LayoutWrapperMixin ],
  props: {
    tableFilters: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      clients: [],
      booleanOptions: [ 'Yes', 'No' ],
      allCurrency: [ 'EUR', 'USD', 'GBP' ],
      // allTasksStatuses: [ 'Created', 'Approved', 'Rejected', 'Quote Sent', 'In progress', 'Pending Approval [DR1]', 'Completed', 'Cancelled', 'Cancelled Halfway' ],
      // allStepsStatuses: [ 'Created', 'Approved', 'Rejected', 'Request Sent', 'Ready to Start', 'Waiting to Start', 'In progress', 'Completed', 'Cancelled', 'Cancelled Halfway' ]
    }
  },
  methods: {
    setClients({ option }) {
      if (!this.$route.query['f_customer.name']) {
        this.replaceRoute('f_customer.name', this.getClientsIdByFullName(option))
        return
      }
      let _ids = this.$route.query['f_customer.name'].split(',')
      if (_ids.includes(this.getClientsIdByFullName(option))) _ids = _ids.filter(_id => _id !== this.getClientsIdByFullName(option))
      else _ids.push(this.getClientsIdByFullName(option))
      this.replaceRoute('f_customer.name', _ids.join(','))
    },
    setStepsServices({ option }) {
      if (!this.$route.query['f_steps.stepAndUnit.step.title']) {
        this.replaceRoute('f_steps.stepAndUnit.step.title', this.getStepsIdByTitle(option))
        return
      }
      let _ids = this.$route.query['f_steps.stepAndUnit.step.title'].split(',')
      if (_ids.includes(this.getStepsIdByTitle(option))) _ids = _ids.filter(_id => _id !== this.getStepsIdByTitle(option))
      else _ids.push(this.getStepsIdByTitle(option))
      this.replaceRoute('f_steps.stepAndUnit.step.title', _ids.join(','))
    },
    getClientsIdByFullName(option) {
      const { _id } = this.clients.find(({ name }) => `${ name }` === option)
      return _id
    },

    getStepsIdByTitle(option) {
      const { _id } = this.settingSteps.find(({ title }) => title === option)
      return _id
    },
  },
  async created() {
    // this.vendors = (await this.$http.get('/pm-manage/vendors-for-options')).data
    this.clients = (await this.$http.get('/pm-manage/clients-for-options')).data
  },
  computed: {
    ...mapGetters({
      users: "getUsers",
      languages: "getAllLanguages",
      services: "getAllServices",
      settingSteps: "getAllSteps",
      industries: "getAllIndustries"
    }),

    selectedClients() {
      return this.$route.query['f_customer.name'] && this.clients.length ? this.$route.query['f_customer.name'].split(',').map(_id => {
        const client = this.clients.find(i => _id === i._id)
        return client ? `${ client.name }` : ''
      }) : []
    },

    selectedStepsServices() {
      return this.$route.query['f_steps.stepAndUnit.step.title'] && this.settingSteps.length ? this.$route.query['f_steps.stepAndUnit.step.title'].split(',').map(_id => this.settingSteps.find(step => _id === step._id).title) : []
    },

    allClients() {
      return this.clients.map(({ name }) => `${ name }`)
    },
  }
}
</script>

<style scoped lang="scss">

@import '../../../assets/scss/colors';

.moduleFilters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px 25px;
}

.filter {
  width: 220px;

  &__label {
    margin-bottom: 3px;
    font-family: 'Myriad600';
  }

  &__input {
    position: relative;
    height: 32px;
    width: 220px;
    background: white;
  }

  input {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 2px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    height: 32px;
    transition: .1s ease-out;
    width: 220px;
    font-family: 'Myriad400';

    &:focus {
      border: 1px solid $border-focus;
    }
  }


}

.remove {
  font-size: 15px;
  transition: .2s ease-out;
  color: $dark-border;
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 8px;
  background: white;

  &:hover {
    color: $text;
  }
}
</style>