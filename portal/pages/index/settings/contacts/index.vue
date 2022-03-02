<template lang="pug">
  .contactsWrapper(v-if="false" )

    .contacts-info__table
      GeneralTable(
        :fields="fields"
        :tableData="client.contacts"
      )
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .table__header {{ field.label }}

        .table__dataImage(slot="name" slot-scope="{ row }")
          .table__name
            .user__image
              .user
              img(v-if="row.photo" :src="domain+row.photo")
              .user__fakeImage(:style="{'--bgColor': getBgColor(row._id)[0], '--color':getBgColor(row._id)[1]  }" v-else)
                span {{ row.firstName[0].toUpperCase() }}
            .name {{ row.firstName }} {{ row.surname || '' }}

        .table__data(slot="email" slot-scope="{ row, index }")  {{ row.email }}
        .table__data(slot="position" slot-scope="{ row, index }") {{ row.position }}

        .table__icons(slot="icons" slot-scope="{ row, index }")
          .table__icon(@click="showContactDetails(index)")
            i(class="fas fa-pen")
          .table__icon(@click="openDeleteModal(row._id)")
            i(class="fas fa-trash")
    Add

</template>

<script>
import Button from "../../../../components/pangea/Button"
import ValidationErrors from "../../../../components/pangea/ValidationErrors"
import { mapActions, mapGetters } from "vuex"
import SelectSingle from "../../../../components/pangea/SelectSingle"
import getBgColor from "../../../../mixins/getBgColor"
import GeneralTable from "../../../../components/pangea/GeneralTable"
import Add from "../../../../components/pangea/Add"

export default {
  mixins: [ getBgColor ],
  data() {
    return {
      domain: '',
      fields: [
        { label: "Full Name", headerKey: "headerName", key: "name", style: { width: "38%" } },
        { label: "Position", headerKey: "headerPosition", key: "position", style: { width: "20%" } },
        { label: "Email", headerKey: "headerEmail", key: "email", style: { width: "31%" } },
        { label: "", headerKey: "headerIcons", key: "icons", style: { width: "11%" } }
      ]
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      getClient: "getClient"
    }),
    showContactDetails() {
      console.log('d1')
    },
    openDeleteModal() {
      console.log('d2')
    }
  },
  computed: {
    ...mapGetters({
      user: "getUserInfo",
      client: "getClientInfo"
    })
  },
  components: {
    Add,
    GeneralTable,
    SelectSingle,
    Button,
    ValidationErrors
  },
  mounted() {
    this.domain = process.env.domain
  },
  async created() {

  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.contactsWrapper {
  width: 1000px;
  box-sizing: border-box;
  border-radius: 4px;
  background-color: white;
  box-shadow: $box-shadow;
  padding: 25px;
  position: relative;
}

.table {
  &__header,
  &__data {
    padding: 0 7px;
    width: 100%;
    text-align: left;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 7px;
  }

  //&__dataImage {
  //  height: 40px;
  //  display: flex;
  //  align-items: center;
  //  gap: 9px;
  //  padding: 0 7px;
  //}
  //
  //&__radio {
  //  width: 100%;
  //  display: flex;
  //  justify-content: center;
  //}

  &__icon {
    cursor: pointer;
  }

  &__icons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 13px;
    width: 100%;
    height: 40px;
    font-size: 15px;
  }
}

.user {
  &__fakeImage {
    height: 32px;
    width: 32px;
    border-radius: 32px;
    background-color: var(--bgColor);
    color: var(--color);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }

  &__image {
    height: 32px;
    width: 32px;
    border-radius: 32px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 32px;
    }
  }
}
</style>
