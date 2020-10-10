import P5 from "p5";
import { Player, Ease } from "textalive-app-api";
import { SnowFlake, Character } from "/particle.js";

// プレイヤーの初期化 / Initialize TextAlive Player
const player = new Player({
  app: {
    appAuthor: "TextAlive",
    appName: "p5.js example",
  },
  mediaElement: "#media",
});

// キャンバスの大きさなどを計算
const width = window.innerWidth; // Math.min(800, window.innerWidth);
const height = window.innerHeight;  // Math.min(600, window.innerHeight);

// hinata's playlist: https://songle.jp/users/hinata
// 四角い地球を丸くする
const SONG_URL = "http://www.youtube.com/watch?v=KdNHFKTKX2s";
// セカイ
// const SONG_URL = "https://www.youtube.com/watch?v=9vyIPWBeRes";
// グリーンライツ・セレナーデ
// const SONG_URL = "https://www.youtube.com/watch?v=XSLhsjepelI";
// ハッピーシンセサイザ
// const SONG_URL = "https://www.nicovideo.jp/watch/sm12825985";
// アゲアゲアゲイン
// const SONG_URL = "https://www.youtube.com/watch?v=uwwU55zBYlQ";
// Twinkle Days
// const SONG_URL = "https://www.nicovideo.jp/watch/sm20629168";
// 雪がとける前に
// const SONG_URL = "https://www.youtube.com/watch?v=zLpQTF_2TZM";
// エレクトロサチュレイタ
// const SONG_URL = "https://www.youtube.com/watch?v=hN2PJ8mBF6w";

let snowflakes = []; // array to hold snowflake objects

function jumpToStart() {
  // Seek to the first character in lyrics text
  player.video && player.requestMediaSeek(player.video.firstChar.startTime);
}

function playVideo() {
  console.log("play button is clicked");
  player.video && player.requestPlay();
}

function pauseVideo() {
  console.log("pause button is clicked");
  player.video && player.requestPause();
}

function rewindVideo() {
  console.log("rewind button is clicked");
  player.video && player.requestMediaSeek(0);
}

function randomTextSizeForPC() {
  return p5.random(width * 0.04, width * 0.06);
}

function randomTextSizeForMobile() {
  return p5.random(width * 0.08, width * 0.10);
}

const IS_MOBILE = width < 500;
console.log("IS_MOBILE", IS_MOBILE);
let randomTextSize = IS_MOBILE ? randomTextSizeForMobile : randomTextSizeForPC;

const sketch = (p5) => {
  let playButton, pauseButton, rewindButton, jumpToStartButton;

  function createButton(name, x, y, callback) {
    let button = p5.createButton(name);
    button.position(x, y);
    button.mousePressed(callback);
    button.style('font-size', '20px');
    return button;
  }

  // キャンバスを作成
  p5.setup = () => {
    p5.createCanvas(width, height);
    p5.fill(240);
    p5.frameRate(50);
    p5.noStroke();
    p5.textFont("Noto Sans JP");
    p5.textAlign(p5.CENTER, p5.CENTER);

    // Only for debug
    // jumpToStartButton = createButton('jump', 20, height - 50, jumpToStart);
  };

  // ビートにあわせて背景を、発声にあわせて歌詞を表示
  p5.draw = () => {
    // プレイヤーが準備できていなかったら何もしない
    if (!player || !player.video) {
      return;
    }

    p5.background('rgb(137, 187, 230)');

    let nFlakesPerFrame = IS_MOBILE ? 1 : 3;
    for(let i = 0; i < nFlakesPerFrame; i++) {
      snowflakes.push(new SnowFlake(p5));
    }

    let time = p5.frameCount / 60; // update time
    // loop through snowflakes with a for..of loop
    for (let flake of snowflakes) {
      flake.update(time); // update snowflake position
      flake.display(); // draw snowflake
      // delete snowflake if past end of screen
      if (flake.y() > height) {
        let index = snowflakes.indexOf(flake);
        snowflakes.splice(index, 1);
      }
    }
  };
};

let p5 = new P5(sketch);

class TextParticleGenerator {
  constructor() {
    this.previousStartTime = 0.0;
  }
  generate(now, unit) {
    // console.log("animateText is called");
    if (unit.contains(now+80) && unit.startTime != this.previousStartTime) {
      let size = randomTextSize();
      console.log("size = ", size);
      snowflakes.push(new Character(p5, unit.text, size));
      this.previousStartTime = unit.startTime;
    }
  }
}

let textParticleGenerator = new TextParticleGenerator();

// リスナの登録 / Register listeners
player.addListener({
  onAppReady: (app) => {
    if (!app.managed) {
      player.createFromSongUrl(SONG_URL);
    }
  },

  onVideoReady: () => {
    document.querySelector("#message").className = "active";
    document.querySelector("#overlay").className = "inactive";
  },

  onPlay: () => {
    document.querySelector("#message").className = "inactive";
    console.log("player.onPlay");
  },

  onPause: () => {
    console.log("player.onPause");
  },

  onSeek: () => {
    console.log("player.onSeek");
  },

  onStop: () => {
    if (!player.app.managed) {
      document.querySelector("#control").className = "active";
    }
    console.log("player.onStop");
  },

  onTimerReady: () => {
    let w = player.video.firstChar;
    while(w && w.next) {
      w.animate = textParticleGenerator.generate;
      w = w.next;
    }
  }
});
