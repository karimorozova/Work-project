<template lang="pug">
  .go
    table
      thead
        tr
          th Date
          th Order ID
          th Name
          th Price
          th Quantity
          th Total
      tbody
        tr
          td 2017-09-29 01:22
          td 200398
          td iPhone X 64Gb Grey
          td $999.00
          td 1
          td $999.00
        tr
          td 2017-09-28 05:57
          td 200397
          td Samsung S8 Black
          td $756.00
          td 1
          td $756.00
        tr
          td 2017-09-19 05:57
          td 200387
          td iPhone X 64Gb Grey
          td $999.00
          td 1
          td $999.00
        tr
          td 2017-09-18 05:57
          td 200386
          td iPhone X 64Gb Grey
          td $999.00
          td 1
          td $999.00


</template>

<script>
	export default {}
</script>

<style lang="scss" scoped>

  table {
    border-collapse: collapse;
    background: white;
    width: 100%;
    position: relative;
  }

  table * {
    position: relative;
  }

  table td, table th {
    padding: 0 6px;
  }

  th{
    display: flex;
    align-items: center;
    min-height: 40px;
  }

  td {
    padding: 0 6px 0 6px;
    min-height: 40px;
    display: grid;
    max-height: 60px;
    overflow-y: auto;
    align-items: center;
    letter-spacing: -0.1px;

  }

  tr {
    display: flex;
  }

  table thead {
    height: 40px;
    background: #36304a;
  }

  table tbody tr:last-child {
    border: 0;
  }

  /*table td, table th {*/
  /*  text-align: left;*/
  /*}*/

  table thead th {
    color: #fff;
    font-weight: unset;
  }

  tbody tr:nth-child(even) {
    background-color: #f5f5f5;
  }

  tbody tr {
    font-size: 14px;
    font-weight: unset;
  }

  tbody tr:hover {
    background-color: #f5f5f5;
    cursor: default;
  }

</style>