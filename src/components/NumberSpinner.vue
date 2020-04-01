<template>
  <div class="number-spinner">
    <button @click="spinner(value - 1)" class="btn spinnerBtn minus" data="dwn">-</button>
    <div class="spinner">{{ value }}</div>
    <button @click="spinner(value + 1)" class="btn spinnerBtn plus" data="up">+</button>
  </div>
</template>

<script>
export default {
  props: ['value', 'btnSound', 'callSounds'],
  methods: {
    spinner(newVal) {
      this.callSounds(this.btnSound, 'effect');
      // check if value is between 5 and 15
      if (newVal > 15) {
        newVal = 15;
      } else if (newVal < 5) {
        newVal = 5;
      }
      // emit a event 'input' that the v-model in 'App.vue' will catch
      this.$emit('input', newVal);
    },
  },
};
</script>

<style scoped>
.spinner {
  display: inline-block;
  text-align: center;
  background-color: inherit;
  color: rgb(255, 248, 192);
  font-family: inherit;
  width: 40px;
  padding: 20px 30px;
  border-style: solid;
  border-width: 5px;
  border-image-slice: 3;
  border-image-width: 3;
  border-image-repeat: stretch;
  border-image-source: url('data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="8" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M3 1 h1 v1 h-1 z M4 1 h1 v1 h-1 z M2 2 h1 v1 h-1 z M5 2 h1 v1 h-1 z M1 3 h1 v1 h-1 z M6 3 h1 v1 h-1 z M1 4 h1 v1 h-1 z M6 4 h1 v1 h-1 z M2 5 h1 v1 h-1 z M5 5 h1 v1 h-1 z M3 6 h1 v1 h-1 z M4 6 h1 v1 h-1 z" fill="rgb(255,255,255)" /></svg>');
  border-image-outset: 0;
}
</style>
