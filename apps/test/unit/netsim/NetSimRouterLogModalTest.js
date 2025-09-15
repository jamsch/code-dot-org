/** @file Tests for NetSimRouterLogModal */
import $ from 'jquery';

var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimRouterLogModal = require('@cdo/apps/netsim/NetSimRouterLogModal');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');

var NetSimTestUtils = require('../../util/netsimTestUtils');

var fakeShard = NetSimTestUtils.fakeShard;

describe('NetSimRouterLogModal', function () {
  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
  });

  describe(`Log Mode`, function () {
    var modal, rootDiv, testShard, router, levelConfig;

    beforeEach(function () {
      levelConfig = NetSimGlobals.getLevelConfig();
      testShard = fakeShard();
      rootDiv = $('<div>');

      router = new NetSimRouterNode(testShard, {});
      modal = new NetSimRouterLogModal(rootDiv, {user: {}});
    });

    it('defaults to showing all router logs when not connected to a router', function () {
      expect(modal.isAllRouterLogMode_).toBe(true);
    });

    it('defaults to showing one router log when connected to an isolated router', function () {
      levelConfig.connectedRouters = false;
      modal.setRouter(router);
      expect(modal.isAllRouterLogMode_).toBe(false);
    });

    it('defaults to showing one router log when connected to a connected router', function () {
      levelConfig.connectedRouters = true;
      modal.setRouter(router);
      expect(modal.isAllRouterLogMode_).toBe(false);
    });

    it('detects a local router', function () {
      expect(modal.hasLocalRouter_()).toBe(false);
      modal.setRouter(router);
      expect(modal.hasLocalRouter_()).toBe(true);
    });

    it('detects if it can log all routers', function () {
      expect(modal.canLogAllRouters_()).toBe(true);
      modal.setRouter(router);
      levelConfig.connectedRouters = true;
      expect(modal.canLogAllRouters_()).toBe(true);
      levelConfig.connectedRouters = false;
      expect(modal.canLogAllRouters_()).toBe(false);
    });

    it('detects if it can switch between modes', function () {
      expect(modal.canSetRouterLogMode_()).toBe(false);
      modal.setRouter(router);
      levelConfig.connectedRouters = true;
      expect(modal.canSetRouterLogMode_()).toBe(true);
      levelConfig.connectedRouters = false;
      expect(modal.canSetRouterLogMode_()).toBe(false);
    });
  });

  describe(`Traffic filtering modes`, function () {
    var modal, rootDiv, testShard, localNode, router;

    beforeEach(function () {
      testShard = fakeShard();
      rootDiv = $('<div>');
      modal = new NetSimRouterLogModal(rootDiv, {user: {}});

      NetSimRouterNode.create(testShard, function (e, r) {
        router = r;
      });
      expect(router).toBeDefined();

      NetSimLocalClientNode.create(
        testShard,
        'testLocalNode',
        function (err, node) {
          localNode = node;
        }
      );
      expect(localNode).toBeDefined();
    });

    it('defaults to showing all traffic in every case', function () {
      expect('none').toBe(modal.currentTrafficFilter_);

      modal.onShardChange(testShard, localNode);
      expect('none').toBe(modal.currentTrafficFilter_);

      localNode.connectToRouter(router);
      expect('none').toBe(modal.currentTrafficFilter_);
    });

    it('can set traffic filter modes', function () {
      modal.onShardChange(testShard, localNode);
      localNode.connectToRouter(router);
      var address = localNode.getAddress();
      expect('none').toBe(modal.currentTrafficFilter_);

      modal.setTrafficFilterMode_('with ' + address);
      expect('with ' + address).toBe(modal.currentTrafficFilter_);
    });

    it("disconnecting from a router coerces filter mode back to 'none'", function () {
      modal.onShardChange(testShard, localNode);
      localNode.connectToRouter(router);
      var address = localNode.getAddress();
      modal.setTrafficFilterMode_('with ' + address);
      expect('with ' + address).toBe(modal.currentTrafficFilter_);

      localNode.disconnectRemote();
      modal.setRouter(null); // Normally netsim.js does this
      expect('none').toBe(modal.currentTrafficFilter_);
    });

    it('can render the dropdown with no local address', function () {
      expect(() => {
        modal.onShow_();
      }).not.toThrow();
    });

    it('can render the dropdown with a local address', function () {
      modal.onShardChange(testShard, localNode);
      localNode.connectToRouter(router);
      expect(() => {
        modal.onShow_();
      }).not.toThrow();
    });
  });
});
