import P5 from "p5";
import { Player, Ease } from "textalive-app-api";
import { SnowFlake, Character } from "/particle.js";

// キャンバスの大きさなどを計算
const width = window.innerWidth; // Math.min(800, window.innerWidth);
const height = window.innerHeight;  // Math.min(600, window.innerHeight);

// 四角い地球を丸くする
const SONG_URL = "http://www.youtube.com/watch?v=KdNHFKTKX2s";
// セカイ
// const SONG_URL = "https://www.youtube.com/watch?v=9vyIPWBeRes";
// グリーンライツ・セレナーデ
// const SONG_URL = "https://www.youtube.com/watch?v=XSLhsjepelI";
// 好き！雪！本気マジック
// const SONG_URL = "https://www.youtube.com/watch?v=79N1O0lF0GY";

// プレイヤーの初期化 / Initialize TextAlive Player
const player = new Player({
  app: {
    appAuthor: "TextAlive",
    appName: "p5.js example",
  },
  mediaElement: "#media",
});

// リスナの登録 / Register listeners
player.addListener({
  onAppReady: (app) => {
    if (!app.managed) {
      player.createFromSongUrl(SONG_URL);
    }
  },

  onVideoReady: () => {
    if (!player.app.managed) {
      document.querySelector("#message").className = "active";
    }
    document.querySelector("#overlay").className = "inactive";
  },

  onPlay: () => {
    document.querySelector("#message").className = "inactive";
    if (!player.app.managed) {
      document.querySelector("#control").className = "";
    }
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
    let w = player.video.firstWord;
    while(w && w.next) {
      w.animate = animatePhrase;
      w = w.next;
    }
  }
});

let snowflakes = []; // array to hold snowflake objects

function animatePhrase(now, unit) {
  if (unit.contains(now)) {
    snowflakes.push(new Character(p5, unit.text));
  }
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

// p5.js を初期化
new P5((p5) => {
  let playButton, pauseButton, rewindButton;

  // キャンバスを作成
  p5.setup = () => {
    p5.createCanvas(width, height);
    // p5.colorMode(p5.HSB, 100);
    p5.fill(240);
    p5.frameRate(50);
    // p5.background(40);
    p5.noStroke();
    // p5.textFont("Noto Sans JP");
    // p5.textAlign(p5.CENTER, p5.CENTER);
  };

  // ビートにあわせて背景を、発声にあわせて歌詞を表示
  p5.draw = () => {
    // プレイヤーが準備できていなかったら何もしない
    if (!player || !player.video) {
      return;
    }

    p5.background('rgb(137, 187, 230)');

    // create a random number of snowflakes each frame
    for (let i = 0; i < p5.random(5); i++) {
      snowflakes.push(new SnowFlake(p5)); // append snowflake object
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

    const position = player.timer.position;  // current playback position
    // - 再生位置より 100 [ms] 前の時点での発声文字を取得
    // - { loose: true } にすることで発声中でなければ一つ後ろの文字を取得
    let char = player.video.findChar(position - 100, { loose: true });
    if (char) {
      let index = player.video.findIndex(char);

      while (char) {
        if (char.endTime + 160 < position) {
          // これ以降の文字は表示する必要がない
          break;
        }
        if (char.startTime - 130 < position && position < char.startTime - 100) {
            snowflakes.push(new Character(p5, char.text));
        }
        char = char.next;
      }
    }
  };
});
