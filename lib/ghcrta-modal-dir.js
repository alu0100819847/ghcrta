'use babel';
import React from 'react';
import ReactDom from 'react-dom';
import {autobind} from './tools';
var path = require('path')

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
    this.dir = path.join(require('os').homedir(), 'Desktop')
    console.log(this.dir)
    if(atom.project.getDirectories()[0]){
      this.dir = atom.project.getDirectories()[0].lowerCasePath
    }

    ReactDom.render(<div>
      <div>Directory:</div> <input style={{width: 100+'%'}} type='text' id='clone_dir'/>
      <button onClick={()=>{this.acceptPanel(); atom.commands.dispatch(container, 'ghcrta:dir')}}>OK</button>
      <button onClick={()=>{this.closePanel(); atom.commands.dispatch(container, 'ghcrta:dir')}}> Close </button>
      <ul style={{color:'red',overflow: 'scroll', maxHeight: (atom.getSize().height*0.5)+'px'}} id='pullErr'> </ul>
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

  static error_pull(add, name){
    console.log(name)
    GhcrtaDir.error.push({'err': add, 'name': name})
    let err_list = []
    console.log(err_list)
    for(var i = 0; i < GhcrtaDir.error.length; i++){
      var temp_err = GhcrtaDir.error[i].err
      var temp_name = GhcrtaDir.error[i].name
      err_list.push(<li>{temp_name}: {temp_err}</li>)
    }
    console.log(GhcrtaDir.error)
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
