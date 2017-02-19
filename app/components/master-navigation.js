import Ember from 'ember';

const {
  Component,
  computed: { alias },
  inject: { service }
} = Ember;

export default Component.extend({
  currentSession: service(),
  tagName: 'ul',
  classNames: ['master-navigation'],
  segmentTitle: alias('currentSession.segmentTitle')
});
