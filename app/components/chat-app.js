import Ember from 'ember';

const {
  Component
} = Ember;

export default Component.extend({

  classNames: ['chat'],
  classNameBindings: ['isActive:is-active'],
  isActive: false,

  toggleChatView() {
    this.toggleProperty('isActive');
  },

  actions: {

    triggerShowHideChat() {
      this.toggleChatView()
    }

  }

});
