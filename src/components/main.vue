<template lang='pug'>
  section.calendar(ref='huy')
  
    .container
      button#authorize-button(style='display: none;') Authorize
      button#signout-button(style='display: none;') Sign Out

      .calendar__nav
        a(href='#', @click='prevMonth').calendar__nav-prev ◄
        .calendar__nav-text
          span {{months[toMonth-1]}}
          span {{toYear}}
        a(href='#', @click='nextMonth').calendar__nav-next ►
    .calendar__container
      ul.calendar__week
        li(v-for='val, i in weekDay').calendar__week-day {{val}}

      ul.calendar__table
        li(v-for='item in dayObj', :class='item.classDay', @click='addEventHere(item.date)').calendar__day
          span().label-date {{item.newDay}}
          .event
            .event__wrap(v-if='item.date==i.dateE', v-for='i in event', @click.stop='openPopupInfo(i)')
              p.event__title {{i.title}}


</template>

<script>

export default {

  props: ['event'],
  name: 'MyMain',

  data () {

    return {
      weekDay: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],

      dayObj: [],

      toYear: new Date().getFullYear(), //текущий Год
      toDay: new Date().getDate(), //текущий День Месяца
      toWeek: new Date().getDay(), //текущая День Недели
      toMonth: new Date().getMonth() + 1, //текущий месяц


      openedPopupInfo: true,

      updateEvent: [],
      newEventDate: ''

    }
  },
  components: {

  },
  created(){
    this.createCalendar(this.toYear, this.toMonth) //Вызов Метода который пушит даты текущего месяца в массив day

  },
  mounted(){

  },

  methods: {
    openPopupInfo: function (item) {

      this.$emit('openPopupInfo', this.openedPopupInfo);

      this.updateEvent[0] = item;
      this.$emit('updateEvent', this.updateEvent);
    },

    addEventHere: function (item) {


      this.newEventDate = item;
      console.log(this.newEventDate);

      this.$emit('newEventDate', this.newEventDate);


      this.$parent.$emit('setEventHere');
    },



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
        let month = d.getMonth();
        if(month < 10){
          month = '0' + month
        }
        this.dayObj.push({
          newDay: dPrev - i,
          date: d.getFullYear() + '-' + month + '-' + (dPrev - i),
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
    },

  }

}

</script>


<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
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
      background: #fff;
      display: flex;
      flex-wrap: wrap;
      border-top: 1px solid #e0e0e0;
      border-left: 1px solid #e0e0e0;
      &-day{
        position: relative;
        z-index: 1;
        color: #757575;
        vertical-align: middle;
        padding: 10px 10px 0;
      }
    }
    &__table{
      border-left: 1px solid #e0e0e0;
      display: flex;
      flex-wrap: wrap;
      height: calc(100vh - 186px);
    }
    &__day,
    &__week-day{
      border-right: 1px solid #e0e0e0;
      width: calc(100% / 7);
      position: relative;
      text-align: left;
      font-size: 10px;
      vertical-align: top;
    }
    &__day{
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      height: calc(100% / 5);
      &:nth-of-type(-n+7){
        &.calendar__to-day{
          &:before{
            content: '';
            display: block;
            background: #f5f5f5;
            width: 100%;
            height: 21px;
            margin-top: -21px;
          }
        }
      }
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
      background: #f5f5f5;
      .label-date {
        color: #fff;
        background: #4285f4;
        border-radius: 50%;
        height: 20px;
        width: 20px;
        top: 5px;
        left: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    &__container{
      position: relative;
      width: 100vw;
    }
  }
  .event{
    max-height: 100%;
    padding-top: 30px;
    font-size: 11px;
    &__wrap{
      cursor: pointer;
      height: 100%;
      background: #039BE5;
      padding: 6px 8px;
      margin: 6px 2px;
      border-radius: 4px;
      .calendar__other-month &{
        opacity: .5;
      }
    }
    &__title{
      font-weight: bold;
      color: #fff;
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
