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
      type: Number,
      default: 10,
    },
    mapY: {
      type: Number,
      default: 10,
    },
    musicOn: {
      type: Boolean,
    },
    effectsOn: {
      type: Boolean,
    },
  },
  mounted() {
    //  //////////////////////////////////
    //             VARIABLES
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

    //  //////////////////////////////////
    //                SOUNDS
    //  //////////////////////////////////

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
      menu: [
        new Audio(require('../assets/Sounds/menu/select.wav')),
        new Audio(require('../assets/Sounds/menu/button.wav')),
      ],
      victory: [new Audio(require('../assets/Sounds/victory.mp3'))],
      combat: [new Audio(require('../assets/Sounds/fight.mp3'))],
      ambients: [
        new Audio(require('../assets/Sounds/ambient/ambient1.mp3')),
        new Audio(require('../assets/Sounds/ambient/ambient2.mp3')),
        new Audio(require('../assets/Sounds/ambient/ambient3.mp3')),
      ],
      playSounds(type, soundIndex, loop) {
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
      },
      stopSounds(sound) {
        sound.pause();
        sound.currentTime = 0;
      },
    };

    //  //////////////////////////////////
    //                MAP
    //  //////////////////////////////////

    const map = {
      mapArr: [],

      pushTile(index, className) {
        this.mapArr[index].push({ tileType: className });
      },
      // chose if a tile is a wall or not
      chooseTile() {
        const rdm = generalFct.randomPicker(100);
        // % of tile are normale floor
        if (rdm > tilePercentage) {
          return 'wall';
        } else {
          return 'floor';
        }
      },

      // choose the position of a object in the map grid
      chooseCoordObj(x, y) {
        let coordX, coordY, position;
        do {
          coordX = generalFct.randomPicker(x);
          coordY = generalFct.randomPicker(y);
          position = this.mapArr[coordX][coordY];
          // test if the chosen tile is a floor (not a wall) and don't have another object yet
        } while (position.tileType !== 'floor' || 'obj' in position);

        return [coordX, coordY];
      },
      // choose the place of an object and place it in the map array
      placeObj(obj, x, y) {
        const position = this.chooseCoordObj(x, y);
        obj.position[0] = position[0];
        obj.position[1] = position[1];

        this.mapArr[obj.position[0]][obj.position[1]].obj = obj.name;
      },

      // randomly choose style of the floors tiles
      floorStyling() {
        const rand = generalFct.randomPicker(100);
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
      },

      // render tiles and objects from the map array
      renderTile() {
        for (let i = 0; i < this.mapArr.length; i++) {
          // put a x prop to easily know where we are in game
          $('#board').append(`<div class="mapRow" x=${i}></div>`);
          for (let j = 0; j < this.mapArr[i].length; j++) {
            const loc = this.mapArr[i][j];
            // put a y prop to easily know where we are in game
            $('.mapRow:last').append(`<div class=" tile ${loc.tileType}" y=${j}></div>`);
            if (loc.tileType === 'floor') {
              $('.floor:last').css('backgroundImage', `url(${this.floorStyling()})`);
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
      },

      generateMap(x, y) {
        // MAP
        // loop to create the map that's x long et y wide, +2 for the inaccessible border (create a bidimensional array)
        for (let i = 0; i < x + 2; i++) {
          this.mapArr[i] = [];
          for (let j = 0; j < y + 2; j++) {
            // create the border
            if (i === 0) {
              if (j === 0) {
                this.pushTile(i, 'wall sideTopLeft');
              } else if (j === y + 1) {
                this.pushTile(i, 'wall sideTopRight');
              } else {
                this.pushTile(i, 'wall topBotLimit');
              }
            } else if (i === x + 1) {
              if (j === 0) {
                this.pushTile(i, 'wall sideBottomLeft');
              } else if (j === y + 1) {
                this.pushTile(i, 'wall sideBottomRight');
              } else {
                this.pushTile(i, 'wall topBotLimit');
              }
            } else if (j === 0 || j === y + 1) {
              this.pushTile(i, 'wall sideLimit');

              // choose the tile type (wall or floor) if it's not a border
            } else {
              this.mapArr[i].push({ tileType: this.chooseTile() });
            }
          }
        }
        // WEAPONS
        // create an array of the keys of the weapons obj to loop through
        const weaponsArray = Object.keys(weapons);
        weaponsArray.forEach(weapon => {
          // choose position of weapon and put it in the map array the weapons obj except 'fist'
          if (weapon !== 'fist') {
            this.placeObj(weapons[weapon], x, y);
          }
        });
        // PLAYERS
        // place 'player1'
        this.placeObj(player1, x, y);
        // place 'player2' and check if it's not adjacent from 'player1', if true replace it
        do {
          this.placeObj(player2, x, y);
          // delete the obj if the player2 is adjacent to player1
          if (player2.checkIfAdjacent()) {
            delete this.mapArr[player2.position[0]][player2.position[1]].obj;
          }
        } while (player2.checkIfAdjacent());

        // render the map
        this.renderTile();
      },
    };

    //  //////////////////////////////////
    //                WEAPONS
    //  //////////////////////////////////

    // WEAPON CLASS
    class Weapon {
      constructor(name, damage, img, position) {
        this.name = name;
        this.damage = damage;
        this.img = img;
        this.position = position;
      }

      // place the weapon where the player is
      addWeapon(player, weapon) {
        $(`.${player.name}`)
          .parent()
          .append(`<div class="${weapon} weapons"></div>`);
        $(`.${weapon}`).css('backgroundImage', `url(${weapons[weapon].img})`);
      }
      // move the weapon exept if it's 'fist'
      moveWeapon(player, weapon) {
        if (weapon.name !== 'fist') {
          // remove de div of the weapon
          $(`.${weapon.name}`).remove();
          // replace it where the player is
          weapon.addWeapon(player, weapon.name);
          // update position of the weapon
          generalFct.updatePosition(weapon, $(`.${player.name}`).parent()[0]);
        }
      }

      // check if the player is on a tile with a weapon
      checkWeapons(player) {
        const posX = player.position[0];
        const posY = player.position[1];
        let newWeapon;
        //  create a array of the values of the 'weapons' object to loop trough
        const weaponsArray = Object.values(weapons);
        weaponsArray.forEach(weapon => {
          if (weapon.name !== 'fist') {
            if (posX === weapon.position[0] && posY === weapon.position[1]) {
              newWeapon = weapon;
            }
          }
        });
        // if there is a new weapon move it with the player
        if (newWeapon) {
          // place the new weapon in front of the player
          newWeapon.moveWeapon(player, newWeapon);
          // place the old weapon in the same tile as the player
          newWeapon.moveWeapon(player, weapons[player.weapon.name]);

          // add the new weapon to the 'player' object
          player.setWeapon(newWeapon);

          // update UI
          generalFct.updateUIWeapon(player);
        } else {
          // if there is no new weapon : move weapon's player with him
          player.weapon.moveWeapon(player, weapons[player.weapon.name]);
        }
      }
    }

    // WEAPONS OBJECT

    // to add weapon : key must be the same as the 'name' value and the name of the '.png'
    const weapons = {
      fist: new Weapon('fist', 10, require('../assets/img/Weapons/fist.png'), []),

      sword: new Weapon('sword', 25, require('../assets/img/Weapons/sword.png'), []),

      hammer: new Weapon('hammer', 20, require('../assets/img/Weapons/hammer.png'), []),
      axe: new Weapon('axe', 20, require('../assets/img/Weapons/axe.png'), []),

      club: new Weapon('club', 15, require('../assets/img/Weapons/club.png'), []),
    };

    //  //////////////////////////////////
    //                PLAYERS
    //  //////////////////////////////////

    // PLAYER CLASS

    class Player {
      constructor(name, coolName, life, weapon, defending, img, cursorImg, position) {
        this.name = name;
        this.coolName = coolName;
        this.life = life;
        this.weapon = weapon;
        this.defending = defending;
        this.img = img;
        this.cursorImg = cursorImg;
        this.position = position;
      }

      // check if playes are adjacent to each other
      checkIfAdjacent() {
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

      // players movement

      // select vertical move
      verticalMove(element, player) {
        let move = $();
        // select the column of the player by looking at the 'y' propety
        const col = parseInt(
          $(`.${player.name}`)
            .parent()
            .attr('y')
        );
        // add the tile of the column 'col' to 'move' and return move
        element.each((_i, el) => {
          move = move.add($(el).children(`:nth-child(${col + 1})`));
        });

        return move;
      }
      // highlight possible move tile expect if there is wall or player in the way
      moveHighlight(element) {
        element.each((i, el) => {
          // check if there is a wall if true => break the loop
          if ($(el).hasClass('wall')) {
            return false;
          }
          // check if the other player is in the way if true => break the loop
          if (
            $(el)
              .children()
              .hasClass('player2') ||
            $(el)
              .children()
              .hasClass('player1')
          ) {
            return false;
          }
          //  add class 'movement' for highlight and data for walking sounds
          $(el)
            .addClass('movement')
            .data('walk', i);
        });
      }

      displayMove(player) {
        const playerTile = $(`.tile:has(.${player.name})`);
        // vertical moves
        // move up
        // select the 3 upper row
        const topRow = playerTile.parent().prevAll(':lt(3)');

        // select the 3 tile in the player column from the rows passed in argument
        // reverse the jquery object because the result of .add() return in doc order
        let movTop = $(
          this.verticalMove(topRow, player)
            .get()
            .reverse()
        );
        // move down
        // same as move up without the reversing
        const bottomRow = playerTile.parent().nextAll(':lt(3)');
        const movBottom = this.verticalMove(bottomRow, player);

        // horizontal moves
        // select the next/previous tile in col of the player
        const movRight = playerTile.nextAll(':lt(3)');
        const movLeft = playerTile.prevAll(':lt(3)');

        // highlight all the possible movements
        this.moveHighlight(movTop);
        this.moveHighlight(movBottom);
        this.moveHighlight(movRight);
        this.moveHighlight(movLeft);
      }
      // remove the 'movement' class and the data(for the walking sounds)
      removeMoveHighlight() {
        $('.movement')
          .off()
          .removeClass('movement')
          .removeData('walk');
      }

      movePlayer(target, player) {
        // play sound depending of the number of tile walked
        sounds.playSounds('walk', $(target).data().walk);

        // remove player from his tile
        $(`.${player.name}`).remove();
        // move player to the clicked tile
        $(target).append(`<div class="${player.name} player"></div>`);

        // update the position in the 'player' object
        generalFct.updatePosition(player, target);

        // remove the click event and the 'movement' class
        this.removeMoveHighlight();
      }

      // add the new weapon to the 'player' object
      setWeapon(weapon) {
        this.weapon = weapon;
      }
      // change the defending status of the player
      setDefence(def) {
        this.defending = def;
      }
    }

    // PLAYERS OBJECTS
    const player1 = new Player(
      'player1',
      'Knight',
      100,
      weapons.fist,
      false,
      require('../assets/img/Players/knight_idle-sprit.png'),
      require('../assets/img/Cursor/cursor_player1.png'),
      []
    );

    const player2 = new Player(
      'player2',
      'Mage',
      100,
      weapons.fist,
      false,
      require('../assets/img/Players/mage_idle-sprit.png'),
      require('../assets/img/Cursor/cursor_player2.png'),
      []
    );

    //  //////////////////////////////////
    //                COMBAT
    //  //////////////////////////////////

    const combat = {
      // add the turn number and who's turn it is in the combat log
      turnLog(player, turn) {
        $('#menu ul').prepend(`<li class="${player.name}Turn">${player.coolName}'s turn</li>`);
        $('#menu ul').prepend(`<li class="">Turn : ${turn}</li>`);
      },

      attack(attacker, defender) {
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
        generalFct.updateUILife(defender);

        return damage;
      },
      // disabled combat button for the time of the message + exit animation
      disabledCombatBtn() {
        $('#attackBtn').prop('disabled', true);
        $('#defendBtn').prop('disabled', true);
        setTimeout(() => {
          $('#attackBtn').prop('disabled', false);
          $('#defendBtn').prop('disabled', false);
        }, messageDelay + 200);
      },

      // check if a player's life is less than 0
      checkDead(player) {
        const life = player.life;
        if (life <= 0) {
          return true;
        } else {
          return false;
        }
      },

      attackTurn(attacker, defender, turn) {
        // attack and save the damage
        const damage = this.attack(attacker, defender);

        // attack animation and sounds
        const attackerWeapon = attacker.weapon.name;
        // if the weapon is not a fist play a sound
        if (attackerWeapon !== 'fist') {
          // if the defender is defending play a random 'blocked' sound otherwise play a random attack sound
          if (defender.defending) {
            sounds.playSounds('blocked', generalFct.randomPicker(sounds.weapons.length));
          } else {
            sounds.playSounds('weapons', generalFct.randomPicker(sounds.weapons.length));
          }
          // weapon animation
          $(`.${attackerWeapon}`).addClass('animWeapon');
        } else {
          // if the weapon is a fist plays a random 'fist' sound and an animation
          sounds.playSounds('fist', generalFct.randomPicker(sounds.fist.length));
          $(`.${attacker.name}`)
            .siblings('.weapons')
            .addClass('animFist');
        }
        // reset the defence of the defender
        defender.setDefence(false);
        // continue after the attack animation
        setTimeout(() => {
          // remove the animation class of the weapons
          $(`.${attackerWeapon}`).removeClass('animWeapon animFist');
          // put the attack in the combat log
          $('#menu ul').prepend(
            `<li class="${attacker.name}Turn">${attacker.coolName} attacks ${defender.coolName} for ${damage} damages</li>`
          );
          this.turnLog(attacker, turn);
          // check if the defender is dead
          if (this.checkDead(defender)) {
            // stop the game
            generalFct.win(attacker);
            return;
          } else {
            generalFct.showTurn('turn', defender);
          }
        }, 300);
      },

      defend(player, turn) {
        sounds.playSounds('shield', 0);
        // change the defending status of the player
        player.setDefence(true);
        // put the defence in the combat log
        $('#menu ul').prepend(`<li class="${player.name}Turn">${player.coolName} chooses to defend himself</li>`);
        this.turnLog(player, turn);
      },

      combatProgress(player) {
        // Announce Combat
        sounds.playSounds('combat', 0);
        generalFct.showTurn('combat');
        // setTimeout of the time the message displays + the time of the exit animation
        setTimeout(() => {
          // show who's playng the combat turn
          generalFct.showTurn('turn', player);
          // show fist for the players that have no weapon
          if (player1.weapon.name === 'fist') {
            player1.weapon.addWeapon(player1, 'fist');
          }
          if (player2.weapon.name === 'fist') {
            player1.weapon.addWeapon(player2, 'fist');
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
            this.disabledCombatBtn();

            // check if turn is odd, if odd the firstPlayer play else the second one
            // change the cursor for the next player
            if (turns % 2 !== 0) {
              this.attackTurn(firstPlayer, secondPlayer, turns);
              generalFct.changeCursor(secondPlayer);
            } else {
              this.attackTurn(secondPlayer, firstPlayer, turns);
              generalFct.changeCursor(firstPlayer);
            }
            turns += 1;
          });
          // defend btn
          $('#defendBtn').click(() => {
            // disable button for the time of the annoucement + exit anim
            this.disabledCombatBtn();
            // check if turn is odd, if odd the firstPlayer play else the second one
            // change the cursor for the next player
            if (turns % 2 !== 0) {
              this.defend(firstPlayer, turns);
              generalFct.changeCursor(secondPlayer);
              generalFct.showTurn('turn', secondPlayer);
            } else {
              this.defend(secondPlayer, turns);
              generalFct.changeCursor(firstPlayer);
              generalFct.showTurn('turn', firstPlayer);
            }
            turns += 1;
          });
        }, messageDelay + 200);
      },
    };

    //  /////////////////////////
    //          GENERAL
    //  /////////////////////////

    const generalFct = {
      // random picker
      randomPicker(number) {
        return Math.floor(Math.random() * number);
      },

      // UI Update
      updateUILife(player) {
        $(`#${player.name}Life`).text(`${player.life}`);
      },
      updateUIWeapon(player) {
        $(`#${player.name}Weapon`).text(`${player.weapon.name}`);
        $(`#${player.name}Damage`).text(`${player.weapon.damage}`);
      },

      // Stop the game and show who's winning
      win(winner) {
        sounds.playSounds('victory', 0);
        // disable the attack/defend buttons and remove the click event
        $('.btn')
          .addClass('disabled')
          .off();
        // show the game over message
        $('#board').addClass('overlay').append(`
        <h1 class="overlayText winner win${winner.name}">${winner.coolName} won !</h1>
        <h2 class="overlayText links returnLink">Return</h2>
        `);
        $('.overlayText').addClass('animated bounceIn');
        // return to the menu ( emit a event that's catched by app.vue)
        $('.returnLink').click(() => {
          sounds.ambients.forEach(sound => {
            sounds.stopSounds(sound);
          });
          self.$emit('exitGame');
        });

        return;
      },

      // update the position of an object by getting the 'x' and 'y' attributes
      updatePosition(obj, target) {
        const positionX = parseInt(
          $(target)
            .parent()
            .attr('x')
        );
        obj.position[0] = positionX;
        const positionY = parseInt($(target).attr('y'));
        obj.position[1] = positionY;
      },

      // restart a turn with the next player
      changeTurn(player) {
        if (player === player1) {
          this.play(player2);
        } else if (player === player2) {
          this.play(player1);
        }
      },

      changeCursor(player) {
        $('body').css('cursor', `url(${player.cursorImg}), auto`);
      },

      // show who's turn it is
      showTurn(type, player) {
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
      },

      play(player) {
        this.showTurn('turn', player);
        // set a time of the annoucement + exit anim
        setTimeout(() => {
          // change the cursor acording to the player that play
          this.changeCursor(player);
          // display movement for player
          player.displayMove(player);
          //add click event listener on every movement tile
          $('.movement').click(el => {
            // move the player where the click happened
            player.movePlayer(el.target, player);
            // check if there is a weapon
            player.weapon.checkWeapons(player);

            // check if player is adjacent and start combat if true else continue with next turn
            if (player.checkIfAdjacent()) {
              combat.combatProgress(player);
            } else {
              this.changeTurn(player);
            }
          });
        }, messageDelay + 200);
      },

      btnEventHandlers() {
        //      EXIT BTN EVENT
        // return to the menu ( emit a event that's catched by app.vue)
        $('.returnLink').click(() => {
          // stop the music
          sounds.ambients.forEach(sound => {
            sounds.stopSounds(sound);
          });
          self.$emit('exitGame');
        });
        //     RULES BTN EVENT
        // display the rules modal on click
        $('.showModal').click(() => {
          sounds.playSounds('menu', 0);

          $('.modal').css('display', 'block');
          // add event to close the modal if cliked outside of it
          $(window).click(e => {
            if (e.target == $('.modal')[0]) {
              sounds.playSounds('menu', 1);
              $('.modal').css('display', 'none');
              // remove the click event of the window
              $(window).off();
            }
          });
        });
        // close the rule modal if clicked on the X
        $('.close').click(() => {
          sounds.playSounds('menu', 1);
          $('.modal').css('display', 'none');
          // remove the click event of the window
          $(window).off();
        });
      },
    };

    // ///////////////////////////////////////////////
    //        START THE GAME ON "WINDOW READY"
    // ///////////////////////////////////////////////

    $(() => {
      // add event handlers on buttons and manage the 'rules' modal
      generalFct.btnEventHandlers();

      // start ambient music
      sounds.playSounds('ambients', generalFct.randomPicker(sounds.ambients.length), true);

      // Generate the map (x tiles by y tiles)
      map.generateMap(mapWidth, mapHeight);

      // put the life of the players in their respective char sheet
      generalFct.updateUILife(player1);
      generalFct.updateUILife(player2);
      // put the player's weapon in their respective char sheet
      generalFct.updateUIWeapon(player1);
      generalFct.updateUIWeapon(player2);

      // Start the game with 'player1'
      generalFct.play(player1);
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
