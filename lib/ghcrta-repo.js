'use babel';
import React from 'react';
import ReactDom from 'react-dom';
import GhcrtaDir from './ghcrta-modal-dir';
import {autobind} from './tools';
var github = require('octonode');
var fs = require('fs')
var path = require('path')

export default class GhcrtaRepo extends React.Component{
  constructor(props, context) {
    super(props, context);
    autobind(
      this,
      'getInfo',
      'clone'
    )
    this.name = props.name
    this.org = props.org
    this.dir_clone = document.getElementById('clone_dir').value;
    this.simpleGit = null
  }

  getInfo(client){
    var ghrepo = client.repo(this.org+'/'+this.name);
    let repositories = new Promise((resolve, reject) =>{
      ghrepo.info((err, data, header)=>{

        resolve(data)
      });
    })
    repositories.then((response)=>{

      simpleGit.clone(response.ssh_url, )
    })

  }

  clone(){
    let url_git = 'git@github.com:'+this.org+'/'+this.name+'.git'

    fs.stat(this.dir_clone, (err) =>{
      console.log(err)
      if(err){
        console.log(this.dir_clone)
        fs.mkdir(this.dir_clone, (mkerr) => {
          if (!mkerr){
            this.simpleGit = require('simple-git')(this.dir_clone);
            this.simpleGit.clone(url_git, (a, b, c) => {
              console.log(a, b, c)
            })
          };
          console.log(mkerr)
        });


      } else {
        this.simpleGit = require('simple-git')(this.dir_clone);
        fs.stat(path.join(this.dir_clone, this.name), (err_, data) =>{
          console.log(path.join(this.dir_clone, this.name))
          if(!err_){
            console.log(path.join(this.dir_clone, this.name))
            let dir_clone = path.join(this.dir_clone, this.name)
            this.simpleGit.cwd(dir_clone)
            this.simpleGit.pull((pull_err)=>{
              if(pull_err){
                GhcrtaDir.error_pull(pull_err, this.name)
                ReactDom.render(GhcrtaDir.error.length,document.getElementById('countErr'))

              }
            })
          } else {
            this.simpleGit.clone(url_git, (clone_err, data) => {
              console.log(clone_err)
              console.log(data)
            })
          }
        })
      }
    });

  }

}
