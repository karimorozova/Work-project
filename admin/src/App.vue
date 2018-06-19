<template lang='pug'>
  #app
    //-  a.b-log-out(href='/logout') Log out
    //-  a.b-log-in(href='/login') Log in
    router-view
</template>

<script>

export default {
  name: 'app'
}
</script>

<style lang='scss'>
body {
  overflow: hidden;
}
.b-log-in,
.b-log-out{
  padding: 6px;
  background-color: bisque;
  cursor: pointer;
}
</style>
