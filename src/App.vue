<template lang="pug">
  #app.global-wrap
    .add-event(v-if="openedPopup")
      .add-event__wrap
        a(href="#", @click='closePopup').add-event__close х

        //p(@click="openPicker").add-event__date {{dateNewEvent}}
        //date-picker(placeholder="Дата (2018-04-20)", ref="programaticOpen", :format="format", :opened="formatDate", v-model="dateNewEvent")

        input(type='text' placeholder='dateEventEnd' v-model='newEvent.date').add-event__input
        input(type='text' placeholder='titleEvent' v-model='newEvent.title').add-event__input
        input(type='text' placeholder='descEvent' v-model='newEvent.desc').add-event__input

        button.btn.btn_white(type='button', @click='setData') Создать
    .preloader(v-if="loading")
      img(src="static/loading.gif")
    .preloader(v-if="!loading")


      .container(v-if='authorized')
        button.btn.btn_default.btn_sign-out(@click="handleSignoutClick") Sign Out






      app-header(v-if='authorized', @openPopup="openedPopup=$event")
      .login(v-if='!authorized')
        button.btn.btn_default(@click="handleAuthClick") Вход


      .container(v-if="authorized && items")
        pre(v-html="items")


      main(v-if='authorized')
        app-main(:event="event")

</template>



<script>
  const CLIENT_ID = '386151755100-5ju0g8mqqhqtec6a9prchuc5uhdbjd2e.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyBdX5COqAwDLuDnDDh867xv9k4_I3HdPQI';
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
  const SCOPES = 'https://www.googleapis.com/auth/calendar';


  import appHeader from './components/header'
  import appMain from './components/main'

  export default {
    name: 'App',

    components: {
      'app-header': appHeader,
      'app-main': appMain
    },
    data() {
      return {
        loading: true,
        items: undefined,
        api: undefined,
        authorized: false,
        addEvent: false,

        openedPopup: false,

        newEvent: {
          date: '',
          title: '',
          desc: ''
        },

        event: []
      }
    },
    created() {

    },
    mounted() {
      this.api = gapi;
      this.handleClientLoad();
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
          title: '',
          desc: ''
        };
        this.openedPopup = false;
      },

      setData() {

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
          this.event = [];
          this.getData();
          this.closePopup();
        });

      },

      getData() {                                                 /* Вывод событий */
        this.api.client.calendar.events.list({
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
              let event = events[i];
              let when = event.start.dateTime;                    // when полная Дата события со верменем если событие не на весь день
              if (!when) {                                        // Если событие всего дня то берём дату в формте yyyy-mm-dd
                when = event.start.date;
              }else {
                when = when.split('T')[0]                         // Иначе если событие с временем то обрезаем всё после часового пояса что бы получить только дату в формате yyyy-mm-dd
              }
              this.event.push({
                dateE: when,
                title: event.summary,
                desc: event.description
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
    background: #f1f1f1;
    margin: 0;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    font-size: 14px;

  }
  .container{
    width: 900px;
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
      right: 0;
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

  .add-event{
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 1;
    &__wrap{
      text-align: left;
      position: absolute;
      top: 120px;
      left: 0;
      right: 0;
      margin: auto;
      background: #fff;
      padding: 24px 20px;
      border: 1px solid #ccc;
      width: 300px;
      height: 300px;
      z-index: 10;
    }
    &:after{
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
    }
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
</style>
