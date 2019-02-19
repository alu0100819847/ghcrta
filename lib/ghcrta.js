'use babel';

import GhcrtaView from './ghcrta-view';
import GhcrtaDir from './ghcrta-modal-dir';
import { CompositeDisposable } from 'atom';

export default {
  subscriptions: null,

  activate(state) {

    console.log(atom.config.get('ghcrta.token'))
    /*atom.config.set('ghcrta.key', 'otap')
    console.log(atom.config.get('ghcrta.key'))*/
    this.modalPanel = atom.workspace.addModalPanel({
      item: new GhcrtaDir,
      visible: false
    });
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable(
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://ghcrta') {
          if(!this.credentials) this.credentials = new GhcrtaView()
          return this.credentials;
        }
      }),
    );

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ghcrta:toggle': () => this.toggle(),
      'ghcrta:dir': () => this.toggleModalDir()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  deserializeGhcrtaView(serialized){
    this.activate(serialized)
    atom.workspace.toggle('atom://ghcrta');
  },

  toggle() {
    atom.workspace.toggle('atom://ghcrta');
  },

  toggleModalDir(){
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
