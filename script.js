//  /////////////////////////
//     OBJECTS AND ARRAYS
//  /////////////////////////

// MAP
let map = [];

// WEAPONS
// to add weapon : key must be the same as the 'name' value and the name of the '.png'
const weapons = {
  fist: { name: 'fist', damage: 10 },
  sword: { name: 'sword', damage: 25, position: [], img: './Assets/img/Weapons/sword.png' },
  hammer: { name: 'hammer', damage: 15, position: [], img: './Assets/img/Weapons/hammer.png' },
  axe: { name: 'axe', damage: 20, position: [], img: './Assets/img/Weapons/axe.png' },
  club: { name: 'club', damage: 12, position: [], img: './Assets/img/Weapons/club.png' },
};
// PLAYERS
let player1 = {
  name: 'player1',
  coolName: 'Knight',
  life: 100,
  weapon: { name: 'fist', damage: 10 },
  position: [],
  turn: true,
  img: './Assets/img/Players/knight_idle-sprit.png',
};
let player2 = {
  name: 'player2',
  coolName: 'Mage',
  life: 100,
  weapon: { name: 'fist', damage: 10 },
  position: [],
  turn: false,
  img: './Assets/img/Players/mage_idle-sprit.png',
};

//  /////////////////////////
//      MAP GENERATION
//  /////////////////////////

function pushTile(index, className) {
  map[index].push({ tileType: className });
}

// chose if a tile is a wall or not
function chooseTile() {
  const rdm = Math.floor(Math.random() * 100);
  // % of tile are normale floor
  if (rdm > 80) {
    return 'wall';
  } else {
    return 'floor';
  }
}
// choose the position of a object in the map grid
function chooseCoordObj(x, y) {
  let coordX, coordY, position;
  do {
    coordX = Math.floor(Math.random() * x);
    coordY = Math.floor(Math.random() * y);
    position = map[coordX][coordY];
    // test if the chosen tile is a floor (not a wall) and don't have another object yet
  } while (position.tileType !== 'floor' || 'obj' in position);

  return [coordX, coordY];
}
// place an object in the map array
function putObjInMap(type, weapon) {
  let objPlaced;

  if (type === 'weapons') {
    objPlaced = weapon;
  } else {
    if (type === 'player1') {
      objPlaced = player1;
    } else if (type === 'player2') {
      objPlaced = player2;
    }
  }
  map[objPlaced.position[0]][objPlaced.position[1]].obj = objPlaced.name;
}
function placeObj(obj, className, x, y) {
  obj.position = chooseCoordObj(x, y);
  putObjInMap(className, obj);
}

// randomly choose style of the floors tiles
function floorStyling() {
  const rand = Math.floor(Math.random() * 100);
  if (rand < 5) {
    return './Assets/img/Map/Floors/floor_2.png';
  } else if (rand >= 5 && rand < 15) {
    return './Assets/img/Map/Floors/floor_3.png';
  } else if (rand >= 15 && rand < 18) {
    return './Assets/img/Map/Floors/floor_4.png';
  } else if (rand >= 18 && rand < 28) {
    return './Assets/img/Map/Floors/floor_5.png';
  } else {
    return './Assets/img/Map/Floors/floor_1.png';
  }
}
// render tiles and objects
function renderTile() {
  for (let i = 0; i < map.length; i++) {
    $('#board').append(`<div class="mapRow" x=${i}></div>`);
    for (let j = 0; j < map[i].length; j++) {
      const loc = map[i][j];
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
          $('.weapons:last').css('backgroundImage', `url(./Assets/img/Weapons/${obj}.png)`);
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
  weaponsArray.forEach(weapon => {
    // choose position of weapon and put it in the weapons obj
    if (weapon !== 'fist') {
      placeObj(weapons[weapon], 'weapons', x, y);
    }
  });
  // PLAYERS
  // place 'player1'
  placeObj(player1, 'player1', x, y);
  // place 'player2' and check if it's not adjacent from 'player1', if true replace it
  do {
    placeObj(player2, 'player2', x, y);
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
  // select the column of the player by looking at the 'y' attribute
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
function moveHighlight(element) {
  element.each((_i, el) => {
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

    $(el).addClass('movement');
  });
}

function displayMove(player) {
  const playerTile = $(`.tile:has(.${player.name})`);
  // vertical moves
  // move up
  const topRow = playerTile.parent().prevAll(':lt(3)');

  // reverse the jquery object because the result of .add() return in doc order
  let movTop = $(
    verticalMove(topRow, player)
      .get()
      .reverse()
  );
  // move down
  const bottomRow = playerTile.parent().nextAll(':lt(3)');
  const movBottom = verticalMove(bottomRow, player);

  // horizontal moves
  const movRight = playerTile.nextAll(':lt(3)');
  const movLeft = playerTile.prevAll(':lt(3)');

  // highlight possible movement
  moveHighlight(movTop);
  moveHighlight(movBottom);
  moveHighlight(movRight);
  moveHighlight(movLeft);
}

function movePlayer(target, player) {
  // if a tile is clicked
  // remove player from his tile
  $(`.${player.name}`).remove();
  // move player to the clicked tile
  $(target).append(`<div class="${player.name} player"></div>`);

  // update the position in the 'player' object
  updatePosition(player, target);

  // change the turn of player to false
  // remove the click event and the 'movement' class
  $('.movement')
    .off()
    .removeClass('movement');
}

//  /////////////////////////
//            WEAPONS
//  /////////////////////////

function moveWeapon(player, weapon) {
  if (weapon.name !== 'fist') {
    // remove de div of the weapon
    $(`.${weapon.name}`).remove();
    // replace it where the player is
    $(`.${player.name}`)
      .parent()
      .append(`<div class="${weapon.name} weapons"></div>`);
    $(`.${weapon.name}`).css('backgroundImage', `url(./Assets/img/Weapons/${weapon.name}.png)`);

    // update position of the weapon
    updatePosition(weapon, $(`.${player.name}`).parent()[0]);
  }
}

function checkWeapons(player) {
  const posX = player.position[0];
  const posY = player.position[1];
  // check if the player is on a tile with a weapon
  let newWeapon;
  //  create a array of the values of the 'weapons' object
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
    moveWeapon(player, newWeapon);
    // place the old weapon in the same tile as the player
    moveWeapon(player, weapons[player.weapon.name]);

    // add the new weapon to the 'player'
    player.weapon.name = newWeapon.name;
    player.weapon.damage = newWeapon.damage;
    // update UI
    updateUIWeapon(player);
  } else {
    // if there is no new weapon : move the weapon the player has with him
    moveWeapon(player, weapons[player.weapon.name]);
  }
}

//  /////////////////////////
//          COMBAT
//  /////////////////////////

function attack(attacker, defender) {
  // substract the attacker's damage of the defendre's life
  defender.life = defender.life - attacker.weapon.damage;

  console.log(`${attacker.coolName} attack ${defender.coolName} for ${attacker.weapon.damage} damage`);
  $('#menu ul').prepend(
    `<li class="">${attacker.coolName} attack ${defender.coolName} for ${attacker.weapon.damage} damage</li>`
  );

  console.log(`${defender.coolName} life : ${defender.life}`);
  updateUILife(defender);
}

function Combat(player) {
  if (checkIfAdjacent()) {
    console.log('Combat !');
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
    let hasWin = false;

    do {
      $('#menu ul').prepend(`<li class="">Turn : ${turns}</li>`);
      console.log(`Turn : ${turns}`);
      if (turns % 2 !== 0) {
        attack(firstPlayer, secondPlayer);
        hasWin = checkDead(secondPlayer);
        if (hasWin) {
          console.log(`${secondPlayer.coolName} is dead`);
        }
      } else {
        attack(secondPlayer, firstPlayer);
        hasWin = checkDead(firstPlayer);
        if (hasWin) {
          console.log(`${firstPlayer.coolName} is dead`);
        }
      }
      turns += 1;
    } while (!hasWin);
  }
}

//  /////////////////////////
//          GENERAL
//  /////////////////////////

function updateUILife(player) {
  $(`#${player.name}Life`).text(`${player.life}`);
}

function updateUIWeapon(player) {
  $(`#${player.name}Weapon`).text(`${player.weapon.name}`);
  $(`#${player.name}Damage`).text(`${player.weapon.damage}`);
}

function checkDead(player) {
  const life = player.life;
  if (life <= 0) {
    return true;
  } else {
    return false;
  }
}

function win(winner) {
  $('#board')
    .addClass('win')
    .append(`<h1 class="gameOver">Game Over</h1> <h3 class="winner">${winner} won !</h3>`);
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
// update the position of an object
function updatePosition(obj, target) {
  const positionX = parseInt(
    $(target)
      .parent()
      .attr('x')
  );
  obj.position[0] = positionX;
  const positionY = parseInt($(target).attr('y'));
  obj.position[1] = positionY;
}

function changeTurn(player) {
  // change the 'turn' of players
  player1.turn = !player1.turn;
  player2.turn = !player2.turn;
  // restart a turn with the next player
  if (player === player1) {
    play(player2);
  } else if (player === player2) {
    play(player1);
  }
}

function play(player) {
  // change the cursor acording to the player that play
  $('body').css('cursor', `url(./Assets/img/Cursor/cursor_${player.name}.png), auto`);
  // display movement for player
  displayMove(player);
  //add click event listener on every movement tile
  $('.movement').click(el => {
    movePlayer(el.target, player);
    checkWeapons(player);
    // check if combat and do it if player is adjacent
    Combat(player);
    // stop the game if a player had win
    if (checkDead(player2)) {
      win(player1.coolName);
      return;
    } else if (checkDead(player1)) {
      win(player2.coolName);
      return;
    } else {
      changeTurn(player);
    }
  });
}

$(() => {
  // Map
  generateMap(10, 10);

  console.log(map);

  // Start

  play(player1);
});
