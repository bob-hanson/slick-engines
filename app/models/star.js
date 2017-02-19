import Ember from 'ember';

const {
 inject: { service }
} = Ember;

export default Ember.Object.extend({
  soundcloud: service(),
  x: null,
  y: null,
  angle: null,
  starSize: null,
  ctx: null,
  high: 0,
  fgCanvas: null,

  init() {
    this._super();
    this.setAngle();
  },

  setAngle() {
    this.set('angle', Math.atan(Math.abs(this.get('y'))/Math.abs(this.get('x'))));
  },

  drawStar() {
    var x = this.get('x'),
        y = this.get('y'),
        audioSource = this.get('soundcloud'),
        high = this.get('high'),
        ctx = this.get('ctx'),
        starSize = this.get('starSize'),
        angle = this.get('angle'),
        fgCanvas = this.get('fgCanvas'),
        distanceFromCentre = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
        brightness = 200 + Math.min(Math.round(high * 5), 55),
        lengthFactor = 1 + Math.min(Math.pow(distanceFromCentre,2)/30000 * Math.pow(audioSource.volume, 2)/6000000, distanceFromCentre),
        toX = Math.cos(angle) * -lengthFactor,
        toY = Math.sin(angle) * -lengthFactor,
        speed = lengthFactor/20 * starSize,
        limitY = fgCanvas.height/2 + 500,
        limitX = fgCanvas.width/2 + 500;



      ctx.lineWidth = 0.5 + distanceFromCentre/2000 * Math.max(starSize/2, 1);
      ctx.strokeStyle = 'rgba(' + brightness + ', ' + brightness + ', ' + brightness + ', 1)';
      ctx.beginPath();
      ctx.moveTo(x,y);

      toX *= x > 0 ? 1 : -1;
      toY *= y > 0 ? 1 : -1;
      ctx.lineTo(x + toX, y + toY);
      ctx.stroke();
      ctx.closePath();

      // starfield movement coming towards the camera
      high -= Math.max(high - 0.0001, 0);
      if (speed > high) {
        high = speed;
      }
      var dX = Math.cos(angle) * high;
      var dY = Math.sin(angle) * high;
      x += x > 0 ? dX : -dX;
      y += y > 0 ? dY : -dY;

      if ((y > limitY || y < -limitY) || (x > limitX || x < -limitX)) {
          x = (Math.random() - 0.5) * fgCanvas.width/3;
          y = (Math.random() - 0.5) * fgCanvas.height/3;
          angle = Math.atan(Math.abs(y)/Math.abs(x));
      }
    }

});
