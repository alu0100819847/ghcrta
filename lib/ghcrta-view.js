'use babel';
import React from 'react';
import ReactDom from 'react-dom';
import {autobind, asyncClasses} from './tools';
var github = require('octonode');
import GhcrtaClient from './ghcrta-client'

export default class GhcrtaView extends React.Component{

  constructor(props, context) {
    super(props, context);

    this.token = atom.config.get('ghcrta.token')
    this.id = atom.config.get('ghcrta.id')
    this.name = ''
    this.token_name = atom.config.get('ghcrta.token_name')

    if(this.token_name == ''){
      var time = new Date()
      var user = atom.getLoadSettings().env.USER
      this.token_name = 'ghcrta-'+user+'-'+Date.UTC(time.getFullYear(), time.getDate(), time.getDay(), time.getHours(), time.getMinutes(), time.getSeconds())
      console.log(this.token_name)
    }

    head = document.createElement('div');
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('ghcrta');
    this.element.setAttribute('id', 'container');


    var tempClientClass = asyncClasses(new GhcrtaClient)

    tempClientClass.then((result)=>{

      var client = github.client(result.token_);
      var ghme = client.me();
      var asyncFunct = new Promise((resolve, reject) => {
        ghme.info(function(err, data, headers) {
          if(err){
            console.log(err)
            resolve(err)
          }
          else{
            resolve('')
          }
        });
      })

      asyncFunct.then((response) =>{
        console.log(response)
        this.client = result
        if(response == ''){
          result.client_ = client

          result.logedIn(this.element)
          //this.logedIn()
        } else {
          console.log(response)
          if(parseInt(response) == 443){
            ReactDom.render(<div>Internet Connexion Lost</div>, this.element)
          }
          this.client.renderLogIn(this.element, response.message)
        }

      })
    })
  }

  serialize() {
    return {

      deserializer: 'ghcrta/GhcrtaView'
    }
  }

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    // Used by Atom for tab text
    return 'GHCR';
  }

  getURI() {
    return 'atom://ghcrta';
  }

  getDefaultLocation() {
    return 'right';
  }

  getAllowedLocations() {
    return ['right', 'left', 'bottom'];
  }

}
