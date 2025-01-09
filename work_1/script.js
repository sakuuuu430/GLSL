
import { WebGLUtility, ShaderProgram } from '../lib/webgl.js';
import { Pane } from '../lib/tweakpane-4.0.0.min.js';

window.addEventListener('DOMContentLoaded', async () => {
  const app = new WebGLApp();
  window.addEventListener('resize', app.resize, false);
  app.init('webgl-canvas');
  await app.load();
  app.setup();
  app.render();
}, false);

class WebGLApp {
  /**
   * @constructor
   */
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.running = false;

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);

    this.previousTime = 0;
    this.timeScale = 1.0;
    this.uTime = 0.0
    this.uFireSize = 3.0;
    this.uBlockSize = 150.0;

    // tweakpane を初期化
    const pane = new Pane();
    pane.addBlade({
      view: 'slider',
      label: 'time-scale',
      min: 0.0,
      max: 2.0,
      value: this.timeScale,
    })
    .on('change', (v) => {
      this.timeScale = v.value;
    });
    
    pane.addBlade({
      view: 'slider',
      label: 'fireSize',
      min: 1.5,
      max: 5.0,
      value: this.uFireSize,
    })
    .on('change', (v) => {
      this.uFireSize = v.value;
    });

    pane.addBlade({
      view: 'slider',
      label: 'blockSize',
      min: 10,
      max: 300,
      value: this.uBlockSize,
    })
    .on('change', (v) => {
      this.uBlockSize = v.value;
    });
  }
  /**
   * シェーダやテクスチャ用の画像など非同期で読み込みする処理を行う。
   * @return {Promise}
   */
  async load() {
    const mainVs = await WebGLUtility.loadFile('./main.vert');
    const mainFs = await WebGLUtility.loadFile('./main.frag');
    this.mainShaderProgram = new ShaderProgram(this.gl, {
      vertexShaderSource: mainVs,
      fragmentShaderSource: mainFs,
      attribute: [
        'position',
      ],
      stride: [
        3,
      ],
      uniform: [
        'resolution',
        'time',
        'fireSize',
      ],
      type: [
        'uniform2fv',
        'uniform1f',
        'uniform1f',
      ],
    });
    // ポストプロセス用のシェーダ
    const postVs = await WebGLUtility.loadFile('./post.vert');
    const postFs = await WebGLUtility.loadFile('./post.frag');
    this.postShaderProgram = new ShaderProgram(this.gl, {
      vertexShaderSource: postVs,
      fragmentShaderSource: postFs,
      attribute: [
        'position',
      ],
      stride: [
        3,
      ],
      uniform: [
        'textureUnit',
        'time',
        'blockSize',
      ],
      type: [
        'uniform1i',
        'uniform1f',
        'uniform1f',
      ],
    });
  }
  /**
   * WebGL のレンダリングを開始する前のセットアップを行う。
   */
  setup() {
    const gl = this.gl;

    this.setupGeometry();
    this.resize();
    this.running = true;
    this.previousTime = Date.now();

    this.buffers = WebGLUtility.createFramebuffer(this.gl, this.canvas.width, this.canvas.height);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
  }
  /**
   * ジオメトリ（頂点情報）を構築するセットアップを行う。
   */
  setupGeometry() {
    this.planePosition = [
      -1.0,  1.0,  0.0,
       1.0,  1.0,  0.0,
      -1.0, -1.0,  0.0,
       1.0, -1.0,  0.0,
    ];
    this.planeIndex = [
      0, 2, 1,
      1, 2, 3,
    ];
    this.planeVbo = [
      WebGLUtility.createVbo(this.gl, this.planePosition),
    ];
    this.planeIbo = WebGLUtility.createIbo(this.gl, this.planeIndex);
  }
  /**
   * WebGL を利用して描画を行う。
   */
  render() {
    // running が true の場合は requestAnimationFrame を呼び出す
    if (this.running === true) {
      requestAnimationFrame(this.render);
    }

    // 経過時間の処理
    const now = Date.now();
    const time = (now - this.previousTime) / 1000;
    this.uTime += time * this.timeScale;
    this.previousTime = now;

    // メインシーンとポストプロセスを実行
    this.renderMain();
    this.renderPostProcess();
  }
  /**
   * メインシーンの描画
   */
  renderMain() {
    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffers.framebuffer);

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.mainShaderProgram.use();
    this.mainShaderProgram.setAttribute(this.planeVbo, this.planeIbo);
    this.mainShaderProgram.setUniform([
      [this.canvas.width, this.canvas.height],
      this.uTime,
      this.uFireSize,
    ]);
    gl.drawElements(gl.TRIANGLES, this.planeIndex.length, gl.UNSIGNED_SHORT, 0);
  }
  /**
   * ポストプロセスでの描画
   */
  renderPostProcess() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.buffers.texture);

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.postShaderProgram.use();
    this.postShaderProgram.setAttribute(this.planeVbo, this.planeIbo);
    this.postShaderProgram.setUniform([
      0,
      this.uTime,
      this.uBlockSize,
    ]);
    // インデックスバッファを使って描画
    gl.drawElements(gl.TRIANGLES, this.planeIndex.length, gl.UNSIGNED_SHORT, 0);
  }
  /**
   * リサイズ処理を行う。
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // フレームバッファのサイズもウィンドウの大きさに同期させる
    if (this.buffers != null) {
      const gl = this.gl;
      const width = this.canvas.width;
      const height = this.canvas.height;
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.buffers.renderbuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
      gl.bindTexture(gl.TEXTURE_2D, this.buffers.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
  }
  /**
   * WebGL を実行するための初期化処理を行う。
   * @param {HTMLCanvasElement|string} canvas - canvas への参照か canvas の id 属性名のいずれか
   * @param {object} [option={}] - WebGL コンテキストの初期化オプション
   */
  init(canvas, option = {}) {
    if (canvas instanceof HTMLCanvasElement === true) {
      this.canvas = canvas;
    } else if (Object.prototype.toString.call(canvas) === '[object String]') {
      const c = document.querySelector(`#${canvas}`);
      if (c instanceof HTMLCanvasElement === true) {
        this.canvas = c;
      }
    }
    if (this.canvas == null) {
      throw new Error('invalid argument');
    }
    this.gl = this.canvas.getContext('webgl', option);
    if (this.gl == null) {
      throw new Error('webgl not supported');
    }
  }
}
