//  /////////////////////////
//          OBJECTS
//  /////////////////////////

// MAP
let map = [];

// WEAPONS
// to add weapon : key must be the same as the 'name' value and the name of the '.png'
const weapons = {
  sword: { name: 'sword', position: [], img: './Assets/img/Weapons/sword.png' },
  hammer: { name: 'hammer', position: [], img: './Assets/img/Weapons/hammer.png' },
  axe: { name: 'axe', position: [], img: './Assets/img/Weapons/axe.png' },
  spear: { name: 'spear', position: [], img: './Assets/img/Weapons/spear.png' },
};

// PLAYERS
let player1 = { name: 'one', life: 100, damage: 10, position: [], img: './Assets/img/Players/knight_idle-sprit.png' };
let player2 = {
  name: 'two',
  life: 100,
  damage: 10,
  position: [],
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
function placeObj(type, arg) {
  if (type === 'weapons') {
    map[weapons[arg].position[0]][weapons[arg].position[1]].obj = arg;
  } else {
    let player;
    if (type === 'player1') {
      player = player1;
    } else if (type === 'player2') {
      player = player2;
    }
    map[player.position[0]][player.position[1]].obj = type;
  }
}
function placePlayers(obj, className, x, y) {
  obj.position = chooseCoordObj(x, y);
  placeObj(className);
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
    $('#app').append('<div class="mapRow"></div>');
    for (let j = 0; j < map[i].length; j++) {
      const loc = map[i][j];
      $('.mapRow:last').append(`<div class="${loc.tileType}"></div>`);
      if (loc.tileType === 'floor') {
        $('.floor:last').css('backgroundImage', `url(${floorStyling()})`);
      }
      // add the object if it exist
      if ('obj' in loc) {
        const obj = loc.obj;
        if (obj === 'player1' || obj === 'player2') {
          $('.floor:last').append(`<div class="${obj} objects"></div>`);
        } else {
          $('.floor:last').append(`<div class="objects"></div>`);
          $('.objects:last').css('backgroundImage', `url(./Assets/img/Weapons/${obj}.png)`);
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
          pushTile(i, 'sideTopLeft');
        } else if (j === y + 1) {
          pushTile(i, 'sideTopRight');
        } else {
          pushTile(i, 'topBotLimit');
        }
      } else if (i === x + 1) {
        if (j === 0) {
          pushTile(i, 'sideBottomLeft');
        } else if (j === y + 1) {
          pushTile(i, 'sideBottomRight');
        } else {
          pushTile(i, 'topBotLimit');
        }
      } else if (j === 0 || j === y + 1) {
        pushTile(i, 'sideLimit');

        // choose the tile type (wall or floor) if it's not a border
      } else {
        map[i].push({ tileType: chooseTile() });
      }
    }
  }
  // WEAPONS
  // create an array of the keys of the weapons obj to loop through
  const weapVal = Object.keys(weapons);
  weapVal.forEach(weap => {
    // choose position of weapon and put it in the weapons obj
    weapons[weap].position = chooseCoordObj(x, y);
    placeObj('weapons', weap);
  });
  // PLAYERS
  placePlayers(player1, 'player1', x, y);
  placePlayers(player2, 'player2', x, y);

  // render the map
  renderTile();
}

//  /////////////////////////
//         GAME START
//  /////////////////////////

$(() => {
  generateMap(10, 10);
  console.log(map);
});
