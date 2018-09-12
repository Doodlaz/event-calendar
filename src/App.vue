<template lang="pug">
  #app.global-wrap
    //----popups----
    .popup(v-if="openedPopupAdd")
      .popup__wrap
        .popup__head
          .popup__wrap-btn
            a(href="#", @click='closePopup').popup__btn.popup__btn_close
              font-awesome-icon(icon="times").icon

        .popup__body
          date-picker(v-model="newEvent.date", :lang="datePickerLang").popup__input
          input(type='text' placeholder='titleEvent' v-model='newEvent.title').popup__input
          input(type='text' placeholder='descEvent' v-model='newEvent.desc').popup__input

          button.btn.btn_white(type='button', @click='setData') Создать

    .popup(v-if="openedPopupInfo")
      .popup__wrap.event-info.popup__wrap_event-info(v-for="item in updateEvent", :class="{ 'data-edit' : dataEdit, 'event-here' : eventHerePopup }")
        .popup__head
          .popup__wrap-btn
            a(href="#", @click='editEvent', v-if="!dataEdit && !eventHerePopup").popup__btn.popup__btn_edit
              font-awesome-icon(icon="pen").icon
            a(href="#", @click='editEventOk(item.apiId)', v-if="dataEdit && !eventHerePopup").popup__btn.popup__btn_edit
              font-awesome-icon(icon="check").icon
            a(href="#", @click='delEvent(item.apiId)').popup__btn.popup__btn_del
              font-awesome-icon(icon="trash", v-if="!eventHerePopup").icon
              font-awesome-icon(icon="times", v-if="eventHerePopup").icon
            a(href="#", v-if="!eventHerePopup", @click='closePopup').popup__btn.popup__btn_close
              font-awesome-icon(icon="times").icon
              
            .event-info__title(v-if='!dataEdit') {{item.title}}
            input(type='text', v-model='item.title', v-if='dataEdit').event-info__title

        .popup__body
          .event-info__item
            font-awesome-icon(icon="clock").event-info__icon
            input(type='text', v-model='item.dateE', :readonly="!dataEdit").event-info__data

          .event-info__item(v-if="item.desc.length > 1 || dataEdit")
            font-awesome-icon(icon="align-left").event-info__icon
            .event-info__data(v-if='!dataEdit') {{item.desc}}
            textarea(v-model='item.desc', v-if='dataEdit').event-info__data

          .event-info__item(v-if="item.creatorName.length > 1 || dataEdit")
            font-awesome-icon(icon="user").event-info__icon
            p.event-info__text {{item.creatorName}}
            button.btn.btn_default(@click="editEventOk(item.apiId)", v-if="eventHerePopup") Sign Out

    //----popups-END----

    .preloader(v-if="loading")
      img(src="static/loading.gif")
    .global-wrap(v-if="!loading")

      .container(v-if='authorized')
        button.btn.btn_default.btn_sign-out(@click="handleSignoutClick") Sign Out
        
      app-header(:event="event", v-if='authorized', @openPopupAdd="openedPopupAdd=$event")
      .login(v-if='!authorized')
        button.btn.btn_default(@click="handleAuthClick") Вход

      .container(v-if="authorized && items")
        pre(v-html="items")



      main(v-if='authorized')
        app-main(:event="event", @openPopupInfo="openedPopupInfo=$event", @updateEvent="updateEvent=$event", @newEventDate="newEventDate=$event")

</template>



<script>
  const CLIENT_ID = '386151755100-5ju0g8mqqhqtec6a9prchuc5uhdbjd2e.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyBdX5COqAwDLuDnDDh867xv9k4_I3HdPQI';
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
  const SCOPES = 'https://www.googleapis.com/auth/calendar';


  import AppHeader from './components/header'
  import AppMain from './components/main'
  import DatePicker from 'vue2-datepicker'

  export default {
    name: 'App',

    components: {
      AppHeader,
      AppMain,
      DatePicker
    },
    data() {
      return {

        lang: '2018-08-19T21:00:00.000Z',

        loading: true,
        items: undefined,
        authorized: false,
        api: undefined,

        //---Popups---
        openedPopupAdd: false,
        openedPopupInfo: false,
        addEvent: false,
        dataEdit: false,
        eventHerePopup: false,

        //---Events---
        updateEvent: [],
        newEventDate: '',
        newEvent: {
          date: '',
          title: '(Нет заголовка)',
          desc: ''
        },
        event: [],

        //---Datepicker---
        datePickerValue: '',
        datePickerLang: {
          days: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
          months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
          placeholder: {
            date: 'Выберите дату',
            dateRange: 'Select Date Range'
          }
        }

      }
    },
    created() {

    },
    mounted() {

      this.api = gapi;
      this.handleClientLoad();

      this.$on('setEventHere', this.setEventHere);
      this.$on('getData', this.getData);

    },

    methods: {
      
      handleClientLoad() {                                        /* При загрузке вызывается загрузка библиотеки auth2 и клиентской библиотеки API. */

        this.api.load('client:auth2', this.initClient);

      },
      initClient() {                                              /* Инициализирует клиентскую библиотеку API и настраивает слушателей состояния входа. */

        let vm = this;
        vm.api.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(_ => {
                                                                  /* Следить за состоянием входа */
          vm.api.auth2.getAuthInstance().isSignedIn.listen(vm.updateSigninStatus);
          vm.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        });

      },
      updateSigninStatus(isSignedIn) {

        if (isSignedIn) {
          this.authorized = true;
          this.loading = false;
          this.searchByDate();
          this.getData();
        } else {
          this.authorized = false;
          this.loading = false;
        }

      },
      handleAuthClick(event) {                                    /* Вход */

        Promise.resolve(this.api.auth2.getAuthInstance().signIn())
            .then(_ => {
              this.authorized = true;
              this.loading = false;
            });

      },
      handleSignoutClick(event) {                                 /* Выход */

        Promise.resolve(this.api.auth2.getAuthInstance().signOut())
            .then(_ => {
              this.authorized = false;
              this.loading = false;
            });
        this.event = []

      },

      closePopup() {
        this.newEvent = {
          date: '',
          title: '(Нет заголовка)',
          desc: ''
        };
        this.openedPopupInfo = false;
        this.openedPopupAdd = false;
        this.eventHerePopup = false;
        this.dataEdit = false;
        this.event = [];
        this.getData();
      },

      editEvent() {
        this.dataEdit = true; // Резрешить редактирование
      },

      editEventOk(apiId) {

        this.dataEdit = false;  // Запретить редактирование
        let someEvent = {       // Объекат с новыми данными события
          'summary': this.updateEvent[0].title,
          'description': this.updateEvent[0].desc,
          'start': {
            'date': this.updateEvent[0].dateE
          },
          'end': {
            'date': this.updateEvent[0].dateE
          }
        };
        this.api.client.calendar.events.update({    // Обновление события по eventId
          'calendarId': 'primary',
          'eventId': apiId,
          'resource': someEvent, // Объекат с новыми данными события
        }).then(response => {
          this.closePopup();
        });

      },

      delEvent(apiId) {
        this.getData();
        this.api.client.calendar.events.delete({    // Удаление события по eventId
          'calendarId': 'primary',
          'eventId': apiId
        }).then(response => {
          this.closePopup();
        });

      },

      setData() {

        this.newEvent.date = this.$moment(this.newEvent.date).format('YYYY-MM-DD');

        let someEvent = {
          'summary': this.newEvent.title,
          'description': this.newEvent.desc,
          'start': {
            'date': this.newEvent.date
          },
          'end': {
            'date': this.newEvent.date
          }
        };

        this.api.client.calendar.events.insert({
          'calendarId': 'primary',
          'resource': someEvent,
        }).then(response => {
          this.closePopup();
        });

      },

      setEventHere() {
        console.log('setEventHere()');
        let setEvent = {
          'summary': this.newEvent.title,
          'description': this.newEvent.desc,
          'start': {
            'date': this.newEventDate
          },
          'end': {
            'date': this.newEventDate
          }
        };

        this.api.client.calendar.events.insert({
          'calendarId': 'primary',
          'resource': setEvent,
        }).then(response => {
          this.searchByDate(this.newEventDate);
          this.openedPopupInfo = true;
          this.dataEdit = true;
          this.getData();
          this.eventHerePopup = true;
        });

      },

      searchByDate(date) {
        console.log(date);
        let api = gapi;
        api.client.calendar.events.list({
          'calendarId': 'primary',
          'singleEvents': true,
          'orderBy': 'startTime'
        }).then(response => {

          let events = response.result.items;

          let i = 0;
          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {                 // перебор событий
              let event = events[i],
                  when = event.start.dateTime,                    // when полная Дата события со верменем если событие не на весь день
                  eId = event.id;
              if (!when) {                                        // Если событие всего дня то берём дату в формте yyyy-mm-dd
                when = event.start.date;
              }else {
                when = when.split('T')[0]                         // Иначе если событие с временем то обрезаем всё после часового пояса что бы получить только дату в формате yyyy-mm-dd
              }

              console.log(when + ' when');

              let creatorName = event.creator.displayName;
              if(creatorName == undefined){
                creatorName = '';
              }
              if(when == date){
                
                this.updateEvent[0] = {
                  id: 'ev-' + i,
                  apiId: eId,
                  dateE: when,
                  title: this.newEvent.title,
                  desc: this.newEvent.desc,
                  creatorEmail: event.creator.email,
                  creatorName: creatorName
                };
                
              }

            }
          }
        });
      },

      getData() {                                                 /* Вывод событий */
        this.event = [];
        let api = gapi;
        api.client.calendar.events.list({
          'calendarId': 'primary',
          //'timeMin': (new Date()).toISOString(),                //Cобытия которые только будут
          //'showDeleted': true,                                  //Показывать удаленные события
          'singleEvents': true,
          'maxResults': 100,
          'orderBy': 'startTime'
        }).then(response => {

          let events = response.result.items;

          let i = 0;
          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {                 // перебор событий
              let event = events[i],
                  when = event.start.dateTime,                    // when полная Дата события со верменем если событие не на весь день
                  eId = event.id;
              if (!when) {                                        // Если событие всего дня то берём дату в формте yyyy-mm-dd
                when = event.start.date;
              }else {
                when = when.split('T')[0]                         // Иначе если событие с временем то обрезаем всё после часового пояса что бы получить только дату в формате yyyy-mm-dd
              }
              let desc = event.description;
              if(desc == undefined){
                desc = '';
              }

              let creatorName = event.creator.displayName;
              if(creatorName == undefined){
                creatorName = '';
              }


              this.event.push({
                id: 'ev-' + i,
                apiId: eId,
                dateE: when,
                title: event.summary,
                desc: desc,
                creatorEmail: event.creator.email,
                creatorName: creatorName
              });


            }
          } else {

            alert('Событий нет');                                 // Если нет ни одного события.
          }
        });
      }
    }

  }
</script>



<style lang="scss">
  *{
    box-sizing: border-box;
    font-size: 100%;
    outline: none;
    text-decoration: none;
    color: #000;
    margin: 0;
    padding: 0;
    list-style: none;

  }
  a, input, button{
    transition: .3s;
  }

  ::-webkit-input-placeholder {color:#ccc;}
  ::-moz-placeholder          {color:#ccc;}/* Firefox 19+ */
  :-moz-placeholder           {color:#ccc;}/* Firefox 18- */
  :-ms-input-placeholder      {color:#ccc;}

  body{
    margin: 0;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    font-size: 14px;
  }
  input,
  textarea{
    width: 100%;
    padding: 0 6px;
    border: 1px solid #ccc;
    font-size: 14px;
    border-radius: 4px;
  }
  input{
    height: 30px;
  }
  textarea{
    font-family: 'Avenir', Helvetica, Arial, sans-serif;

  }
  .container{
    padding: 0 20px;
    max-width: 100%;
    margin: 0 auto;
    position: relative;
    pre{
      text-align: left;
    }
  }
  .btn{
    cursor: pointer;
    border: none;
    border-radius: 3px;
    padding: 5px 12px;
    margin-right: 10px;
    outline: none;
    &_default{
      background: #0271c7;
      color: #fff;
      &:hover{
        background: #015da4;
      }

    }
    &_white{
      background: #fff;
      color: #000;
      border: 1px solid #000;
      &:focus,
      &:hover{
        color: #fff;
        background: #000;
      }
    }
    &_sign-out{
      position: absolute;
      right: 20px;
      top: 15px;
      margin: 0;
    }
  }
  .login{
    width: 400px;
    height: 200px;
    background: #eee;
    position: fixed;
    margin: auto;
    top: 100px;
    left: 0;
    right: 0;
    border-radius: 8px;
    border: 1px solid #ddd;
    button{
      position: absolute;
      margin: auto;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: none;
      border-radius: 10px;
      height: 40px;
      width: 300px;
    }
  }


  .authentification {
    margin: 20px;
    text-align: center;
  }

  hr {
    border: 1px solid black;
    margin: 30px;
  }

  pre {
    outline: 1px solid #ccc;
    padding: 5px;
    margin: 5px;
    overflow-x: auto;
  }

  .string {
    color: green;
  }

  .number {
    color: purple;
  }

  .boolean {
    color: blue;
  }

  .null {
    color: magenta;
  }

  .key {
    color: black;
  }

  .popup{
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 10;
    &__wrap{
      text-align: left;
      position: absolute;
      top: 120px;
      left: 0;
      right: 0;
      margin: auto;
      background: #fff;
      border: 1px solid #ccc;
      width: 460px;
      z-index: 10;
      padding: 0;
      border-radius: 4px;
      min-height: 0;

      &-btn{
        padding: 10px;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      &_event-info{
        .popup__body{
          padding: 0 20px;
        }
      }
    }

    &__head{
      background: #039BE5;
      min-height: 60px;
      display: flex;
      padding-left: 10px;
      .event-here & {
        background: #fff;
      }
    }
    &__body{
      background: #fff;
      padding: 20px;
    }

    &__btn{
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: #fff;
      .icon{
        transition: .3s;
        opacity: .8;
        path {
          fill: #fff;
          .event-here & {
            fill: #000;
          }
        }
      }
      &:hover{
        background: rgba(255, 255, 255, 0.15);
        .icon{
          opacity: 1;
        }
      }

      &_close{}
      &_edit{}
      &_del{}
    }


    &:after{
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
    }
    &__input{
      width: 100%;
      margin-bottom: 20px;
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

  .event-info{
    &__item{
      display: flex;
      min-height: 54px;
      &:not(:last-of-type) {
        border-bottom: 1px solid #eee;
      }
    }
    input,
    textarea{
      width: 100%;
      font-size: 14px;
      height: auto;
      transition: .3s;
      border: 1px solid transparent;
    }
    textarea{
      min-height: 140px;
    }
    &__title{
      padding: 7px 0;
      margin: 10px 10px 0 30px;
      width: 100%;
      font-size: 16px;
      color: #ffffff;
      border: none;
      border-bottom: 1px solid transparent;
      background: none;
      box-shadow: none;
      .event-here & {

      }
    }
    &__data{
      padding: 17px 0;
      transition: border .3s;
      border: 1px solid transparent;
      resize: none;
    }
    &__text{
      padding: 19px 0;
    }
    &__icon{
      margin: 20px 16px 0 0;

    }
    &.data-edit{
      .event-info__title{
        padding: 7px 8px;
        margin-left: 22px;
        border-color: rgba(255, 255, 255, 0.8);
      }
      .event-info__data{
        padding: 7px 8px;
        margin-left: -8px;
        border-color: #ccc;
        background: rgba(204, 204, 204, 0.1);
      }
      .event-info__text{
        padding: 7px 8px;
        margin-left: -8px;
      }
      .event-info__item{
        border: none;
        padding: 10px 0 11px;
        &:last-of-type{
          padding-bottom: 10px;
        }
      }
      .event-info__icon{
        margin: 7px 16px 0 0;
      }
      input,
      textarea{
        border-color:  #ccc;
      }
    }
  }
  .event-here.data-edit{
    .event-info__title{
      color: #000;
      border-color: #ccc;
      background: rgba(204, 204, 204, 0.1);
    }

  }
  .preloader{
    width: 100vw;
    height: 100vh;
    background: #f1f1f1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

</style>
