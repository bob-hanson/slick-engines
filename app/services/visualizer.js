import Ember from 'ember';
import Polygon from '../models/polygon';
import Star from '../models/star';

const {
  Service,
  getOwner,
  inject: { service }
} = Ember;

export default Service.extend({
  soundcloud: service(),
  tileSize: null,
  tiles: null,
  stars: null,
  fgRotation: 0.001,
  fgCanvas: null,
  fgCtx: null,
  sfCanvas: null,
  sfCtx: null,
  bgCanvas: null,
  bgCtx: null,

  initVisualizer() {
    var container = document.getElementById('visualizer');

    this.setTilesAndStars();
    this.setupForeground(container);
    this.setupStarField(container);
    this.setupBackground(container);
    this.resizeCanvas();
    this.draw();

    setInterval(this.drawBackground.bind(this), 100);
    setInterval(this.rotateForeground.bind(this), 20);
    window.addEventListener('resize', this.resizeCanvas.bind(this), false);
  },

  setTilesAndStars() {
    this.setProperties({
      tiles: [],
      stars: []
    });
  },

  setupForeground(container) {
    var fgCanvas = document.createElement('canvas');
    this.set('fgCanvas', fgCanvas);
    this.set('fgCtx', fgCanvas.getContext("2d"));
    fgCanvas.setAttribute('style', 'position: absolute; z-index: 10')
    container.appendChild(fgCanvas);
  },

  setupStarField(container) {
    var sfCanvas = document.createElement('canvas');
    this.set('sfCanvas', sfCanvas);
    this.set('sfCtx', sfCanvas.getContext("2d"));
    sfCanvas.setAttribute('style', 'position: absolute; z-index: 5');
    container.appendChild(sfCanvas);
  },

  setupBackground(container) {
    var bgCanvas = document.createElement('canvas');

    this.set('bgCanvas', bgCanvas);
    this.set('bgCtx', bgCanvas.getContext("2d"));
    container.appendChild(bgCanvas);
  },

  drawBackground() {
    var bgCtx = this.get('bgCtx'),
        bgCanvas = this.get('bgCanvas'),
        r, g, b, a, val;

    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    val = this.get('soundcloud').volume/1000;
    r = 200 + (Math.sin(val) + 1) * 28;
    g = val * 2;
    b = val * 8;
    a = Math.sin(val+3*Math.PI/2) + 1;
    bgCtx.beginPath();
    bgCtx.rect(0, 0, bgCanvas.width, bgCanvas.height);
      // create radial gradient
    var grd = bgCtx.createRadialGradient(bgCanvas.width/2, bgCanvas.height/2, val, bgCanvas.width/2, bgCanvas.height/2, bgCanvas.width-Math.min(Math.pow(val, 2.7), bgCanvas.width - 20));
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(0.8, "rgba(" +
          Math.round(r) + ", " +
          Math.round(g) + ", " +
          Math.round(b) + ", 0.4)");

    bgCtx.fillStyle = grd;
    bgCtx.fill();
  },

  resizeCanvas() {
    var fgCanvas = this.get('fgCanvas');

    if (fgCanvas) {
      this.resizeFgCanvas(fgCanvas);
      this.resizeBgCanvas();
      this.resizeSfCanvas(fgCanvas);
      this.setTileSize(fgCanvas);
      this.drawBackground();
      this.makePolygonArray();
      this.makeStarArray();
    }
  },

  resizeFgCanvas(fgCanvas) {
    fgCanvas.width = window.innerWidth;
    fgCanvas.height = window.innerHeight;
    this.get('fgCtx').translate(fgCanvas.width/2,fgCanvas.height/2);
  },

  resizeBgCanvas() {
    var bgCanvas = this.get('bgCanvas');
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  },

  resizeSfCanvas(fgCanvas) {
    var sfCanvas = this.get('sfCanvas');

    sfCanvas.width = window.innerWidth;
    sfCanvas.height = window.innerHeight;
    this.get('sfCtx').translate(fgCanvas.width/2,fgCanvas.height/2);
  },

  setTileSize(fgCanvas) {
    this.set('tileSize', fgCanvas.width > fgCanvas.height ? fgCanvas.width / 25 : fgCanvas.height / 25);
  },

  makePolygonArray() {
      var tiles = this.get('tiles'),
          tileSize = this.get('tileSize'),
          fgCtx = this.get('fgCtx'),
          i = 0;

      tiles.push(this.createPolygon(6, 0, 0, tileSize, fgCtx, i, tiles)); // the centre tile
      i++;
      for (var layer = 1; layer < 7; layer++) {
          tiles.push(this.createPolygon(6, 0, layer, tileSize, fgCtx, i, tiles)); i++;
          tiles.push(this.createPolygon(6, 0, -layer, tileSize, fgCtx, i, tiles)); i++;
          for(var x = 1; x < layer; x++) {
            tiles.push(this.createPolygon(6, x, -layer, tileSize, fgCtx, i, tiles)); i++;
            tiles.push(this.createPolygon(6, -x, layer, tileSize, fgCtx, i, tiles)); i++;
            tiles.push(this.createPolygon(6, x, layer-x, tileSize, fgCtx, i, tiles)); i++;
            tiles.push(this.createPolygon(6, -x, -layer+x, tileSize, fgCtx, i, tiles)); i++;
          }
          for(var y = -layer; y <= 0; y++) {
            tiles.push(this.createPolygon(6, layer, y, tileSize, fgCtx, i, tiles)); i++;
            tiles.push(this.createPolygon(6, -layer, -y, tileSize, fgCtx, i, tiles)); i++;
          }
      }
  },

  createPolygon(sides, x, y, tileSize, fgCtx, i, tiles) {
    return Polygon.create({
      sides: sides,
      x: x,
      y: y,
      tileSize: tileSize,
      ctx: fgCtx,
      num: i,
      tiles: tiles,
      container: getOwner(this)
    });
  },

  createStar(x, y, starSize, sfCtx, fgCanvas) {
    return Star.create({
      x: x,
      y: y,
      starSize: starSize,
      ctx: sfCtx,
      fgCanvas: fgCanvas,
      container: getOwner(this)
    });
  },

  makeStarArray() {
    var x, y, starSize,
        fgCanvas = this.get('fgCanvas'),
        sfCtx = this.get('sfCtx'),
        stars = this.get('stars'),
        limit = fgCanvas.width / 15;

    this.get('stars').clear();
    for (var i = 0; i < limit; i ++) {
      x = (Math.random() - 0.5) * fgCanvas.width;
      y = (Math.random() - 0.5) * fgCanvas.height;
      starSize = (Math.random()+0.1)*3;
      stars.push(this.createStar(x, y, starSize, sfCtx, fgCanvas));
    }
  },

  rotateForeground() {
    var audioSource = this.get('soundcloud'),
        fgRotation = this.get('fgRotation'),
        tiles = this.get('tiles');

    tiles.forEach(function(tile) {
      tile.rotateVertices(fgRotation, audioSource);
    });
  },

  draw() {
    var fgCanvas = this.get('fgCanvas'),
        fgCtx = this.get('fgCtx'),
        sfCtx = this.get('sfCtx'),
        stars = this.get('stars'),
        tiles = this.get('tiles');

    fgCtx.clearRect(-fgCanvas.width, -fgCanvas.height, fgCanvas.width*2, fgCanvas.height *2);
    sfCtx.clearRect(-fgCanvas.width/2, -fgCanvas.height/2, fgCanvas.width, fgCanvas.height);

    stars.forEach(function(star) {
      star.drawStar();
    });
    tiles.forEach(function(tile) {
      tile.drawPolygon();
    });
    tiles.forEach(function(tile) {
      if (tile.get('hasHighlight')) {
        tile.drawHighlight();
      }
    });
    window.requestAnimationFrame(this.draw.bind(this));
  }

});
