import Ember from 'ember';

const {
  computed: { gt },
  inject: { service }
} = Ember;

export default Ember.Object.extend({
  soundcloud: service(),
  vertices: null,
  sides: null,
  tiles: null,
  tileSize: null,
  ctx: null,
  num: null, // the number of the tile, starting at 0
  high: 0, // the highest colour value, which then fades out
  highlight: 0, // for highlighted stroke effect
  decay: 0,
  x: 0,
  y: 0,
  cubed: null,

  hasHighlight: gt('highlight', 0),

  init() {
    this.setDecay();
    this.set('vertices', []);
    this.calculateCoords();
    this.calculateVertices();
  },

  setDecay() {
    this.set('decay', this.get('num') > 42 ? 1.5 : 2);
  },

  calculateCoords() {
    var tileSize = this.get('tileSize'),
        step = Math.round(Math.cos(Math.PI/6)*tileSize*2);

    this.set('y', Math.round(step * Math.sin(Math.PI/3) * -this.get('y')));
    this.set('x', Math.round(this.get('x') * step + this.get('y') * step/2 ));
  },

  calculateVertices() {
    var sides = this.get('sides'),
        tileSize = this.get('tileSize');

    for (var i = 1; i <= sides; i += 1) {
      this.set('x', this.get('x') + tileSize * Math.cos(i * 2 * Math.PI / sides + Math.PI/6));
      this.set('y', this.get('y') + tileSize * Math.sin(i * 2 * Math.PI / sides + Math.PI/6));
      this.get('vertices').push([this.get('x'), this.get('y')]);
    }
  },

  rotateVertices(fgRotation) {
    var rotation = fgRotation,
        audioSource = this.get('soundcloud');

    rotation -= audioSource.volume > 10000 ? Math.sin(audioSource.volume/800000) : 0;
    for (var i = 0; i <= this.sides-1;i += 1) {
      this.vertices[i][0] = this.vertices[i][0] -  this.vertices[i][1] * Math.sin(rotation);
      this.vertices[i][1] = this.vertices[i][1] +  this.vertices[i][0] * Math.sin(rotation);
    }
  },

  calculateOffset(coords) {
    var audioSource = this.get('soundcloud'),
        angle = Math.atan(coords[1]/coords[0]),
        distance = Math.sqrt(Math.pow(coords[0], 2) + Math.pow(coords[1], 2)), // a bit of pythagoras
        mentalFactor = Math.min(Math.max((Math.tan(audioSource.volume/6000) * 0.5), -20), 2), // this factor makes the visualization go crazy wild
        offsetFactor = Math.pow(distance/3, 2) * (audioSource.volume/2000000) * (Math.pow(this.high, 1.3)/300) * mentalFactor,
        offsetX = Math.cos(angle) * offsetFactor,
        offsetY = Math.sin(angle) * offsetFactor;

      offsetX *= (coords[0] < 0) ? -1 : 1;
      offsetY *= (coords[0] < 0) ? -1 : 1;
      return [offsetX, offsetY];
  },

  drawPolygon() {
    var audioSource = this.get('soundcloud'),
        streamData = audioSource.get('streamData'),
        ctx = this.get('ctx'),
        tiles = this.get('tiles'),
        vertices = this.get('vertices'),
        sides = this.get('sides'),
        offset = this.calculateOffset(vertices[0]),
        num = this.get('num'),
        high = this.get('high'),
        decay = this.get('decay'),
        bucket = Math.ceil(streamData.length/tiles.length*num),
        val = Math.pow((streamData[bucket]/255),2)*255,
        r, g, b, a;

      val = (val * num > 42) ? 1.1 : 1;
      // establish the value for this tile
      if (val > high) {
        high = val;
      } else {
        high -= decay;
        val = high;
      }

      // figure out what colour to fill it and then draw the polygon
      if (val > 0) {
        ctx.beginPath();
        ctx.moveTo(vertices[0][0] + offset[0], vertices[0][1] + offset[1]);
          // draw the polygon
        for (var i = 1; i <= sides-1;i += 1) {
          offset = this.calculateOffset(vertices[i]);
          ctx.lineTo (vertices[i][0] + offset[0], vertices[i][1] + offset[1]);
        }
        ctx.closePath();

        if (val > 128) {
            r = (val-128)*2;
            g = ((Math.cos((2*val/128*Math.PI/2)- 4*Math.PI/3)+1)*128);
            b = (val-105)*3;
        } else if (val > 175) {
            r = (val-128)*2;
            g = 255;
            b = (val-105)*3;
        } else {
            r = ((Math.cos((2*val/128*Math.PI/2))+1)*128);
            g = ((Math.cos((2*val/128*Math.PI/2)- 4*Math.PI/3)+1)*128);
            b = ((Math.cos((2.4*val/128*Math.PI/2)- 2*Math.PI/3)+1)*128);
        }

        if (val > 210) {
         this.cubed = val; // add the cube effect if it's really loud
        }
        if (val > 120) {
          this.set('highlight', 100); // add the highlight effect if it's pretty loud
        }
        // set the alpha
        var e = 2.7182;
            a = (0.5/(1 + 40 * Math.pow(e, -val/8))) + (0.5/(1 + 40 * Math.pow(e, -val/20)));

        ctx.fillStyle = "rgba(" +
              Math.round(r) + ", " +
              Math.round(g) + ", " +
              Math.round(b) + ", " +
              a + ")";
        ctx.fill();
          // stroke
        if (val > 20) {
          let strokeVal = 20;
          ctx.strokeStyle =  "rgba(" + strokeVal + ", " + strokeVal + ", " + strokeVal + ", 0.5)";
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
  },

  drawHighlight() {
    var ctx = this.get('ctx'),
        vertices = this.get('vertices'),
        offset = this.calculateOffset(vertices[0]),
        highlight = this.get('highlight'),
        alpha = highlight/100,
        sides = this.get('sides');

      ctx.beginPath();
      // draw the highlight
      ctx.moveTo(vertices[0][0] + offset[0], vertices[0][1] + offset[1]);
      // draw the polygon
      for (var i = 0; i <= sides-1;i += 1) {
        offset = this.calculateOffset(vertices[i]);
        ctx.lineTo (vertices[i][0] + offset[0], vertices[i][1] + offset[1]);
      }
      ctx.closePath();
      ctx.strokeStyle =  "rgba(255, 255, 255, " + alpha + ")";
      ctx.lineWidth = 1;
      ctx.stroke();
      this.set('highlight', highlight -= 0.5);
  }

});
