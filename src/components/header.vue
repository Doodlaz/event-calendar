<template lang="pug">
  header.header
    .container
      .header__wrap
        .header__btn-group

          button.btn.btn_default(type='button', @click='addEvent = true') Добавить

          .add-event(v-if="addEvent")
            a(href="#", @click='addEvent = !addEvent').add-event__close х
            p(@click="openPicker").add-event__date {{dateNewEvent}}

            date-picker(placeholder="Дата (2018-04-20)", ref="programaticOpen", :format="format", :opened="formatDate", v-model="dateNewEvent")

            input(type='text' placeholder='Название события' v-model='titleEvent').add-event__input
            button.btn.btn_white(type='button', @click='addNewEvent') Создать

          a(href='/').btn.btn_default Обновить

        appSearch



</template>

<script>

  import Datepicker from 'vuejs-datepicker';
  import appSearch from './search'
  import mainBlok from './main.vue'
  export default {

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
        addEvent: false,
        format: 'yyyy-MM-dd',

        event: [
          {
            dateE: '9-4-2018',
            title: 'Напиться!',
            description: 'Витя Костин, Петр Мхайлов'
          },
          {
            dateE: '22-4-2018',
            title: 'ДР!',
            description: 'Дима Молодцов'
          }

        ],

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
      addNewEvent: function () {
        this.event.push({
          dateE: this.newDate,
          title: this.titleEvent,
          description: this.descriptionEvent
        });
        this.newDate = '';
        this.titleEvent = '';
        this.descriptionEvent = '';
        this.addEvent = false;
      }
    },
    hideAdd () {
      this.addEvent = !this.addEvent
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
.add-event{
  text-align: left;
  position: absolute;
  top: 40px;
  background: #fff;
  padding: 24px 20px;
  border: 1px solid #ccc;
  width: 300px;
  z-index: 10;
  &__input{
    width: 100%;
    margin-top: 24px;
    margin-bottom: 16px;
    height: 30px;
    font-size: 12px;
    padding: 0 6px;
    border: 1px solid #ccc;
    box-shadow: inset 0 1px 1px #ccc;
  }
  &__date{
    height: 30px;
    font-size: 12px;
    line-height: 30px;
    padding: 0 6px;
    border: 1px solid #ccc;
    box-shadow: inset 0 1px 1px #ccc;
    position: absolute;
    width: 258px;
    z-index: 1;
    background: #fff;
  }
  &__close{
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 12px;
    color: #777;
    width: 18px;
    height: 18px;
    text-align: center;
    line-height: 18px;
    &:hover{
      color: #fff;
      background: #777;
    }
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
