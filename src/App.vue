<template>
  <div id="app">
    <div class="mainMenu" v-if="menu">
      <img class="title" src=".\assets\img\Title\title.gif" alt="Dungeon" />
      <div class="menuSelect">
        <h2 class="mainLinks" @click="toggleGame">New Game</h2>
        <h2 class="mainLinks" @click="toggleOptions">Options</h2>
      </div>
    </div>
    <div id="options" class="mainMenu" v-if="options">
      <img class="title" src="./assets/img/Title/title.gif" alt="Dungeon" />
      <div class="menuSelect">
        <h6>map width :</h6>
        <div class="number-spinner">
          <button @click="spinner" class="btn spinnerBtn minus" data="dwnX">-</button>
          <input class="spinner" v-model="mapX" @input="onlyNumbers('mapX')" @blur="numberLimits('mapX')" type="text" />
          <button @click="spinner" class="btn spinnerBtn plus" data="upX">+</button>
        </div>
        <h6>map height :</h6>
        <div class="number-spinner">
          <button @click="spinner" class="btn spinnerBtn minus" data="dwnY">-</button>
          <input class="spinner" v-model="mapY" @input="onlyNumbers('mapY')" @blur="numberLimits('mapY')" type="text" />
          <button @click="spinner" class="btn spinnerBtn plus" data="upY">+</button>
        </div>

        <h2 class="mainLinks" @click="toggleOptions">Return</h2>
      </div>
    </div>
    <Game v-if="start" :mapX="mapX" :mapY="mapY" @exitGame="toggleGame" />
  </div>
</template>

<script>
import Game from './components/Game.vue';

export default {
  name: 'App',
  components: {
    Game,
  },
  data() {
    return {
      start: false,
      menu: true,
      options: false,
      mapX: 10,
      mapY: 10,
    };
  },
  methods: {
    toggleGame() {
      this.start = !this.start;
      this.menu = !this.menu;
    },
    toggleOptions() {
      this.options = !this.options;
      this.menu = !this.menu;
    },
    // OPTIONS
    spinner(event) {
      switch (event.target.attributes.data.nodeValue) {
        case 'upX':
          this.mapX++;
          if (this.mapX > 15) {
            this.mapX = 15;
          }
          break;
        case 'dwnX':
          this.mapX--;
          if (this.mapX < 5) {
            this.mapX = 5;
          }
          break;
        case 'upY':
          this.mapY++;
          if (this.mapY > 15) {
            this.mapY = 15;
          }
          break;
        case 'dwnY':
          this.mapY--;
          if (this.mapY < 5) {
            this.mapY = 5;
          }
          break;
      }
    },
    // only numbers are possible so remplace anyting else by an empty string.
    // transform the result into an integer
    onlyNumbers(type) {
      this[type] = parseInt(this[type].replace(/[^0-9]/g, ''));
    },
    // limit the numbers from 5 to 15
    numberLimits(type) {
      if (this[type] < 5) {
        this[type] = 5;
      } else if (this[type] > 15) {
        this[type] = 15;
      }
    },
  },
};
</script>

<style>
/* import animate library */
@import './assets/CSS/animate.min.css';

/*  /////////////////////// 
            FONTS
    ////////////////////// */

@font-face {
  font-family: gameOver;
  src: url(./assets/fonts/LVDCGO__.TTF);
}

/*  /////////////////////// 
            APP
////////////////////// */

body {
  margin: 0;
  height: 100vh;
  background-color: rgb(66, 66, 66);
  font-family: gameOver, cursive;
  color: rgb(255, 248, 192);
  cursor: url(./assets/img/Cursor/cursor_player1.png), auto;
}
#app,
#game {
  display: flex;
  justify-content: center;
}
#app {
  height: 100%;
}
#game {
  padding-top: 20px;
}

/*  /////////////////////// 
        BUTTONS
////////////////////// */

.btn {
  border: none;
  cursor: inherit;
  font-family: gameOver, cursive;
  font-size: 16px;
  color: rgb(255, 248, 192);
  margin: 15px;
  display: inline-block;
  position: relative;
  text-align: center;
  padding: 15px;
  text-decoration: none;
}
#menu .btn {
  width: 170px;
}
#menu .btn.disabled,
#menu .btn.disabled:hover,
#menu .btn.disabled:focus {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:before,
.btn:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: content-box;
}
.btn:before {
  top: -6px;
  left: 0;
  border-top: 6px black solid;
  border-bottom: 6px black solid;
}
.btn:after {
  left: -6px;
  top: 0;
  border-left: 6px black solid;
  border-right: 6px black solid;
}
/* Attack/minus Btn */
#attackBtn,
#attackBtn.disabled:hover,
#attackBtn.disabled:focus,
.spinnerBtn.minus {
  background: #ee3e31;
  box-shadow: inset -4px -4px 0px 0px #8c2022;
}
#attackBtn:hover,
#attackBtn:focus,
.spinnerBtn.minus:hover,
.spinnerBtn.minus:focus {
  background: #ce372b;
  box-shadow: inset -6px -6px 0px 0px #8c2022;
}
#attackBtn:active,
.spinnerBtn.minus:active {
  box-shadow: inset 4px 4px 0px 0px #8c2022;
}
/* Defend/plus Btn */
#defendBtn,
#defendBtn.disabled:hover,
#defendBtn.disabled:focus,
.spinnerBtn.plus {
  background: #92cd41;
  box-shadow: inset -4px -4px 0px 0px #4aa52e;
}
#defendBtn:hover,
#defendBtn:focus,
.spinnerBtn.plus:hover,
.spinnerBtn.plus:focus {
  background: #76c442;
  box-shadow: inset -6px -6px 0px 0px #4aa52e;
}
#defendBtn:active,
.spinnerBtn.plus:active {
  box-shadow: inset 4px 4px 0px 0px #4aa52e;
}

/*  /////////////////////// 
        MAIN MENU
////////////////////// */

.mainMenu {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 520px;
  padding: 0 60px;
  background-color: rgb(37, 37, 37);
}

.title {
  width: 640px;
  margin-top: 50px;
}

.menuSelect {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mainLinks {
  font-size: 45px;
  /* justify-self: center; */
  /* align-self: center; */
  color: #8c2022;
  transition: all 0.4s ease-in-out;
}
.mainLinks:hover {
  transform: scale(1.2);
  color: #68181a;
  transition: all 0.4s ease-in-out;
}

#options h6 {
  color: #8c2022;
  font-size: 20px;
}

.spinner {
  text-align: center;
  background-color: inherit;
  color: rgb(255, 248, 192);
  font-family: inherit;
  width: 100px;
  padding: 20px 0;
  border-style: solid;
  border-width: 5px;
  border-image-slice: 3;
  border-image-width: 3;
  border-image-repeat: stretch;
  border-image-source: url('data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="8" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M3 1 h1 v1 h-1 z M4 1 h1 v1 h-1 z M2 2 h1 v1 h-1 z M5 2 h1 v1 h-1 z M1 3 h1 v1 h-1 z M6 3 h1 v1 h-1 z M1 4 h1 v1 h-1 z M6 4 h1 v1 h-1 z M2 5 h1 v1 h-1 z M5 5 h1 v1 h-1 z M3 6 h1 v1 h-1 z M4 6 h1 v1 h-1 z" fill="rgb(255,255,255)" /></svg>');
  border-image-outset: 0;
}
</style>
