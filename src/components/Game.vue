<template>
  <div id="game">
    <div id="board">
      <!-- <div class="mapRow" x="1">
        <div class="tile wall" y="1">
          <div class="player1 player"></div>
          <div class="axe weapons"></div>
        </div>
      </div> -->
    </div>
    <div id="menu">
      <h2>MENU</h2>
      <div id="charSheet">
        <div class="character knight">
          <h3>KNIGHT</h3>
          <p>Life: <span id="player1Life"></span></p>
          <p>Weapon: <span id="player1Weapon"></span></p>
          <p>Damage: <span id="player1Damage"></span></p>
        </div>
        <div class="character mage">
          <h3>MAGE</h3>
          <p>Life: <span id="player2Life"></span></p>
          <p>Weapon: <span id="player2Weapon"></span></p>
          <p>Damage: <span id="player2Damage"></span></p>
        </div>
      </div>
      <div class="menuBtn">
        <button id="attackBtn" class="btn disabled">Attack</button>
        <button id="defendBtn" class="btn disabled">Defend</button>
      </div>
      <div class="combatLog">
        <ul></ul>
      </div>
      <div class="menuLinks">
        <a class="links showModal">Rules</a>
        <a class="returnLink links">Exit Game</a>
      </div>
    </div>
    <div class="modal">
      <div class="modalContent character">
        <h3>Rules</h3>
        <span class="links close">X</span>
        <p class="rules">+ You can move up to 3 tiles per turn</p>
        <p class="rules">+ Stop on a tile containing a weapon to grab it</p>
        <p class="rules">+ A combat to the death start when you are in a tile next to the other hero</p>
        <p class="rules">+ Weapons damages :</p>
        <div class="weaponWrapper">
          <div class="weaponRule"><img src="../assets/img/Weapons/club.png" alt="Club" /><span>: 15</span></div>
          <div class="weaponRule"><img src="../assets/img/Weapons/hammer.png" alt="Hammer" /><span>: 20</span></div>
          <div class="weaponRule"><img src="../assets/img/Weapons/axe.png" alt="Axe" /><span>: 20</span></div>
          <div class="weaponRule"><img src="../assets/img/Weapons/sword.png" alt="Sword" /><span>: 25</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// make the jQuery $ accesible
global.jQuery = require('jquery');
const $ = global.jQuery;
window.$ = $;

export default {
  props: {
    mapX: {
      default: 10,
    },
    mapY: {
      default: 10,
    },
    musicOn: {
      type: Boolean,
    },
    effectsOn: {
      type: Boolean,
    },
  },
  mounted: function () {
    //  ///////////////////////////////////
    //    VARIABLES, OBJECTS AND ARRAYS
    //  /////////////////////////////////

    // VARIABLES
    const tilePercentage = 80;
    const messageDelay = 1000;
    // used to emit event to the vue part of the app
    const self = this;
    // props send by the vue part of the app
    const mapWidth = this.mapX;
    const mapHeight = this.mapY;
    const musicOn = this.musicOn;
    const effectsOn = this.effectsOn;

    // MAP
    let map = [];

    // SOUNDS
    const sounds = {
      fist: [
        new Audio(require('../assets/Sounds/fist/fist1_sound.mp3')),
        new Audio(require('../assets/Sounds/fist/fist2_sound.mp3')),
        new Audio(require('../assets/Sounds/fist/fist3_sound.mp3')),
        new Audio(require('../assets/Sounds/fist/fist4_sound.mp3')),
      ],
      weapons: [
        new Audio(require('../assets/Sounds/weapons/weapon1_sound.flac')),
        new Audio(require('../assets/Sounds/weapons/weapon2_sound.flac')),
        new Audio(require('../assets/Sounds/weapons/weapon3_sound.flac')),
        new Audio(require('../assets/Sounds/weapons/weapon4_sound.flac')),
      ],
      blocked: [
        new Audio(require('../assets/Sounds/weapons/block_blade1.wav')),
        new Audio(require('../assets/Sounds/weapons/block_blade2.wav')),
        new Audio(require('../assets/Sounds/weapons/block_blunt1.wav')),
        new Audio(require('../assets/Sounds/weapons/block_blunt2.wav')),
      ],
      shield: [new Audio(require('../assets/Sounds/defend/shield.wav'))],
      walk: [
        new Audio(require('../assets/Sounds/walk/1steps.mp3')),
        new Audio(require('../assets/Sounds/walk/2steps.mp3')),
        new Audio(require('../assets/Sounds/walk/3steps.mp3')),
      ],
      menu: [new Audio(require('../assets/Sounds/menu/select.wav'))],
      victory: [new Audio(require('../assets/Sounds/victory.mp3'))],
      combat: [new Audio(require('../assets/Sounds/fight.mp3'))],
      ambients: [
        new Audio(require('../assets/Sounds/ambient/ambient1.mp3')),
        new Audio(require('../assets/Sounds/ambient/ambient2.mp3')),
        new Audio(require('../assets/Sounds/ambient/ambient3.mp3')),
      ],
    };

    // WEAPONS
    // to add weapon : key must be the same as the 'name' value and the name of the '.png'
    const weapons = {
      fist: {
        name: 'fist',
        damage: 10,
        img: require('../assets/img/Weapons/fist.png'),
      },
      sword: {
        name: 'sword',
        damage: 25,
        position: [],
        img: require('../assets/img/Weapons/sword.png'),
      },
      hammer: { name: 'hammer', damage: 20, position: [], img: require('../assets/img/Weapons/hammer.png') },
      axe: {
        name: 'axe',
        damage: 20,
        position: [],
        img: require('../assets/img/Weapons/axe.png'),
      },
      club: { name: 'club', damage: 15, position: [], img: require('../assets/img/Weapons/club.png') },
    };

    // PLAYERS
    let player1 = {
      name: 'player1',
      coolName: 'Knight',
      life: 100,
      weapon: { name: weapons.fist.name, damage: weapons.fist.damage },
      defending: false,
      position: [],
      img: require('../assets/img/Players/knight_idle-sprit.png'),
      cursorImg: require('../assets/img/Cursor/cursor_player1.png'),
    };
    let player2 = {
      name: 'player2',
      coolName: 'Mage',
      life: 100,
      weapon: { name: weapons.fist.name, damage: weapons.fist.damage },
      defending: false,
      position: [],
      img: require('../assets/img/Players/mage_idle-sprit.png'),
      cursorImg: require('../assets/img/Cursor/cursor_player2.png'),
    };

    //  /////////////////////////
    //      MAP GENERATION
    //  /////////////////////////

    function pushTile(index, className) {
      map[index].push({ tileType: className });
    }
    // chose if a tile is a wall or not
    function chooseTile() {
      const rdm = randomPicker(100);
      // % of tile are normale floor
      if (rdm > tilePercentage) {
        return 'wall';
      } else {
        return 'floor';
      }
    }
    // choose the position of a object in the map grid
    function chooseCoordObj(x, y) {
      let coordX, coordY, position;
      do {
        coordX = randomPicker(x);
        coordY = randomPicker(y);
        position = map[coordX][coordY];
        // test if the chosen tile is a floor (not a wall) and don't have another object yet
      } while (position.tileType !== 'floor' || 'obj' in position);

      return [coordX, coordY];
    }

    // choose the place of an object and place it in the map array
    function placeObj(obj, x, y) {
      obj.position = chooseCoordObj(x, y);
      map[obj.position[0]][obj.position[1]].obj = obj.name;
    }

    // randomly choose style of the floors tiles
    function floorStyling() {
      const rand = randomPicker(100);
      if (rand < 5) {
        return require('../assets/img/Map/Floors/floor_2.png');
      } else if (rand >= 5 && rand < 15) {
        return require('../assets/img/Map/Floors/floor_3.png');
      } else if (rand >= 15 && rand < 18) {
        return require('../assets/img/Map/Floors/floor_4.png');
      } else if (rand >= 18 && rand < 28) {
        return require('../assets/img/Map/Floors/floor_5.png');
      } else {
        return require('../assets/img/Map/Floors/floor_1.png');
      }
    }
    // render tiles and objects from the map array
    function renderTile() {
      for (let i = 0; i < map.length; i++) {
        // put a x prop to easily know where we are in game
        $('#board').append(`<div class="mapRow" x=${i}></div>`);
        for (let j = 0; j < map[i].length; j++) {
          const loc = map[i][j];
          // put a y prop to easily know where we are in game
          $('.mapRow:last').append(`<div class=" tile ${loc.tileType}" y=${j}></div>`);
          if (loc.tileType === 'floor') {
            $('.floor:last').css('backgroundImage', `url(${floorStyling()})`);
          }
          // add the object if it exist
          if ('obj' in loc) {
            const obj = loc.obj;
            if (obj === 'player1' || obj === 'player2') {
              $('.floor:last').append(`<div class="${obj} player"></div>`);
            } else {
              $('.floor:last').append(`<div class="${obj} weapons"></div>`);
              $('.weapons:last').css('backgroundImage', `url(${weapons[obj].img})`);
            }
          }
        }
      }
    }

    function generateMap(x, y) {
      // MAP
      // loop to create the map that's x long et y wide, +2 for the inaccessible border (create a bidimensional array)
      for (let i = 0; i < x + 2; i++) {
        map[i] = [];
        for (let j = 0; j < y + 2; j++) {
          // create the border
          if (i === 0) {
            if (j === 0) {
              pushTile(i, 'wall sideTopLeft');
            } else if (j === y + 1) {
              pushTile(i, 'wall sideTopRight');
            } else {
              pushTile(i, 'wall topBotLimit');
            }
          } else if (i === x + 1) {
            if (j === 0) {
              pushTile(i, 'wall sideBottomLeft');
            } else if (j === y + 1) {
              pushTile(i, 'wall sideBottomRight');
            } else {
              pushTile(i, 'wall topBotLimit');
            }
          } else if (j === 0 || j === y + 1) {
            pushTile(i, 'wall sideLimit');

            // choose the tile type (wall or floor) if it's not a border
          } else {
            map[i].push({ tileType: chooseTile() });
          }
        }
      }
      // WEAPONS
      // create an array of the keys of the weapons obj to loop through
      const weaponsArray = Object.keys(weapons);
      weaponsArray.forEach((weapon) => {
        // choose position of weapon and put it in the map array the weapons obj except 'fist'
        if (weapon !== 'fist') {
          placeObj(weapons[weapon], x, y);
        }
      });
      // PLAYERS
      // place 'player1'
      placeObj(player1, x, y);
      // place 'player2' and check if it's not adjacent from 'player1', if true replace it
      do {
        placeObj(player2, x, y);
        // delete the obj if the player2 is adjacent to player1
        if (checkIfAdjacent()) {
          delete map[player2.position[0]][player2.position[1]].obj;
        }
      } while (checkIfAdjacent());

      // render the map
      renderTile();

      // put the life of the players in their respective char sheet
      updateUILife(player1);
      updateUILife(player2);
      // put the weapon and damage of the players in their respective char sheet
      updateUIWeapon(player1);
      updateUIWeapon(player2);
    }

    //  /////////////////////////
    //            GAME
    //  /////////////////////////

    //  /////////////////////////
    //         MOVEMENT
    //  /////////////////////////

    // select vertical move
    function verticalMove(element, player) {
      let move = $();
      // select the column of the player by looking at the 'y' propety
      const col = parseInt($(`.${player.name}`).parent().attr('y'));
      // add the tile of the column 'col' to 'move' and return move
      element.each((_i, el) => {
        move = move.add($(el).children(`:nth-child(${col + 1})`));
      });

      return move;
    }
    // highlight possible move tile expect if there is wall or player in the way
    function moveHighlight(element) {
      element.each((i, el) => {
        // check if there is a wall if true => break the loop
        if ($(el).hasClass('wall')) {
          return false;
        }
        // check if the other player is in the way if true => break the loop
        if ($(el).children().hasClass('player2') || $(el).children().hasClass('player1')) {
          return false;
        }
        //  add class 'movement' for highlight and data for walking sounds
        $(el).addClass('movement').data('walk', i);
      });
    }

    function displayMove(player) {
      const playerTile = $(`.tile:has(.${player.name})`);
      // vertical moves
      // move up
      // select the 3 upper row
      const topRow = playerTile.parent().prevAll(':lt(3)');

      // select the 3 tile in the player column from the rows passed in argument
      // reverse the jquery object because the result of .add() return in doc order
      let movTop = $(verticalMove(topRow, player).get().reverse());
      // move down
      // same as move up without the reversing
      const bottomRow = playerTile.parent().nextAll(':lt(3)');
      const movBottom = verticalMove(bottomRow, player);

      // horizontal moves
      // select the next/previous tile in col of the player
      const movRight = playerTile.nextAll(':lt(3)');
      const movLeft = playerTile.prevAll(':lt(3)');

      // highlight all the possible movements
      moveHighlight(movTop);
      moveHighlight(movBottom);
      moveHighlight(movRight);
      moveHighlight(movLeft);
    }
    // remove the 'movement' class and the data(for the walking sounds)
    function removeMoveHighlight() {
      $('.movement').off().removeClass('movement').removeData('walk');
    }

    function movePlayer(target, player) {
      // play sound depending of the number of tile walked
      playSounds('walk', $(target).data().walk);

      // remove player from his tile
      $(`.${player.name}`).remove();
      // move player to the clicked tile
      $(target).append(`<div class="${player.name} player"></div>`);

      // update the position in the 'player' object
      updatePosition(player, target);

      // remove the click event and the 'movement' class
      removeMoveHighlight();
    }

    //  /////////////////////////
    //            WEAPONS
    //  /////////////////////////

    // place the weapon where the player is
    function addWeapon(player, weapon) {
      $(`.${player.name}`).parent().append(`<div class="${weapon} weapons"></div>`);
      $(`.${weapon}`).css('backgroundImage', `url(${weapons[weapon].img})`);
    }

    function moveWeapon(player, weapon) {
      if (weapon.name !== 'fist') {
        // remove de div of the weapon
        $(`.${weapon.name}`).remove();
        // replace it where the player is
        addWeapon(player, weapon.name);
        // update position of the weapon
        updatePosition(weapon, $(`.${player.name}`).parent()[0]);
      }
    }

    // check if the player is on a tile with a weapon
    function checkWeapons(player) {
      const posX = player.position[0];
      const posY = player.position[1];
      let newWeapon;
      //  create a array of the values of the 'weapons' object to loop trough
      const weaponsArray = Object.values(weapons);
      weaponsArray.forEach((weapon) => {
        if (weapon.name !== 'fist') {
          if (posX === weapon.position[0] && posY === weapon.position[1]) {
            newWeapon = weapon;
          }
        }
      });
      // if there is a new weapon move it with the player
      if (newWeapon) {
        // place the new weapon in front of the player
        moveWeapon(player, newWeapon);
        // place the old weapon in the same tile as the player
        moveWeapon(player, weapons[player.weapon.name]);

        // add the new weapon to the 'player' object
        player.weapon.name = newWeapon.name;
        player.weapon.damage = newWeapon.damage;
        // update UI
        updateUIWeapon(player);
      } else {
        // if there is no new weapon : move weapon's player with him
        moveWeapon(player, weapons[player.weapon.name]);
      }
    }

    //  /////////////////////////
    //          COMBAT
    //  /////////////////////////

    // add the turn number and who's turn it is in the combat log
    function turnLog(player, turn) {
      $('#menu ul').prepend(`<li class="${player.name}Turn">${player.coolName}'s turn</li>`);
      $('#menu ul').prepend(`<li class="">Turn : ${turn}</li>`);
    }

    function attack(attacker, defender) {
      let damage;
      // check if the defender defenses himself if true divides by 2 the damage
      if (defender.defending) {
        damage = attacker.weapon.damage / 2;
      } else {
        damage = attacker.weapon.damage;
      }
      // substract the attacker's damage of the defendre's life
      defender.life = defender.life - damage;
      // update the life of the defender
      updateUILife(defender);

      return damage;
    }
    // disabled combat button for the time of the message + exit animation
    function disabledCombatBtn() {
      $('#attackBtn').prop('disabled', true);
      $('#defendBtn').prop('disabled', true);
      setTimeout(() => {
        $('#attackBtn').prop('disabled', false);
        $('#defendBtn').prop('disabled', false);
      }, messageDelay + 200);
    }

    function attackTurn(attacker, defender, turn) {
      // attack and save the damage
      const damage = attack(attacker, defender);

      // attack animation and sounds
      const attackerWeapon = attacker.weapon.name;
      // if the weapon is not a fist play a sound
      if (attackerWeapon !== 'fist') {
        // if the defender is defending play a random 'blocked' sound otherwise play a random attack sound
        if (defender.defending) {
          playSounds('blocked', randomPicker(sounds.weapons.length));
        } else {
          playSounds('weapons', randomPicker(sounds.weapons.length));
        }
        // weapon animation
        $(`.${attackerWeapon}`).addClass('animWeapon');
      } else {
        // if the weapon is a fist plays a random 'fist' sound and an animation
        playSounds('fist', randomPicker(sounds.fist.length));
        $(`.${attacker.name}`).siblings('.weapons').addClass('animFist');
      }
      // reset the defence of the defender
      defender.defending = false;
      // continue after the attack animation
      setTimeout(() => {
        // remove the animation class of the weapons
        $(`.${attackerWeapon}`).removeClass('animWeapon animFist');
        // put the attack in the combat log
        $('#menu ul').prepend(
          `<li class="${attacker.name}Turn">${attacker.coolName} attacks ${defender.coolName} for ${damage} damages</li>`
        );
        turnLog(attacker, turn);
        // check if the defender is dead
        if (checkDead(defender)) {
          // stop the game
          win(attacker);
          return;
        } else {
          showTurn('turn', defender);
        }
      }, 300);
    }

    function defend(player, turn) {
      playSounds('shield', 0);
      // change the defending status of the player
      player.defending = true;
      // put the defence in the combat log
      $('#menu ul').prepend(`<li class="${player.name}Turn">${player.coolName} chooses to defend himself</li>`);
      turnLog(player, turn);
    }

    function Combat(player) {
      // Announce Combat
      playSounds('combat', 0);
      showTurn('combat');
      // setTimeout of the time the message displays + the time of the exit animation
      setTimeout(() => {
        // show who's playng the combat turn
        showTurn('turn', player);
        // show fist for the players that have no weapon
        if (player1.weapon.name === 'fist') {
          addWeapon(player1, 'fist');
        }
        if (player2.weapon.name === 'fist') {
          addWeapon(player2, 'fist');
        }

        // select the first player to play
        let firstPlayer, secondPlayer;
        if (player === player1) {
          firstPlayer = player1;
          secondPlayer = player2;
        } else {
          firstPlayer = player2;
          secondPlayer = player1;
        }
        let turns = 1;
        // make the attack/defend buttons usable
        $('#menu .btn').removeClass('disabled');
        // attack btn
        $('#attackBtn').click(() => {
          // disable button for the time of the annoucement + exit anim
          disabledCombatBtn();

          // check if turn is odd, if odd the firstPlayer play else the second one
          // change the cursor for the next player
          if (turns % 2 !== 0) {
            attackTurn(firstPlayer, secondPlayer, turns);
            changeCursor(secondPlayer);
          } else {
            attackTurn(secondPlayer, firstPlayer, turns);
            changeCursor(firstPlayer);
          }
          turns += 1;
        });
        // defend btn
        $('#defendBtn').click(() => {
          // disable button for the time of the annoucement + exit anim
          disabledCombatBtn();
          // check if turn is odd, if odd the firstPlayer play else the second one
          // change the cursor for the next player
          if (turns % 2 !== 0) {
            defend(firstPlayer, turns);
            changeCursor(secondPlayer);
            showTurn('turn', secondPlayer);
          } else {
            defend(secondPlayer, turns);
            changeCursor(firstPlayer);
            showTurn('turn', firstPlayer);
          }
          turns += 1;
        });
      }, messageDelay + 200);
    }

    //  /////////////////////////
    //          GENERAL
    //  /////////////////////////

    // SOUNDS

    function playSounds(type, soundIndex, loop) {
      // check if musics or effects are on if not don't play them(return)
      if (type === 'ambients' && !musicOn) {
        return;
      } else if (type !== 'ambients' && !effectsOn) {
        return;
      }
      // reset the current time of the sound to 0 and play it
      sounds[type][soundIndex].currentTime = 0;
      sounds[type][soundIndex].play();
      // make the sound loop if needed
      if (loop) {
        sounds[type][soundIndex].loop = true;
      }
    }
    function stopSounds(sound) {
      sound.pause();
      sound.currentTime = 0;
    }

    function randomPicker(number) {
      return Math.floor(Math.random() * number);
    }

    function updateUILife(player) {
      $(`#${player.name}Life`).text(`${player.life}`);
    }

    function updateUIWeapon(player) {
      $(`#${player.name}Weapon`).text(`${player.weapon.name}`);
      $(`#${player.name}Damage`).text(`${player.weapon.damage}`);
    }
    // check if a player's life is less than 0
    function checkDead(player) {
      const life = player.life;
      if (life <= 0) {
        return true;
      } else {
        return false;
      }
    }
    function win(winner) {
      playSounds('victory', 0);
      // disable the attack/defend buttons and remove the click event
      $('.btn').addClass('disabled').off();
      // show the game over message
      $('#board').addClass('overlay').append(`
        <h1 class="overlayText winner win${winner.name}">${winner.coolName} won !</h1>
        <h2 class="overlayText links returnLink">Return</h2>
        `);
      $('.overlayText').addClass('animated bounceIn');
      // return to the menu ( emit a event that's catched by app.vue)
      $('.returnLink').click(() => {
        sounds.ambients.forEach((sound) => {
          stopSounds(sound);
        });
        self.$emit('exitGame');
      });

      return;
    }

    // check if playes are adjacent to each other
    function checkIfAdjacent() {
      const pos1 = player1.position;
      const pos2 = player2.position;
      const isAdjacent =
        (pos1[0] === pos2[0] + 1 && pos1[1] === pos2[1]) ||
        (pos1[0] === pos2[0] - 1 && pos1[1] === pos2[1]) ||
        (pos1[0] === pos2[0] && pos1[1] === pos2[1] + 1) ||
        (pos1[0] === pos2[0] && pos1[1] === pos2[1] - 1);
      if (isAdjacent) {
        return true;
      } else {
        return false;
      }
    }
    // update the position of an object by getting the 'x' and 'y' attributes
    function updatePosition(obj, target) {
      const positionX = parseInt($(target).parent().attr('x'));
      obj.position[0] = positionX;
      const positionY = parseInt($(target).attr('y'));
      obj.position[1] = positionY;
    }

    function changeTurn(player) {
      // restart a turn with the next player
      if (player === player1) {
        play(player2);
      } else if (player === player2) {
        play(player1);
      }
    }

    function changeCursor(player) {
      $('body').css('cursor', `url(${player.cursorImg}), auto`);
    }

    function showTurn(type, player) {
      // show who's turn it is
      $('#board').addClass('overlay');
      if (type === 'turn') {
        $('#board').append(`<h1 class="overlayText ${player.name}Announce">${player.coolName}'turn</h1>`);
      } else if (type === 'combat') {
        $('#board').append(`<h1 class="overlayText winner">Combat !</h1>`);
      }

      $('.overlayText').addClass('animated bounceIn');
      setTimeout(() => {
        // hide the text after 1s
        $('#board').removeClass('overlay');
        $('.overlayText').addClass('animated zoomOut');
      }, messageDelay);
      setTimeout(() => {
        // remove the div after the exit animation
        $('.overlayText').remove();
      }, messageDelay + 200);
    }

    function play(player) {
      showTurn('turn', player);
      // set a time of the annoucement + exit anim
      setTimeout(() => {
        // change the cursor acording to the player that play
        changeCursor(player);
        // display movement for player
        displayMove(player);
        //add click event listener on every movement tile
        $('.movement').click((el) => {
          // move the player where the click happened
          movePlayer(el.target, player);
          // check if there is a weapon
          checkWeapons(player);

          // check if player is adjacent and start combat if true else continue with next turn
          if (checkIfAdjacent()) {
            Combat(player);
          } else {
            changeTurn(player);
          }
        });
      }, messageDelay + 200);
    }

    // Start when the window is ready
    $(() => {
      //      EXIT BTN EVENT
      // return to the menu ( emit a event that's catched by app.vue)
      $('.returnLink').click(() => {
        // stop the music
        sounds.ambients.forEach((sound) => {
          stopSounds(sound);
        });
        self.$emit('exitGame');
      });
      //     RULES BTN EVENT
      // display the rules modal on click
      $('.showModal').click(() => {
        $('.modal').css('display', 'block');
        // add event to close the modal if cliked outside of it
        $(window).click((e) => {
          if (e.target == $('.modal')[0]) {
            $('.modal').css('display', 'none');
            // remove the click event of the window
            $(window).off();
          }
        });
      });
      // close the rule modal if clicked on the X
      $('.close').click(() => {
        $('.modal').css('display', 'none');
        // remove the click event of the window
        $(window).off();
      });

      // start ambient music
      playSounds('ambients', randomPicker(sounds.ambients.length), true);

      // Generate the map (x tiles by y tiles)
      generateMap(mapWidth, mapHeight);

      // Start with 'player1'
      play(player1);
    });
  },
};
</script>

<style>
#game {
  /* padding-top: 20px; */
  display: flex;
  align-items: center;
}
#board {
  position: relative;
}

/*  /////////////////////// 
        IN GAME MENU
    ////////////////////// */

#menu {
  margin: 20px 20px 0 20px;
  font-family: gameOver, cursive;
}

#menu h2 {
  text-align: center;
  font-size: 20px;
  padding-bottom: 5px;
  border-bottom: 3px solid rgb(255, 248, 192);
}
#menu p {
  font-size: 10px;
}

/* Charsheet */
#charSheet {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
.character {
  margin: 15px;
  padding: 10px 20px;
  max-width: 500px;
  min-width: 182px;
  border-style: solid;
  border-width: 5px;
  border-image-slice: 3;
  border-image-width: 3;
  border-image-repeat: stretch;
  border-image-source: url('data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="8" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M3 1 h1 v1 h-1 z M4 1 h1 v1 h-1 z M2 2 h1 v1 h-1 z M5 2 h1 v1 h-1 z M1 3 h1 v1 h-1 z M6 3 h1 v1 h-1 z M1 4 h1 v1 h-1 z M6 4 h1 v1 h-1 z M2 5 h1 v1 h-1 z M5 5 h1 v1 h-1 z M3 6 h1 v1 h-1 z M4 6 h1 v1 h-1 z" fill="rgb(0,0,0)" /></svg>');
  border-image-outset: 0;
}
.knight,
.knight h3 {
  background-color: rgb(231, 53, 53);
}
.mage,
.mage h3 {
  background-color: rgb(43, 159, 226);
}

.character h3 {
  margin: -2rem auto 1rem;
  display: table;
  padding: 12px 12px;
  border-style: solid;
  border-width: 5px;
  border-image-slice: 3;
  border-image-width: 3;
  border-image-repeat: stretch;
  border-image-source: url('data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="8" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M3 1 h1 v1 h-1 z M4 1 h1 v1 h-1 z M2 2 h1 v1 h-1 z M5 2 h1 v1 h-1 z M1 3 h1 v1 h-1 z M6 3 h1 v1 h-1 z M1 4 h1 v1 h-1 z M6 4 h1 v1 h-1 z M2 5 h1 v1 h-1 z M5 5 h1 v1 h-1 z M3 6 h1 v1 h-1 z M4 6 h1 v1 h-1 z" fill="rgb(0,0,0)" /></svg>');
  border-image-outset: 0;
}

/* Buttons */
.menuBtn {
  text-align: center;
}

/* CombatLog */
.combatLog {
  overflow: auto;
  height: 250px;
  font-size: 10px;
  line-height: 16px;
}
.combatLog ul {
  list-style: none;
  padding: 0;
}

.combatLog li {
  padding: 1em;
}
.combatLog li.player2Turn {
  background-color: rgb(43, 159, 226);
}
.combatLog li.player1Turn {
  background-color: rgb(231, 53, 53);
}
/* exit link */
.menuLinks {
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  margin-top: 30px;
}
.menuLinks .returnLink.links {
  margin-top: 10px;
}
.links {
  text-align: center;
  color: rgb(216, 0, 0);
  font-size: 20px;
  transition: all 0.3s ease-in-out;
}
.links:hover {
  color: #9b1315;
  transition: all 0.3s ease-in-out;
}
.returnLink.links {
  font-size: 26px;
}

/* MODAL */

.modal {
  display: none;
  position: fixed;
  z-index: 99;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}
.modalContent {
  background-color: rgb(66, 66, 66);
  margin: 15% auto;
  padding: 20px;
  max-width: 50%;
  width: 50%;
}
.modalContent h3 {
  background-color: rgb(66, 66, 66);
  margin: -2.6rem auto 1rem;
}
.rules {
  line-height: 1.5rem;
  font-size: 14px;
}

.close {
  margin-top: -40px;
  margin-right: -8px;
  float: right;
  font-size: 10px;
  font-weight: bold;
}

.weaponWrapper {
  display: flex;
  justify-content: center;
  align-content: center;
}
.weaponRule {
  display: flex;
  padding: 0 10px;
}
.weaponRule img {
  width: 15px;
}
.weaponRule span {
  padding-left: 5px;
  display: flex;
  align-self: center;
}

/*  /////////////////////// 
        ANNOUNCEMENT
    ////////////////////// */

.overlay::after {
  content: '';
  background: rgba(0, 0, 0, 0.4);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.overlayText {
  color: rgb(255, 0, 0);
  font-family: gameOver, monospace;
  text-align: center;
  position: absolute;
  z-index: 99;
}

.player1Announce {
  color: rgb(231, 53, 53);
  font-size: 40px;
  width: 600px;
  top: 40%;
  left: Calc(50% - 300px);
}

.player2Announce {
  color: rgb(43, 159, 226);
  font-size: 40px;
  width: 600px;
  top: 40%;
  left: Calc(50% - 300px);
}

.winner {
  font-size: 40px;
  width: 600px;
  top: 40%;
  left: Calc(50% - 300px);
}
.winner.winplayer1 {
  color: rgb(231, 53, 53);
}
.winner.winplayer2 {
  color: rgb(43, 159, 226);
}

.overlayText.returnLink {
  width: 400px;
  top: 60%;
  left: Calc(50% - 200px);
}

/*  /////////////////////// 
            MAP
    ////////////////////// */

.mapRow {
  display: flex;
}

.floor {
  background: url(../assets/img/Map/Floors/floor_1.png);
  background-repeat: no-repeat;
  background-size: cover;
  height: 70px;
  width: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.wall {
  background-image: url(../assets/img/Map/wall_mid.png);
  background-repeat: no-repeat;
  background-size: cover;
  height: 70px;
  width: 70px;
}
.sideLimit {
  background-image: url(../assets/img/Map/wall_sides.png);
  background-repeat: no-repeat;
  background-size: cover;
  height: 70px;
  width: 22px;
}

.topBotLimit {
  background-image: url(../assets/img/Map/wall_bottom_mid.png);
  background-repeat: no-repeat;
  background-size: cover;
  height: 74px;
  width: 70px;
}

.sideTopLeft {
  background-image: url(../assets/img/Map/wall_side_top_left.png);
  background-repeat: no-repeat;
  background-size: cover;
  height: 74px;
  width: 22px;
}
.sideTopRight {
  background-image: url(../assets/img/Map/wall_side_top_right.png);
  background-repeat: no-repeat;
  background-size: cover;
  height: 74px;
  width: 22px;
}
.sideBottomLeft {
  background-image: url(../assets/img/Map/wall_side_bottom_left.png);
  background-repeat: no-repeat;
  background-size: cover;
  height: 74px;
  width: 22px;
}
.sideBottomRight {
  background-image: url(../assets/img/Map/wall_side_bottom_right.png);
  background-repeat: no-repeat;
  background-size: cover;
  height: 74px;
  width: 22px;
}

/*  /////////////////////// 
            WEAPONS
    ////////////////////// */

.weapons {
  width: 15px;
  height: 32px;
  background-repeat: no-repeat;
  background-size: contain;
}

.animWeapon {
  animation: weaponAnime 0.3s ease-in-out;
}
@keyframes weaponAnime {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(90deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.fist {
  background-position: bottom;
}
.animFist {
  animation: fistAnime 0.3s ease-in-out;
}

@keyframes fistAnime {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}

/*  /////////////////////// 
            PLAYERS
    ////////////////////// */

.player {
  height: 46px;
  width: 33px;
  background-repeat: no-repeat;
  background-size: contain;
}
.player1 {
  background-image: url(../assets/img/Players/knight_idle-sprit.png);
}
.player2 {
  background-image: url(../assets/img/Players/mage_idle-sprit.png);
}
.player1,
.player2 {
  background-size: cover;

  animation: play 0.8s steps(4) infinite;
}
@keyframes play {
  0% {
    background-position: 0px;
  }
  100% {
    background-position: -134px;
  }
}

/*  /////////////////////// 
            MOVEMENT
    ////////////////////// */

.movement::after {
  content: '';
  background: rgba(0, 0, 0, 0.3);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}
</style>
