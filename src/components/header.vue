<template lang="pug">
  header.header
    .container
      .header__wrap
        .header__btn-group
          button.btn.btn_default(type='button', @click='openPopupAdd') Добавить



          a(href='/', @click='refresh').btn.btn_default Обновить

        appSearch



</template>

<script>

  import Datepicker from 'vuejs-datepicker';
  import appSearch from './search'
  import mainBlok from './main.vue'
  export default {

    props: ["event"],

    name: 'my-header',

    components: {
      appSearch,
      mainBlok,
      'date-picker': Datepicker
    },

    data () {
      return {
        email: 'werwer',
        dateNewEvent: '',
        titleEvent: '',

        format: 'yyyy-MM-dd',

        openedPopupAdd: true


      }
    },
    methods: {
      openPicker() {
        this.$refs.programaticOpen.showCalendar();
      },

      formatDate () {
        alert(this.dateNewEvent);
      },
      onLogin (data) {
        this.email = data.email
      },

      openPopupAdd: function () {
        this.$emit('openPopupAdd', this.openedPopupAdd);
      },
      refresh: function () {
        
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .header{
    background: #f4f4f4;
    padding: 56px 0 20px;
    box-shadow: 0 -3px 20px #000;
    &__wrap{
      display: flex;
      justify-content: space-between;
    }
    &__btn-group{
      position: relative;
    }
  }
  .vdp-datepicker *{
    width: 100%;
    margin-bottom: 16px;
    height: 30px;
    font-size: 12px;
    padding: 0 6px;
    border-radius: 3px;
    border: 1px solid #ccc;
    box-shadow: inset 0 1px 1px #ccc;
  }
</style>
