
kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor:[51,151,255]
  })


  // Snelheid
  const MOVE_SPEED = 120
  const JUMP_FORCE = 360
  
  let CURRENT_JUMP_FORCE = JUMP_FORCE
  const FALL_DEATH = 400
  const ENEMY_SPEED = 20
  
  let isJumping = true

  // Objects
  loadRoot('https://i.imgur.com/')
  loadSprite('coin', '49Z2b1Q.png')
  loadSprite('mushroom', 'g5iF36I.png')
  loadSprite('wolk', 'S64SpJv.png')
  loadSprite('block', 'RZo9LJX.png')
  loadSprite('Character', 'NuL2ki0.png')
  loadSprite('Shield', '0wMd92p.png')
  loadSprite('surprise', 'fPbDcg5.png')
  loadSprite('unboxed', 'bdrLpi6.png')
  loadSprite('barrier', 'KOuFI1s.png')
 

  
  //Map and Word design
  scene("game", ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')
  
    const maps = [
      [
      '+                                                                                                                                                                                     -',
      '-                                                                                                                                                                                     -',
      '-                                $                                                                                                                                                    -',
      '-                              +++  $                                                                                                   *                                             -',
      '-                           +++       $      $                                                                                         $                                              -',
      '-          $             +++            $   ++                   $                                                               ^$   +++                                             -',
      '-        +++++        +++              +++$                      +++                                                          $  +++                                                  -',
      '-                                          $                                                                             $   +++                                          $           -',
      '-    $  $  $  $   $  ^   ^          $ ^  ^   $  $ $  $          $  $$ ^^^       $ $  $    $       $  ^^ $       ^ ^    +++               ^ ^    ^$   ^   $   $$ ^ ^ ^    + +    $     -',
      '===============================   =========================  =================  =====  ======   ============  ==========              ===================================    =========-',
      ],
 
    ]
  
    //Leveleenheden
    const levelCfg = {
      width: 20,
      height: 20,
      '=': [sprite('block'), solid()],
      '$': [sprite('coin'), 'coin'],
      '%': [sprite('surprise'), solid(), 'coin-surprise'],
      '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
      '}': [sprite('unboxed'), solid()],
      '+': [sprite('wolk'), solid()],
      '-': [sprite('barrier'), solid()],
      
      '^': [sprite('mushroom'), solid(), 'dangerous'],
      

  
    }
  
    const gameLevel = addLevel(maps[level], levelCfg)
  
//Scoreboard

    const scoreLabel = add([
      text(score),
      pos(30, 6),
      layer('ui'),
      {
        value: score,
      }
    ])
    add([text('level ' + parseInt(level + 1) ), pos(40, 6)])
    
    function big() {
      let timer = 0
      let isBig = false
      return {
        update() {
          if (isBig) {
            CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
            timer -= dt()
            if (timer <= 0) {
              this.smallify()
            }
          }
        },
        isBig() {
          return isBig
        },
        smallify() {
          this.scale = vec2(1)
          CURRENT_JUMP_FORCE = JUMP_FORCE
          timer = 0
          isBig = false
        },
        biggify(time) {
          this.scale = vec2(2)
          timer = time
          isBig = true     
        }
      }
    }
  
    const player = add([
      sprite('Character'), solid(),
      pos(30, 0),
      body(),
      big(),
      origin('bot')
    ])
  
    action('mushroom', (m) => {
      m.move(20, 0)
    })
  
    player.on("headbump", (obj) => {
      if (obj.is('coin-surprise')) {
        gameLevel.spawn('$', obj.gridPos.sub(0, 1))
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0,0))
      }
      if (obj.is('mushroom-surprise')) {
        gameLevel.spawn('#', obj.gridPos.sub(0, 1))
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0,0))
      }
    })
  
    player.collides('mushroom', (m) => {
      destroy(m)
      player.biggify(6)
    })
  
    player.collides('coin', (c) => {
      destroy(c)
      scoreLabel.value++
      scoreLabel.text = scoreLabel.value
    })
  
    action('dangerous', (d) => {
      d.move(-ENEMY_SPEED, 0)
    })
  
    player.collides('dangerous', (d) => {
      if (isJumping) {
        destroy(d)
      } else {
        go('lose', { score: scoreLabel.value})
      }
    })
  
    player.action(() => {
      camPos(player.pos)
      if (player.pos.y >= FALL_DEATH) {
        go('lose', { score: scoreLabel.value})
      }
    })
  
    player.collides('pipe', () => {
      keyPress('down', () => {
        go('game', {
          level: (level + 1) % maps.length,
          score: scoreLabel.value
        })
      })
    })
  
    keyDown('left', () => {
      player.move(-MOVE_SPEED, 0)
    })
  
    keyDown('right', () => {
      player.move(MOVE_SPEED, 0)
    })
  
    player.action(() => {
      if(player.grounded()) {
        isJumping = false
      }
    })
  
    keyPress('space', () => {
      if (player.grounded()) {
        isJumping = true
        player.jump(CURRENT_JUMP_FORCE)
      }
    })
  })
  
  scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width()/2, height()/ 2)])
  })
  
  start("game", { level: 0, score: 0})