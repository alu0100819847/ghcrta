'use babel';
import React from 'react';
import ReactDom from 'react-dom';
import {autobind, deleteInput, divideList} from './tools';
var github = require('octonode');
import GhcrtaOrgs from './ghcrta-orgs'

export default class GhcrtaClient extends React.Component{
  constructor(props, context) {
    super(props, context);
    autobind(
      this, 'hasTokenName', 'logedIn', 'getBackgroundOrgs',  'getOrgRepos',
      'getOrgs', 'paginatedOrgs', 'delete_input', 'searchOrgs', 'renderLogIn',
      'getLogin', 'existingToken', 'deleteLoginInput'
    )
    this.token = atom.config.get('ghcrta.token')
    this.user = ''
    this.token_name = atom.config.get('ghcrta.token_name')
    this.hasTokenName()
    this.client = null
    this.orgs = []
    this.searchedOrgs = []
    this.actualOrgs = []
    this.paginating = 20
  }

  hasTokenName(){
    if(this.token_name == ''){
      var time = new Date()
      var user = atom.getLoadSettings().env.USER
      this.token_name = 'ghcrta-'+user+'-'+Date.UTC(time.getFullYear(), time.getDate(), time.getDay(), time.getHours(), time.getMinutes(), time.getSeconds())
    }
  }

  renderLogIn(container_, err){
    ReactDom.render(<div key="login"></div>, container_)
    ReactDom.render(
      <div key="login">
        <label> Name: <input id="name" type="text"></input></label>
        <label> Password: <input id="password" type="password"></input></label>
        <div> <button onClick={() => {this.getLogin(container_)}}>GO</button> </div>
        <div> {err} </div>
      </div>, container_
    )
    this.deleteLoginInput()

  }

  getLogin(container_){
      let name = document.getElementById("name").value;
      let password = document.getElementById("password").value;

      if(name != '' && password != ''){
        var scopes = {
          'scopes': ['user', 'repo', 'gist'],
          'note': this.token_name
        };
        let credentials = new Promise((resolve, reject) =>{
          github.auth.config({
              username: name,
              password: password
            }).login(scopes, function (err, id, token, headers) {
              if(!err){
                resolve({'token':token, 'id':id, 'status': parseInt(headers.status)})
              } else {
                resolve({'err': err, 'status': parseInt(headers.status)})
              }
            });
        })
        credentials.then((response) => {
          if(response.token){
            this.token = response.token
            atom.config.set('ghcrta.token', response.token)
            atom.config.set('ghcrta.token_name', this.token_name)
            this.client = github.client(response.token);
            this.logedIn(container_)
          } else {
            if(response.status == 422){
              this.renderLogIn(container_, this.existingToken())
            }
            if(response.status == 401){
              this.renderLogIn(container_, 'Usuario o contraseña incorrecto.')
            }
          }
        })
      }
    }

    logedIn(container_){
      if(this.client){
        var ghme = this.client.me();
        var orgs = [];
        let orgs_promise = new Promise((resolve, reject) =>{
          ghme.orgs(1, 100, function(err, orgs_in, header){
            if(!err){
              resolve({'status': parseInt(header.status), 'data': orgs_in})
            }
            else {
              resolve({'status': err.statusCode})
            }
          })
        })
        orgs_promise.then((response) => {
          let style = {'buttons': {position: 'absolute', top: 95+'%',padding: 3+'px', maxHeight: 5+'%', width: 100+'%', border: '1px solid', backgroundColor: '#d8d8d8', color: 'black', textAlign: 'center'}}
          ReactDom.render(
            <div>
              <div id='search'></div>
              <div style={style.orgs} id='orgs'> </div>
              <div style={style.buttons} id='buttons'></div>
            </div> , container_
          )
          if(response.data){
            if(response.data.length != 0){
              this.getBackgroundOrgs(ghme, 2)
              let searcher = document.getElementById('search');

              ReactDom.render(<div> </div>, searcher)
              ReactDom.render(
                  <div style={{margin: 5 + 'px'}}>
                    Search: <input onChange={() => { this.searchOrgs()}} type='text' id='searcher'/>
                  </div>
                , searcher
              )
              let input = document.getElementById('searcher')
              input.addEventListener("keydown", (evento)=>{this.delete_input(evento)})

              this.actualOrgs = this.orgs = divideList(response.data, this.paginating)
              this.paginatedOrgs(0)

            }
            else {
              ReactDom.render(<div><h1>No se han encontrado organizaciones. </h1></div>, container_)
            }
          }
          if(response.status == 401)  {
            atom.config.set('ghcrta.token', '')
            this.token = ''
            this.client = null
            this.logedIn(container_)
          }
        })
      } else {
        this.renderLogIn(container_, '')
      }
    }

    getBackgroundOrgs(ghme, counter){
      let org_promise = new Promise((resolve, reject) =>{
        ghme.orgs(counter, 100, function(err, orgs_in, header){
          if(!err){
            resolve({'status': parseInt(header.status), 'data': orgs_in})
          }
          else {
            resolve({'status': err.statusCode})
          }
        })
      })
      org_promise.then((response)=>{
        if(response.data){
          if(response.data.length > 0){
            this.orgs = divideList(response.data, this.paginating, this.orgs)
            counter++;
            this.getBackgroundOrgs(ghme, counter)
          }
        } else {
          console.log('Repositories '+ response.message)
        }
      })
    }

  searchOrgs(){
    let searcher = document.getElementById('searcher');
    if(searcher.value != ''){
      let reg = new RegExp(searcher.value.toLowerCase());
      let list = []
      for(var i = 0; i < this.orgs.length; i++){
        for(var j = 0; j < this.orgs[i].length; j++){
          if(reg.exec(this.orgs[i][j].login.toLowerCase())){
            list.push(this.orgs[i][j])
          }
        }
      }
      this.searchedOrgs = this.actualOrgs = divideList(list, this.paginating)
      this.paginatedOrgs(0)
    } else {
      this.actualRepos = this.repos
      this.paginatedOrgs(0)
    }
  }
// *************
  paginatedOrgs(pag){
    let container_ = document.getElementById('orgs');
    let root = document.getElementById('container');
    let style = {'orgs': {overflow: 'scroll', height: root.offsetHeight*0.87 + 'px' }}
    var list = []
    if(this.actualOrgs[pag]){
      for(var i = 0; i < this.actualOrgs[pag].length; i++){
        list.push(<li key={'org-'+i} id={'org-'+i}></li>)
      }
      while(list.length < this.paginating){
        list.push(<li key={'org-'+list.length} id={'org-'+list.length} hidden></li>)
      }
      let prev = <a key='prev' onClick={this.getOrgs(pag-1)}>&#8678;</a>
      let next = <a key='next' onClick={this.getOrgs(pag+1)}>&#8680;</a>

      if(pag == 0){
        prev = null
      }
      if(this.actualOrgs.length <= (pag+1)){
        next = null
      }
      elem = (
        <div style = {style.orgs}>
          <ul>
            {list}
          </ul>
        </div>
      )
      ReactDom.render(
        <div>

        </div>
        ,
        container_
      )
      ReactDom.render(
        elem
        ,
        container_
      )
      for(var i = 0; i < this.actualOrgs[pag].length; i++){
        var org = this.actualOrgs[pag][i].login
        var container_org = document.getElementById('org-'+i);
        ReactDom.render(
          <a key={org} onClick={this.getOrgRepos(org, 1, container_)}>{org}</a>
          ,
          container_org
        )
      }
      let but_container = document.getElementById('buttons');
      ReactDom.render(
        <div key='pag'>{prev}{pag+1}-{parseInt(this.actualOrgs.length)}{next}</div>
        ,
        but_container
      )

    } else{
      ReactDom.render(
        <div>
          <p> Not Orgs Found </p>
        </div>
        ,
        container_
      )
    }
  }



  getOrgRepos(org, pag, container_){

    return () =>{
      let search_ = document.getElementById('search')
      let root = document.getElementById('container');
      let style = {'back' : {padding: 1 + 'em', border: '1px solid'}, 'repos': {overflow: 'scroll', height: root.offsetHeight*0.80 + 'px' }}
      ReactDom.render(
        <div>
          <header style={style.back} id='back'><button style={{marginRight: 1 + 'em'}} onClick={() => {this.logedIn(container_)}}>Back</button>{org}</header>
          <div id='search'></div>
          <div id='repos' style={style.repos} class="repos"> </div>
        </div>,
        container_
      )
      ReactDom.render(
        <div>

        </div>,
        search_
      )


      var orgClass = new GhcrtaOrgs({'orgName':org})

        orgClass.getRepos(this.client)

    }
  }

  existingToken(){
    return (
            <div id='extoken' key='exToken'>
              <p>Ya tienes generado un token para esta aplicación. Eliminalo aqui: </p>
              <a href="https://github.com/settings/tokens">{this.token_name}</a>
            </div>
          );
  }


  //-------------------Tools-----------------------//
  getOrgs(pag){
    return () => {
      this.paginatedOrgs(pag)
    }
  }

  deleteLoginInput(){
    let input_name = document.getElementById('name')
    input_name.addEventListener("keydown", (evento)=>{deleteInput(evento, input_name)})
    let input_password = document.getElementById('password')
    input_password.addEventListener("keydown", (evento)=>{deleteInput(evento, input_password)})
  }


  delete_input(evento){
    let input = document.getElementById('searcher')
    deleteInput(evento, input)
    if(event.keyCode == 8){
      this.searchOrgs()
    }
  }

  get token_Name_(){
    return this.token_name
  }

  get token_(){
    return this.token
  }

  set err_(err){
    this.err = err
  }

  set client_(client){
    this.client = client
  }
}
