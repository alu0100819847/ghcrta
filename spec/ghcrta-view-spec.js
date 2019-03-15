'use babel';

import GHCRTA from '../lib/ghcrta';
import GhcrtaView from '../lib/ghcrta-view';
import GhcrtaClient from '../lib/ghcrta-client';
import GhcrtaOrgs from '../lib/ghcrta-orgs'
import GhcrtaDir from '../lib/ghcrta-modal-dir'
describe("ghcrta", function(){

  describe("Testing GhcrtaView", function() {

    it("before constructor", function() {
      expect(document.getElementById('container')).toEqual(null)
    })
    let ghcrta_view = new GhcrtaView
    it("constructor", function() {
      expect(ghcrta_view.getElement()).toExist()
    })
    it("our div id is 'container'", function() {
      expect(ghcrta_view.getElement().id).toEqual('container')
    })
  })

  describe("Testing GhcrtaClient", function() {

    atom.config.set('ghcrta.token', 'token')
    atom.config.set('ghcrta.token_name', 'token_name')
    let ghcrta_client = new GhcrtaClient

    it("Token is taken", function() {
      expect(ghcrta_client.token_).toEqual('token')
    })
    it("Token have a name", function() {
      expect(ghcrta_client.token_Name_).toEqual('token_name')
    })
  })

  describe("Testing GhcrtaDir", function() {
    it("GhcrtaDir init correctly", function() {
        let ghcrta_modal = new GhcrtaDir
        expect(ghcrta_modal.getElement()).toExist()
    })
    it("GhcrtaDir set class", function() {
        let ghcrta_modal = new GhcrtaDir
        expect(ghcrta_modal.getElement().className).toEqual('modalDir')
    })

  })
})
