// Calculate points/sec!
function getPointGen() {
  if (!canGenPoints())
    return n(0)

  let gain = new Decimal(1)
  if (hasUpgrade('p', 11)) gain = gain.times(upgradeEffect('p', 11))
  if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
  if (hasUpgrade('p', 13)) gain = gain.times(upgradeEffect('p', 13))

  if (hasUpgrade('p', 31)) gain = gain.times(2)
  if (hasUpgrade('p', 32)) gain = gain.times(2)
  gain = gain.times(n(1.2).pow(plantAmt2(3)))

  gain = gain.times(n(1.5).pow(plantAmt2(4)))
  gain = gain.times(n(1.3).pow(plantAmt2(5)))
  return gain
}
function growSpeed(id) {
  if(player.p.grid[id-1]==7)return 4
  return 1
}
function numToFarm(x) {
  switch (x) {
    case 0: return "Empty";
    case 1: return "Baby Potato";
    case 3: return "Normal Potato";
    case 4: return "Giant Potato";
    case 5: return "Teen Winter Potato";
    case 6: return "Winter Potato";
    case 7: return "Leafy Potato";
    case 8: return "Teen Pawn Potato";
    case 9: return "Pawn Potato";
  }
}
function extend() {
  return getBuyableAmount("ex", 11).toNumber()
}
function plantAmt() {
  let a = 0
  for (let item in player.p.grid) {
    if (getGridData("p", item) != 0) a++
  }
  return n(a)
}
function plantAmt2(x) {
  let a = 0
  for (let item in player.p.grid) {
    if (getGridData("p", item) == x) a++
  }
  return n(a)
}
function gettime() {
  let time = 30
  if (hasUpgrade('p', 21)) time -= 10
  if (hasMilestone('b', 1)) time -= 10
  if (hasMilestone('b', 2)) time -= 2
  if (hasMilestone('b', 3)) time -= 2
  if (hasMilestone('b', 4)) time -= 2
  if (hasUpgrade('p', 33)) time -= 2
  if (hasUpgrade('p', 41)) time /= 5
  return time
}
addLayer("p", {
  symbol: "P",
  position: 0,
  startData() {
    return {
      unlocked: true,
      points: n(0),
      farmMode: 0,
      time: {},
    }
  },
  color() {
    if (hasUpgrade('p', 14)) return "#ffdb83";
    return "#4BDC13";
  },
  requires: n(10),
  resource() {
    if (hasUpgrade('p', 14)) return "potatoes";
    return "prestige points";
  },
  baseResource: "points",
  baseAmount() { return player.points },
  type: "normal",
  exponent: 0.5,
  gainMult() {
    let mult = n(1);
    if (hasUpgrade('p', 24)) mult = mult.times(2)
    if (hasMilestone('b', 1)) mult = mult.times(2)
    mult = mult.times(n(1.3).pow(plantAmt2(6)))
    mult = mult.times(n(1.25).pow(plantAmt2(8)))
    return mult;
  },
  gainExp() {
    let mult = n(1)
    return mult
  },
  row: 0,
  hotkeys: [
    { key: "p", description: `P: Reset for potatos`, onPress() { if (canReset(this.layer)) doReset(this.layer) } },
  ],
  layerShown() { return true },
  grid: {
    rows: 9,
    cols: 9,
    getStartData(id) {
      return 0
    },
    getCanClick(data, id) {
      if (player.p.farmMode == 0) return data == 0 && player.p.points.gte(n(8).times(n(1.5).pow(plantAmt() ** 1.1)).round())
      else if (player.p.farmMode == 1) return data != 0
      else return false
    },
    onClick(data, id) {
      if (player.p.farmMode == 1) setGridData("p", id, 0)
      else {
        player.p.points = player.p.points.sub(n(8).times(n(1.5).pow(plantAmt() ** 1.1)).round())
        setGridData("p", id, 1)
        Vue.set(player.p.time, id, gettime())
      }
    },
    getDisplay(data, id) {
      if (player.p.farmMode == 0) {
        if (player.p.grid[id] != 0) return `${numToFarm(data)}\n${format(player.p.time[id])}s`
        return `Req ${formatWhole(n(8).times(n(1.5).pow(plantAmt() ** 1.1)).round())} potatoes.`
      }
      return `${numToFarm(data)}\n${format(player.p.time[id])}s`
      //return numToFarm(data.plant)
    },
    getUnlocked(id) {
      let r = hasUpgrade("p", 23) ? 3 : 2
      let c = hasUpgrade("p", 23) ? 3 : 2
      if (hasUpgrade("p", 41)) r++
      return (id % 100 <= c) && (Math.floor(id / 100) <= r)
    }
  },
  upgrades: {
    11: {
      title: "Basic Upgrade",
      description() {
        return `${layers.p.resource()} boost Points gain.`
      },
      cost: n(1),
      effect() {
        return player.p.points.add(3).max(1).log(2)
      },
      effectDisplay() { return format(upgradeEffect('p', 11)) + "x" },
    },
    12: {
      title: "Basic Upgrade 2",
      description: "Points boost themselves.",
      cost: n(3),
      effect() {
        return player.points.add(2).max(1).log(10).add(1)
      },
      effectDisplay() { return format(upgradeEffect('p', 12)) + "x" },
      unlocked() { return hasUpgrade('p', 11) || player.b.unlocked }
    },
    13: {
      title: "Basic Upgrade 3",
      description() { return `Boost Points gain based on total ${layers.p.resource()} Upgrades.` },
      effect() {
        return n(1.3 ** player.p.upgrades.length)
      },
      cost: n(6),
      effectDisplay() { return format(upgradeEffect('p', 13)) + "x" },
      unlocked() { return hasUpgrade('p', 12) || player.b.unlocked }
    },
    14: {
      title: "Wait, the themes was about potatos!",
      description() {
        if (hasUpgrade('p', 14)) return 'fixed :)'
        return `okey lemme fix that`
      },
      cost: n(15),
      unlocked() { return hasUpgrade('p', 13) || player.b.unlocked },
    },
    21: {
      title: "Growing potatos",
      description: 'Fasten potato growth.',
      cost: n(30),
      unlocked() { return extend() >= 1 }
    },
    22: {
      title: "More Mutation",
      description: 'A higher chance to get giant potato instead! (Hover to see requirement!)',
      cost: n(50),
      unlocked() { return hasUpgrade('p', 21) || player.b.unlocked },
      tooltip: 'Req: 3 normal or giant potato in the farm at the same time.',
      canAfford() { return (plantAmt2(3).add(plantAmt2(4))).gte(3) },
    },
    23: {
      title: "Area+",
      description: 'Get a new row and column for farm. (Hover to see requirement!)',
      cost: n(70),
      unlocked() { return hasUpgrade('p', 22) || player.b.unlocked },
      tooltip: 'Req: Having 2 giant potato in the farm at the same time.',
      canAfford() { return (plantAmt2(4)).gte(2) }
    },
    24: {
      title: "Potato Boost",
      description: 'Potato gain is doubled (Hover to see requirement!)',
      cost: n(200),
      tooltip: 'Req: Having 7 potato in the farm at same time. Any potato counts.',
      unlocked() { return hasUpgrade('p', 23) || player.b.unlocked },
      canAfford() {
        return plantAmt().gte(7)
      }
    },
    31: {
      title: "Cheap Boost",
      description: 'Point gain is doubled!',
      cost: n(1),
      unlocked() { return hasMilestone('b', 2) },
    },
    32: {
      title: "Expensive Boost",
      description: 'Point gain is doubled again!',
      cost: n(1000),
      unlocked() { return hasMilestone('b', 2) },
    },
    33: {
      title: "Challenge 1",
      description: 'Potato grow speed -2s. (Hover to see requirement!)',
      cost: n(1),
      unlocked() { return hasMilestone('b', 4) },
      tooltip: 'Req: having 3 baby, normal and giant potato at SAME TIME.',
      canAfford() {
        return plantAmt2(1).gte(3) && plantAmt2(3).gte(3) && plantAmt2(4).gte(3)
      }
    },
    34: {
      title: "Challenge 2",
      description: 'Keep upgrade on reset. (Hover to see requirement. This one is hard!)',
      cost: n(1000),
      tooltip: 'Req: have 6 upgrade AT MOST. Yes, potato theme also count. :troll:',
      unlocked() { return hasMilestone('b', 4) },
      canAfford() {
        return player.p.upgrades.length <= 6
      }
    },
    41: {
      title: "Challenge 3",
      description: 'Potato growing speed is much faster. And get a new row for farm. (Hover to see requirement. You can grind this tho...)',
      cost: n(1),
      tooltip: 'Req: 25,000 potatoes on reset. Buy it BEFORE you reset!',
      //Can be done by growing giant potato than destroy than grow winter potato
      unlocked() { return hasMilestone('b', 6) },
      canAfford() {
        return n(tmp.p.resetGain).gte(25000)
        /*Explain of that weird code:
        When the game is not loaded, tmp.p.resetGain give {}, which give error.
        But new Decimal({}) return 0, so it wont give error*/
        //fuk, you are brillant
        //Chess: brillant move :troll:
      },
      style: { "width": "240px",'border-radius': '25px' },
    },
    42: {
      title: "Challenge 4",
      description: 'Unlock 2 new potato varients. Also make you become more lucky. (Hover to see requirement. This one is also hard, be lucky!)',
      cost: n(1),
      tooltip: 'Req: having 4 giant and 4 winter potato at SAME TIME.',
      unlocked() { return hasMilestone('b', 6) },
      canAfford() {
        return plantAmt2(4).gte(4) && plantAmt2(6).gte(4)
      },
      style: { "width": "240px",'border-radius': '25px' },
    },
  },
  clickables: {
    11: {
      display() { return "Mode: " + this.text() },
      onClick() { player.p.farmMode = (player.p.farmMode + 1) % 2 },
      canClick: true,
      text() {
        switch (player.p.farmMode) {
          case 0: return "Seed";
          case 1: return "Destroy";
        }
      }
    }
  },

  tabFormat: {
    "Main": {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        "upgrades"
      ]
    },
    "Farm": {
      unlocked() { return extend() >= 1 },
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        "grid",
        //"blank",
        "clickables",
      ]
    },
    "Farm Effect": {
      unlocked() { return extend() >= 1 },
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        ["display-text", `
          Bady Potato (No effect)<br>
          Normal Potato (1.2x point gain)<br>
          Giant Potato (1.5x point gain)<br>
          Teen Winter Potato (1.3x point gain)<br>
          Winter Potato (1.3x potato gain)<br>
          Leafy Potato (Grow speed on the right of it x4)<br>
          Teen pawn Potato (1.25x potato gain)<br>
          Pawn Potato (Make it can fight)<br>
          `]
      ]
    },
    "Baked potato":{
      unlocked(){return extend()>=2},
      embedLayer: "b",
    },
    "Potato War":{
      unlocked(){return extend()>=3},
      embedLayer: "w",
    }
  },
  update(diff) {

    for (let item in player.p.grid) {

      if (player.p.time[item] == undefined) player.p.time[item] = 0
      Vue.set(player.p.time, item, Math.max(player.p.time[item] - (diff*growSpeed(item)), 0))

      if (player.p.grid[item] == 1 && player.p.time[item] == 0) {
        let chance = {
          3: 5, //Normal
          4: 1, //Giant
          5: 0, //Teen Winter
          7: 0, //Leafy
          8: 0, //idk
        }
        if (hasUpgrade('p', 22)) chance[4] *= 2
        if (hasUpgrade('b', 11)) chance[5] = 0.5
        if (hasUpgrade('p', 42)) {
          chance[3] /= 3
          chance[4] *= 1.25
          chance[5] *= 1.75
          chance[7] = 0.5
          chance[8] = 0.5
        }

        let total = 0
        for (let x in chance) {
          total += chance[x]
        }
        let a = Math.random() * total
        let b = 0
        for (let x in chance) {
          b += chance[x]
          if (a < b) { a = +x; break }
        }

        setGridData("p", item, a)
        if (a == 5) player.p.time[item] = gettime() * 50
        if (a == 8) player.p.time[item] = gettime() * 700
      }
      if (player.p.grid[item] == 5 && player.p.time[item] == 0) {
        setGridData("p", item, 6)
      }
      if (player.p.grid[item] == 8 && player.p.time[item] == 0) {
        setGridData("p", item, 9)
      }
      if (hasUpgrade('p', 14)) player.has14 = true
      if (player.has14 && !hasUpgrade('p', 14)) player.p.upgrades.push(14)
    }
  },

  doReset(resettingLayer) {
    let keep = []
    if (hasUpgrade('p', 34)) keep.push("upgrades")
    if (hasMilestone('b', 5)) keep.push("grid")
    if (layers[resettingLayer].row <= this.row) return;

    layerDataReset(this.layer, keep)

    if (hasMilestone('b', 3)) player.p.points = n(10)
  }
})
addLayer("ex", {
  symbol: "Ex",
  position: 0,
  startData() {
    return {
      unlocked: true,
      points: n(0),
    }
  },
  color: "#694dff",
  requires: n(0),
  resource: "Extension",
  type: "none",
  row: 'side',
  layerShown() { return true },
  tabformat: [
    "upgrades",
  ],
  shouldNotify() {
    return layers.ex.buyables[11].canAfford()
  },
  buyables: {
    11: {
      display() { return "Unlock New Stuff.<br><br>Req: " + this.reqText() },
      canAfford() {
        switch (extend()) {
          case 0: return player.p.upgrades.length >= 4;
          case 1: return plantAmt() >= 9 && plantAmt2(4) >= 6;
          case 2: return player.p.upgrades.length >= 12;
          case 3: return plantAmt2(9) >= 1;
        }
      },
      buy() {
        addBuyables("ex", 11, n(1))
      },
      reqText() {
        switch (extend()) {
          case 0: return "Get Four Upgrades.";
          case 1: return "9 Potatoes planted and 6 giant potato.";
          case 2: return "12 potatoes upgrade!";
          case 3: return "A Pawn Potato!";
          case 4: return "This is the endgame!";
        }
      },
      style() {
        return {
          "font-size": "13px"
        }
      }
    }
  },

})
addLayer("b", {
  startData() {
    return {
      unlocked: false,
      points: n(0),
    }
  },

  color: "#db8f15",
  resource: "baked potatoes",
  row: 1,
  branches: ["p"],
  baseResource: "potatos",
  baseAmount() { return player.p.points },
  requires: n(2500),
  type: "normal",
  exponent: 0.3,

  gainMult() {
    return n(1)
  },
  gainExp() {
    return n(1)
  },
  layerShown() { return false },

  upgrades: {
    11: {
      description: "Unlock a new kind of potatoes.",
      cost: n(3),
      unlocked() { return extend() >= 3 }
    }
  },
  milestones: {
    1: {
      requirementDescription: "1 baked potatoes",
      effectDescription: "Potatoes gain is doubled, and significantly boost potatoes growing speed.",
      done() { return player.b.points.gte(1) }
    },
    2: {
      requirementDescription: "2 baked potatoes",
      effectDescription: "Slightly boost potatoes growing speed, and unlock some good upgrades!",
      done() { return player.b.points.gte(2) }
    },
    3: {
      requirementDescription: "3 baked potatoes",
      effectDescription: "Slightly boost growing speed again, and start with 10 potatoes on reset.",
      done() { return player.b.points.gte(3) },
      onComplete() { player.p.points = n(10) }
    },
    4: {
      requirementDescription: "5 baked potatoes",
      effectDescription: "Slightly boost <i>again<\i>, and unlock more upgrades!",
      done() { return player.b.points.gte(5) },
    },
    5: {
      requirementDescription: "1 winter potatoes",
      effectDescription: "Keep farm content on reset.",
      done() { return plantAmt2(6) >= 1 },
    },
    6: {
      requirementDescription: "3 winter potatoes",
      effectDescription: "Unlock 2 more challenge upgrades.",
      done() { return plantAmt2(6) >= 3 },
    },
  },
  onPrestige() {
    if (hasMilestone('b', 3)) player.p.points = n(10)
  },
  clickables: {
    11: {
      display() { return `Click me to do a force reset<br><i>${hasUpgrade('p', 34)?'But why':'If you want'}</i>` },
      onClick() { doReset('b'); doReset('b', true) },
      canClick: true,
      style: { 'width': '190px', 'min-height': '20px', 'border-radius': '5px' }
    }
  },
  tabFormat: {
    "Main": {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        "upgrades",

      ]
    },
    "Milestones": {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        'clickables',
        "blank",
        "milestones",
      ]
    },
  }
})
addLayer("w", {
  startData() {
    return {
      unlocked: false,
      points: n(0),
    }
  },

  color: "#db8f15",
  resource: "Potato War",
  row: 1,
  branches: ["p"],
  baseResource: "potatos",
  baseAmount() { return player.p.points },
  requires: n(2500),
  type: "normal",
  exponent: 0.3,

  gainMult() {
    return n(1)
  },
  gainExp() {
    return n(1)
  },
  layerShown() { return false },
  clickables: {
    11: {
      display() { return "Fight with potatoes in the same district." },
      onClick() {  },
      canClick: true,
      style: { 'width': '320px', 'min-height': '30px', 'border-radius': '5px' }
    }
  },
  tabFormat: {
    "Main": {
      content: [
        "main-display",
        //'clickables',
        "blank",
        ["display-text",`WIP, we run out of ideas<br>
        while waiting for the update, play one potato incremental: <br>
        https://sciencecrafter.github.io/one-potato-incremental/ <br>
        and give suggestion!`],

      ]
    },
  }
})