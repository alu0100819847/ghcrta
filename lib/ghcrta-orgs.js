'use babel';
import React from 'react';
import ReactDom from 'react-dom';
import GhcrtaDir from './ghcrta-modal-dir';
import {autobind, deleteInput, divideList} from './tools';
var github = require('octonode');

import GhcrtaRepo from './ghcrta-repo'

export default class GhcrtaOrgs extends React.Component{
  constructor(props, context, orgs) {
    super(props, context);
    autobind(
      this,
      'paginatedRepos', 'getRepos', 'getOrgRepos',
      'getBackgroundRepos', 'searchRepo', 'cloneRepo',
      'cloneAll', 'delete_input'
    )
    this.name = props.orgName
    this.client = null
    this.repos = []
    this.searchedRepos = []
    this.actualRepos = []
    this.paginating = 20

    let dir_input = document.getElementById('clone_dir');
    dir_input.value = path.join(require('os').homedir(), 'Desktop')
    console.log(this.dir)
    if(atom.project.getDirectories()[0]){
      dir_input.value = atom.project.getDirectories()[0].lowerCasePath
    }
    dir_input.addEventListener("keydown", (evento)=>{deleteInput(evento, dir_input)})


  }

  getRepos(client){
    let ghorg = client.org(this.name)
    this.client = client
    repositories = new Promise((resolve, reject) =>{
      ghorg.repos(1, 100, function(err, repos, header){
        if(!err){
          resolve({'data': repos})
        } else {
          resolve({'status': err.statusCode, 'message': err.message})
        }
      });
    })
    repositories.then((response)=>{
      if(response.data){
        let searcher = document.getElementById('search');
        ReactDom.render(
            <div style={{margin: 5 + 'px'}}>
              Search: <input onChange={() => { this.searchRepo()}} type='text' id='searcher'/>
              <a style={{margin: 5+'px', border: 1+'px solid', backgroundColor: 'red'}} onClick={() => {atom.commands.dispatch(container, 'ghcrta:dir')}}>DIR</a>
              <div style={{display: 'inline', color: 'red'}} id='countErr'>{GhcrtaDir.error.length}</div>
            </div>
          ,
          searcher
        )
        let input = document.getElementById('searcher')
        input.addEventListener("keydown", this.delete_input)

        this.actualRepos = this.repos = divideList(response.data, this.paginating)
        this.paginatedRepos(0)
        this.getBackgroundRepos(client.org(this.name), 2)

      } else {
        console.log('Repositories '+ response.message)
        let container_ = document.getElementById('orgs')
        ReactDom.render(<div><h1>Se ha producido un error</h1></div>, container_)
      }
    })
  }

  getBackgroundRepos(ghorg, counter){
    let repositories = new Promise((resolve, reject) =>{
      ghorg.repos(counter, 100, function(err, repos, header){
        if(!err){
          resolve({'data': repos})
        } else {
          resolve({'status': err.statusCode, 'message': err.message})
        }
      });
    })
    repositories.then((response)=>{
      if(response.data){
        if(response.data.length> 0){
          this.repos = divideList(response.data, this.paginating, this.repos)
          counter++;
          this.getBackgroundRepos(ghorg, counter)
        }

      } else {
        console.log('Repositories '+ response.message)
      }
    })
  }

  paginatedRepos(pag){
    let container_ = document.getElementById('repos');
    list = []
    if(this.actualRepos[pag]){
      for(var i = 0; i < this.actualRepos[pag].length; i++){
        list.push(<li key={'rep-'+i} id={'rep-'+i}></li>)
      }
      while(list.length < this.paginating){
        list.push(<li key={'rep-'+list.length} id={'rep-'+list.length} hidden></li>)
      }
    }

    let prev = <a style={{color: 'black'}} key='prev' onClick={this.getOrgRepos(pag-1)}>&#8678;</a>
    let next = <a style={{color: 'black'}} key='next' onClick={this.getOrgRepos(pag+1)}>&#8680;</a>

    if(pag == 0){
      prev = null
    }
    if(this.actualRepos.length <= (pag+1)){
      next = null
    }
    let elem = (<div><ul>{list}</ul></div>)

    ReactDom.render(<div> </div>, container_)
    ReactDom.render(elem , container_ )

    if(this.actualRepos[pag]){
      for(var i = 0; i < this.actualRepos[pag].length; i++){
        var repo = this.actualRepos[pag][i].name
        var container_repo = document.getElementById('rep-'+i);
        ReactDom.render(
          <a key = {repo} onClick={this.cloneRepo(repo)}>{repo}</a>
          , container_repo
        )
      }
      let but_container = document.getElementById('buttons');
      ReactDom.render(
        <div style={{height: 100+'%'}}>{prev}{pag+1}-{parseInt(this.actualRepos.length)}{next} <button style={{float: 'right', marginRight: 1+'em'}} onClick={() => { this.cloneAll()}}>Clone All</button></div>
        , but_container
      )
    }
    else {
      ReactDom.render(<p> Not Repos Found </p>, container_)
    }
  }
  //-----------------SEARCHING--------------------//

  searchRepo(){
    let searcher = document.getElementById('searcher');
    if(searcher.value != ''){
      let reg = new RegExp(searcher.value.toLowerCase());

      let list = []
      for(var i = 0; i < this.repos.length; i++){
        for(var j = 0; j < this.repos[i].length; j++){
          if(reg.exec(this.repos[i][j].name.toLowerCase())){
            list.push(this.repos[i][j])
          }
        }
      }
      this.searchedRepos = this.actualRepos = divideList(list, this.paginating)
      this.paginatedRepos(0)
    } else {
      this.actualRepos = this.repos
      this.paginatedRepos(0)
    }

  }

  //-------------------Tools-----------------------//

  getOrgRepos(pag){
    return () =>{ this.paginatedRepos(pag) }
  }



  cloneRepo(repo){
    return () =>{
      var reposInfo = new GhcrtaRepo({'name': repo, 'org': this.name})
      reposInfo.clone()
    }
  }

  cloneAll(){
    for(var i = 0; i < this.actualRepos.length; i++){
      for(var j = 0; j < this.actualRepos[i].length; j++){
        let repo = new GhcrtaRepo({'name': this.actualRepos[i][j].name, 'org': this.name})
        repo.clone()
      }
    }
  }

  delete_input(evento){
    let input = document.getElementById('searcher')
    deleteInput(evento, input)
    if(event.keyCode == 8){
      this.searchRepo()
    }
  }

}
//-----------------------------------------------//
