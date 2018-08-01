<template lang="pug">
  section.calendar
    .container

      button#authorize-button(style="display: none;") Authorize
      button#signout-button(style="display: none;") Sign Out

      .calendar__nav
        a(href="#", @click="prevMonth").calendar__nav-prev ◄
        .calendar__nav-text
          span {{months[toMonth-1]}}
          span {{toYear}}
        a(href="#", @click="nextMonth").calendar__nav-next ►

      ul.calendar__week
        li(v-for="val, i in weekDay").calendar__week-day {{val}}

      ul.calendar__table
        li(v-for="item in dayObj", :class="item.classDay").calendar__day
          span().label-date {{item.newDay}}
          .event
            .event__wrap(v-if="item.date==i.dateE", v-for="i in event")
              p.event__title {{i.title}}
              p.event__description {{i.description}}


</template>

<script>

export default {

  props: ["event"],
  name: 'calendar',

  data () {

    return {
      weekDay: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
      months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],

      dayObj: [],

//      event: [
//        {
//          dateE: '2018-6-10',
//          title: 'Напиться!',
//          description: 'Витя Костин, Петр Мхайлов'
//        },
//        {
//          dateE: '2018-6-15',
//          title: 'ДР!',
//          description: 'Дима Молодцов'
//        }
//
//      ],

      toYear: new Date().getFullYear(), //текущий Год
      toDay: new Date().getDate(), //текущий День Месяца
      toWeek: new Date().getDay(), //текущая День Недели
      toMonth: new Date().getMonth() + 1, //текущий месяц


    }
  },
  components: {

  },
  created(){
    this.createCalendar(this.toYear, this.toMonth) //Вызов Метода который пушит даты текущего месяца в массив day

  },
  mounted(
  ){

  },

  methods: {
    prevMonth: function () {
      if(this.toMonth > 1){
        this.toMonth -= 1;
      } else {
        this.toMonth = 12;
        this.toYear -= 1;
      }
      this.dayObj.length=0;
      this.createCalendar(this.toYear, this.toMonth); //Вызов Метода который пушит даты следующего месяца в массив day
    },
    nextMonth: function () {
      if(this.toMonth < 12){
        this.toMonth += 1;
      } else {
        this.toMonth = 1;
        this.toYear += 1;
      }
      this.dayObj.length=0;
      this.createCalendar(this.toYear, this.toMonth);
    },

    createCalendar: function (year, month) {
      let mon = month - 1; // месяцы в JS идут от 0 до 11, а не от 1 до 12
      let d = new Date(year, mon);
      let dPrev = 32 - new Date(year, mon-1, 32).getDate();

      let toDate = new Date();



      // Заполнить пустые ячейки числами предыдущего месяца
      for (let i = 0; i < this.getDay(d); i++) {
        this.dayObj.push({
          newDay: dPrev - i,
          classDay: 'calendar__other-month'
        });

      }
      // ячейки календаря с датами
      while (d.getMonth() == mon) {

        if(mon == toDate.getMonth() && d.getDate() == toDate.getDate() && d.getFullYear() == toDate.getFullYear()){
          let month = d.getMonth()+1;
          let day = d.getDate();
          if(month < 10){
            month = '0' + month
          }
          if(day < 10){
            day = '0' + day
          }
//          console.log(d.getFullYear() + '-' + month + '-' + day);
          this.dayObj.push({
            newDay: d.getDate(),
            date: d.getFullYear() + '-' + month + '-' + day,
            classDay: 'calendar__to-day'
          });
        } else {
          let month = d.getMonth()+1;
          let day = d.getDate();
          if(month < 10){
            month = '0' + month
          }
          if(day < 10){
            day = '0' + day
          }
          this.dayObj.push({
            newDay: d.getDate(),
            date: d.getFullYear() + '-' + month + '-' + day,
            classDay: ''
          });
        }

        d.setDate(d.getDate() + 1);



      }
      // Заполнить пустые ячейки числами следующего месяца
      if (this.getDay(d) != 0) {
        for (var i = this.getDay(d); i < 7; i++) {
          this.dayObj.push({
            newDay: d.getDate(),
            classDay: 'calendar__other-month'
          });
          d.setDate(d.getDate() + 1)
        }
      }
    },
    getDay: function (date) {
      let day = date.getDay();
      if (day == 0) day = 7;
      return day - 1;
    }

  }

}

</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .calendar{
    &__nav{
      margin: 20px 0;
      display: flex;
      align-items: center;
      &-text{
        min-width: 110px;
        color: #000;
        span {
          margin: 2px;
        }
      }
      &-prev,
      &-next{
        font-size: 7px;
        padding: 7px;
        background: #eee;
        border-radius: 3px;
        color: #676767;
        box-shadow: inset 0 0 2px 1px #a8a8a8;;
        &:hover{
          color: #fff;
          background: #676767;
          box-shadow: none;
        }
      }
    }
    &__week{
      display: flex;
      flex-wrap: wrap;
      border-top: 1px solid #ebebeb;
      border-left: 1px solid #ebebeb;
      &-day{
        color: #999;
      }
    }
    &__table{
      border-left: 1px solid #ebebeb;
      display: flex;
      flex-wrap: wrap;
    }
    &__day,
    &__week-day{
      border-bottom: 1px solid #ebebeb;
      border-right: 1px solid #ebebeb;
      width: calc(100% / 7);
      position: relative;
      text-align: left;

      font-size: 10px;
      vertical-align: top;
    }
    &__day{
      height: 120px;
    }
    &__week-day{
      vertical-align: middle;
      padding: 10px
    }
    &__week-day span{
      display: block;
      text-align: left;
    }
    .label-date{
      position: absolute;
      top: 10px;
      left: 10px;
      color: #666;
    }
    &__to-day{
      background: #e6e6e6;
      .label-date {
        color: #fff;
        text-shadow: 0 1px 2px black;
      }
    }
  }
  .event{
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    &__wrap{
      height: 100%;
      background: #c2e4fe;
      padding: 10px;
      &:first-of-type{
        padding-top: 30px;
      }
      &:not(:first-of-type){
        border-top: 1px solid #a8a8a8;
      }
    }
    &__title{
      font-weight: bold;
      color: #666;
      font-size: 11px;
    }
    &__description{
      color: #666;
    }
  }

  table {
    border-collapse: collapse;
  }

  td,
  th {
    border: 1px solid black;
    padding: 3px;
    text-align: center;
  }

  th {
    font-weight: bold;
    background-color: #E6E6E6;
  }
</style>
