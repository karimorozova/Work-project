<template lang="pug">
  .template
    .details
      .details__invoice
        .details__invoice-title {{ invoice.invoiceId }}

      .row
        .row__key Status:
        .row__value {{ invoice.status }}
      .row
        .row__key Account Manager:
        .row__value
          .dropbox
            SelectSingle(
              placeholder="Option"
              :hasSearch="true"
              :options="allAMs.map(({ firstName, lastName}) => firstName + ' ' + lastName)"
              :selectedOption="currentAM"
              @chooseOption="setAm"
            )
</template>

<script>
import SelectSingle from "../../SelectSingle"
import { mapGetters } from "vuex"

export default {
  name: "InvoiceDetailsSubInfoEdit",
  components: { SelectSingle },
  props: {
    invoice: {
      type: Object
    }
  },
  methods: {
    modifyInvoice(prop, value) {
      this.$emit('modifyInvoice', { prop, value })
    },
    setAm({ option }) {
      this.modifyInvoice('accountManager', this.allAMs.find(({ firstName, lastName }) => (firstName + ' ' + lastName) === option))
    }
  },
  computed: {
    ...mapGetters({
      users: 'getUsers'
    }),
    allAMs() {
      return this.users.filter(({ group }) => group.name === 'Account Managers')
    },
    currentAM() {
      if (!this.invoice.accountManager) return ''
      const { firstName, lastName } = this.invoice.accountManager
      return firstName + ' ' + lastName
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.template {
  width: 400px;
  box-sizing: border-box;
  border-radius: 2px;
  box-shadow: $box-shadow;
  padding: 25px;
  background: white;
  margin-bottom: 25px;
}

.details {
  &__invoice {
    margin-bottom: 20px;
    border-bottom: 1px solid $light-border;
    width: 100%;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-title {
      font-size: 16px;
      font-family: 'Myriad600';
    }
  }
}

.row {
  width: 100%;
  display: flex;
  height: 32px;
  align-items: center;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  &__key {
    width: 120px;
    margin-right: 10px;
  }

  &__value {
    width: 220px;
    position: relative;
  }

  &__valueFlex {
    width: 220px;
    position: relative;
    display: flex;
    gap: 20px;
    align-items: center;
  }
}
</style>