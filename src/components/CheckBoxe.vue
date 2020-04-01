<template>
  <label>
    <input class="checkbox" type="checkbox" :checked="value" @change="change" />
    <span>{{ type }}</span>
  </label>
</template>

<script>
export default {
  props: ['type', 'value', 'btnSound', 'music', 'callSounds', 'stopMusic'],
  methods: {
    change() {
      this.$emit('input', !this.value);

      this.callSounds(this.btnSound, 'effect');
      // check the changed value so if the value is false => start music else stop it
      if (this.type === 'Music' && this.value === false) {
        this.callSounds(this.music, 'music', true);
      } else if (this.type === 'Music' && this.value === true) {
        this.stopMusic(this.music);
      }
    },
  },
};
</script>

<style scoped>
label {
  display: inline-block;
  cursor: inherit;
}
.checkbox {
  /* cursor: inherit; */
  margin-left: 28px;
  appearance: none;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}

.checkbox:checked + span::before {
  width: 3px;
  height: 3px;
  box-shadow: 2px 2px, 4px 2px, 6px 2px, 8px 2px, 10px 2px, 12px 2px, 14px 2px, 18px 2px #92cd41, 20px 2px #92cd41,
    2px 4px, 16px 4px #92cd41, 18px 4px #92cd41, 20px 4px #92cd41, 2px 6px #92cd41, 14px 6px #92cd41, 16px 6px #92cd41,
    2px 8px #92cd41, 4px 8px #92cd41, 12px 8px #92cd41, 14px 8px #92cd41, 2px 10px, 4px 10px #92cd41, 6px 10px #92cd41,
    10px 10px #92cd41, 12px 10px #92cd41, 16px 10px, 2px 12px, 6px 12px #92cd41, 8px 12px #92cd41, 10px 12px #92cd41,
    16px 12px, 2px 14px, 8px 14px #92cd41, 16px 14px, 2px 16px, 4px 16px, 6px 16px, 8px 16px, 10px 16px, 12px 16px,
    14px 16px, 16px 16px;
}

.checkbox + span::before,
.checkbox:checked + span::before {
  position: absolute;
  top: 0;
  left: -28px;
  content: '';
}

.checkbox + span::before {
  color: #fff;
  width: 3px;
  height: 3px;
  box-shadow: 2px 2px, 4px 2px, 6px 2px, 8px 2px, 10px 2px, 12px 2px, 14px 2px, 16px 2px, 2px 4px, 16px 4px, 2px 6px,
    16px 6px, 2px 8px, 16px 8px, 2px 10px, 16px 10px, 2px 12px, 16px 12px, 2px 14px, 16px 14px, 2px 16px, 4px 16px,
    6px 16px, 8px 16px, 10px 16px, 12px 16px, 14px 16px, 16px 16px;
}
.checkbox + span {
  font-size: 20px;
  position: relative;
}
</style>
