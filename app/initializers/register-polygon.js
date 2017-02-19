import Polygon from '../models/polygon';
export function initialize(application) {
  application.register('polygon:main', Polygon, {singleton: false});
}

export default {
  name: 'register-polygon',
  initialize
};
