import P5 from "p5";
import { Player, Ease } from "textalive-app-api";

// 四角い地球を丸くする
// const SONG_URL = "http://www.youtube.com/watch?v=KdNHFKTKX2s";
// セカイ
// const SONG_URL = "https://www.youtube.com/watch?v=9vyIPWBeRes";
// グリーンライツ・セレナーデ
const SONG_URL = "https://www.youtube.com/watch?v=XSLhsjepelI";
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

let init = false;

// リスナの登録 / Register listeners
player.addListener({
  onAppReady: (app) => {
    if (!app.managed) {
      player.createFromSongUrl(SONG_URL);
    }
  },

  onTextLoad: (text) => {
    // Webフォントを確実に読み込むためDOM要素に歌詞を貼り付ける
    document.querySelector("#dummy").textContent = text;
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
});

// 再生終了後に表示する巻き戻しボタン
document.querySelector("#rewind").addEventListener("click", () => {
  player.requestPlay();
});

/*
 * @name Snowflakes
 * @description Particle system simulating the motion of falling snowflakes.
 * Uses an array of objects to hold the snowflake particles.
 * Contributed by Aatish Bhatia.
 */

let snowflakes = []; // array to hold snowflake objects
// p5.js を初期化
new P5((p5) => {
  // キャンバスの大きさなどを計算
  const width = window.innerWidth; // Math.min(800, window.innerWidth);
  const height = window.innerHeight;  // Math.min(600, window.innerHeight);
  const margin = 30;
  const numChars = 10;
  const textAreaWidth = width - margin * 2;

  // snowflake class
  function snowflake() {
    // initialize coordinates
    this.posX = 0;
    this.posY = p5.random(-50, 0);
    this.initialangle = p5.random(0, 2 * Math.PI);
    this.size = p5.random(2, 5);

    // radius of snowflake spiral
    // chosen so the snowflakes are uniformly spread out in area
    this.radius = Math.sqrt(p5.random(Math.pow(width / 2, 2)));

    this.update = function(time) {
      // x position follows a circle
      let w = 0.1; // angular speed
      let angle = w * time + this.initialangle;
      this.posX = width / 2 + this.radius * Math.sin(angle);

      // different size snowflakes fall at slightly different y speeds
      this.posY += Math.pow(this.size, 0.5);

      // delete snowflake if past end of screen
      if (this.posY > height) {
        let index = snowflakes.indexOf(this);
        snowflakes.splice(index, 1);
      }
    };

    this.display = function() {
      p5.fill(p5.color(255, 255, 255));
      p5.noStroke();
      p5.ellipse(this.posX, this.posY, this.size);
    };
  }
  // キャンバスを作成
  p5.setup = () => {
    p5.createCanvas(width, height);
    // p5.colorMode(p5.HSB, 100);
    p5.fill(240);
    // p5.frameRate(30);
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

    p5.background('rgb(211, 226, 245)');

    // create a random number of snowflakes each frame
    for (let i = 0; i < p5.random(5); i++) {
      snowflakes.push(new snowflake()); // append snowflake object
    }

    let t = p5.frameCount / 60; // update time
    // loop through snowflakes with a for..of loop
    for (let flake of snowflakes) {
      flake.update(t); // update snowflake position
      flake.display(); // draw snowflake
    }

    const position = player.timer.position;  // current playback position
    // 歌詞
    // - 再生位置より 100 [ms] 前の時点での発声文字を取得
    // - { loose: true } にすることで発声中でなければ一つ後ろの文字を取得
    let char = player.video.findChar(position - 100, { loose: true });

    if (char) {
      // 位置決めのため、文字が歌詞全体で何番目かも取得しておく
      let index = player.video.findIndex(char);

      while (char) {
        if (char.endTime + 160 < position) {
          // これ以降の文字は表示する必要がない
          break;
        }
        if (char.startTime < position + 100) {
          const x = ((index % numChars) + 0.5) * (textAreaWidth / numChars);
          let transparency,
            y = 0,
            size = 39;

          // 100 [ms] かけてフェードインしてくる
          if (position < char.startTime) {
            const progress = 1 - (char.startTime - position) / 100;
            const eased = Ease.circIn(progress);
            transparency = progress;
            size = 39 * eased + Math.min(width, height) * (1 - eased);
          }
          // 160 [ms] かけてフェードアウトする
          else if (char.endTime < position) {
            const progress = (position - char.endTime) / 160;
            const eased = Ease.quintIn(progress);
            transparency = 1 - eased;
            y = -eased * (height / 2);
          }
          // 発声区間中は完全に不透明
          else {
            transparency = 1;
          }

          p5.fill(0, 0, 100, transparency * 100);
          p5.textSize(size);
          p5.text(char.text, margin + x, height / 2 + y);
        }
        char = char.next;
        index++;
      }
    }
  };
});
