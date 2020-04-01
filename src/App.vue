<template>
  <div id="app">
    <!-- <audio controls id="myVideo" autoplay loop hidden>
      <source src="./assets/Sounds/ambient/ambient.mp3" type="audio/wav" />
      Your browser does not support the audio element.
    </audio> -->
    <div class="mainMenu" v-if="menu">
      <Title />
      <div class="menuSelect">
        <h2 class="mainLinks" @click="toggleGame">New Game</h2>
        <h2 class="mainLinks" @click="toggleOptions">Options</h2>
      </div>
    </div>
    <div id="options" class="mainMenu" v-if="options">
      <Title />
      <div class="menuSelect">
        <h6>map width :</h6>
        <NumberSpinner v-model="mapX" :callSounds="playSound" />
        <h6>map height :</h6>
        <NumberSpinner v-model="mapY" :callSounds="playSound" />

        <h2 class="mainLinks" @click="toggleOptions">Return</h2>
      </div>
    </div>
    <Game v-if="start" :mapX="mapX" :mapY="mapY" @exitGame="toggleGame" />
  </div>
</template>

<script>
import Game from './components/Game.vue';
import NumberSpinner from './components/NumberSpinner';
import Title from './components/Title';

export default {
  name: 'App',
  components: {
    Game,
    NumberSpinner,
    Title,
  },
  data() {
    return {
      start: false,
      menu: true,
      options: false,
      mapX: 10,
      mapY: 10,
      sounds: {
        select: {
          isPlaying: false,
          file: new Audio(require('./assets/Sounds/menu/select.wav')),
        },
        menu: {
          isPlaying: false,
          file: new Audio(require('./assets/Sounds/ambient/menu.mp3')),
        },
      },
    };
  },
  methods: {
    toggleGame() {
      this.playSound(this.sounds.select);
      if (this.sounds.menu.isPlaying === true) {
        this.stopSound(this.sounds.menu);
      } else {
        this.playSound(this.sounds.menu, true);
      }
      this.start = !this.start;
      this.menu = !this.menu;
    },
    toggleOptions() {
      this.options = !this.options;
      this.menu = !this.menu;
      this.playSound(this.sounds.select);
    },

    playSound(sound, loop) {
      sound.file.play();
      sound.isPlaying = true;
      if (loop) {
        sound.file.loop = true;
      }
    },
    stopSound(sound) {
      sound.file.pause();
      sound.file.currentTime = 0;
      sound.isPlaying = false;
    },
  },
  mounted() {
    this.playSound(this.sounds.menu, true);
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

#app {
  display: flex;
  justify-content: center;
  height: 100%;
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
.btn::-moz-focus-inner {
  border: 0;
}
.btn:focus {
  outline: none;
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

.menuSelect {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mainLinks {
  font-size: 45px;
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
</style>
