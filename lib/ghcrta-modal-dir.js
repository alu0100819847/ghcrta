'use babel';
import React from 'react';
import ReactDom from 'react-dom';
import {autobind} from './tools';

export default class GhcrtaDir extends React.Component{
  constructor(props, context, orgs) {
    super(props, context);
    autobind(
      this,
      'closePanel',
      'acceptPanel'
    )

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('modalDir');
    this.element.setAttribute('id', 'modalDir');
    this.dir = atom.project.getDirectories()[0].lowerCasePath
    ReactDom.render(<div>
      <div>Directory:</div> <input style={{width: 100+'%'}} type='text' id='clone_dir'/>
      <button onClick={()=>{this.acceptPanel(); atom.commands.dispatch(container, 'ghcrta:dir')}}>OK</button>
      <button onClick={()=>{this.closePanel(); atom.commands.dispatch(container, 'ghcrta:dir')}}> Close </button>
      <ul style={{color:'red'}} id='pullErr'> </ul>
    </div>, this.element)
  }


  closePanel(){
    let dir_input = document.getElementById('clone_dir');
    dir_input.value = this.dir
  }

  acceptPanel(){
    this.dir = document.getElementById('clone_dir').value
  }


  // Returns an object that can be retrieved when package is activated
  serialize() {}

  static error = []

  static error_pull(add){
    GhcrtaDir.error.push(add)
    let err_list = []
    for(var i = 0; i < GhcrtaDir.error.length; i++){
      var temp = GhcrtaDir.error[i]
      err_list.push(<li>{temp}</li>)
    }
    ReactDom.render(<div>{err_list}</div>, document.getElementById('pullErr'))
  }
  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
