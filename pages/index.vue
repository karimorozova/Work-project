<template lang='pug'>
  .container
    form.mainForm(@submit.prevent = 'sendForm')
      .number 
        span 1
        label.asterisk SERVICE TYPE      
      .service-type
        select
          option Select
          option Translation
          option Loacalized Graphic Design
      .number 
        span 2
        label.asterisk SELECT A LANGUAGE
      .language
        span Source Language
        select.source
          option Select
        span Target Language(s)
        select 
          option Select
      .number 
        span 3
        label.asterisk CHOOSE AN INDUSTRY
      .industry
        .industry__item.legal
          i.fa.fa-balance-scale.icon
          p Legal
        .industry__item.hotel
          i.fa.fa-home.icon
          p Hotel &amp;
            br 
            | Real Estates 
        .industry__item.trading
          i.fa.fa-chart-bar.icon
          p CFDs &amp; Online
            br
            | Trading
        .industry__item.crypto
          i.fab.fa-btc.icon
          p ICOs &amp; Crypto-
            br
            | Currency
        .industry__item.casino
          p Casino, Poker
            br
            | &amp; IGaming
        .industry__item.games
          i.fas.fa-gamepad.icon
          p Video Games
        .industry__item.more
          i.fab.fa-btc.icon
          p More
      .number
        span 4
        label PROJECT DETAILS
      .details
        .details__item
          .inner.buttons.upload-file
            span.asterisk Files
            button Upload File(s)
            span Drag &amp; Drop
          .inner.buttons.upload-reference
            span Upload Reference File
            button Upload
            span Type Text
        .details__item
          .inner.date-file.deadline
            span Suggested Deadline
            input(type='date')
            span Select     
          .inner.date-file.file-types
            span Supported File Types
            .supported
              i.fa.fa-home
        .details__brief
          span.details__brief-title Enter a short brief
          textarea(rows='10')
      .number 
        span 5
        label CONTACT DETAILS
      .contact
        .contact__col
          .contact__col-item.name
            span.asterisk Name
            input(type='text')
          .contact__col-item.email
            span.asterisk Email
            input(type='email')
          .contact__col-item.phone
            span Phone Number
            input(type='text')
        .contact__col
          .contact__col-item.skype
            span Skype Name
            input(type='text')
          .contact__col-item.company
            span Company Name
            input(type='email')
          .contact__col-item.website
            span Website
            input(type='text')
      .captcha
        span.asterisk Enter the message <br> as it shown   
        .captcha__image
          img(src='#')
        input.buttons(type='submit' value='Submit')
</template>

<script>
export default {
  name: 'form',
  data () {
    return {
      
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='scss'>
  .container {
    width: 50%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px 40px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }
  form {
    width: 100%;
  }
  select {
    width: 100%;
    margin-bottom: 30px;
    border-radius: 8px;
    background: transparent;
    height: 40px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  }
  label {
    margin-bottom: 20px;
  }
  .language {
    display: flex;
    flex-direction: column;
    padding-top: 20px;
  }
  .service-type {
    padding-top: 20px;
  }

  .industry {
    padding-top: 20px;
    padding-bottom: 30px;   
    display: flex;
    flex-wrap: wrap;
    &__item {
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid black;
      border-radius: 10px;
      width: 30%;
      padding: 2px;
      margin: 5px;
      .icon {
        font-size: 40px;
        padding-right: 10px;
        color: rgba(0, 0, 0, 0.5);
      }   
    }
  }

  .details {
    padding-top: 20px;
    padding-bottom: 30px;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    &__item {
      display: flex;
      flex-direction: column;      
      padding: 20px 60px;
      .inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 20px;
        padding-bottom: 20px;
        .supported {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      .deadline {
        padding-top: 0;
        input {
          border-radius: 10px;
          padding: 5px;
          width: 160px;
        }
      }
      .buttons {
        button {
          background-color: #FF876C;
          color: white;
          width: 180px;
          padding: 10px;
          border-radius: 10px;
        }
      }
    }
    .details__brief {
      width: 100%;
      textarea {
        width: 100%;
      }
    }
  }

  .contact {
    padding-top: 20px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    &__col {
      width: 40%;
      display: flex;
      flex-direction: column;
      padding-top: 20px;
      padding-bottom: 20px;
      &-item {
        display: flex;
        flex-direction: column;
        padding: 10px;
        input {
          border-radius: 10px;
          padding: 10px 5px;
        }
      }
    }
  }

  .number {
    span {
      position: absolute;
      left: 24%;
    }
  }

  .captcha {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    input {
          background-color: #FF876C;
          color: white;
          padding: 10px;
          border-radius: 10px;
        }
  }
  
  .asterisk {
    &:after {
      content: '*';
      color: red;
    }
  }
</style>
