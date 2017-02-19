import Star from '../models/star';
export function initialize(application) {
  application.register('star:main', Star, {singleton: false});
}

export default {
  name: 'register-star',
  initialize
};
