var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');
var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');
var NetSimVizNode = require('@cdo/apps/netsim/NetSimVizNode');
var NetSimVizSimulationNode = require('@cdo/apps/netsim/NetSimVizSimulationNode');

var NetSimTestUtils = require('../../util/netsimTestUtils');

var fakeShard = NetSimTestUtils.fakeShard;

describe('NetSimVizSimulationNode', function () {
  var vizElement, simEntity, shard;

  /**
   * Synchronous client creation on shard for test
   * @param {string} displayName
   * @returns {NetSimLocalClientNode}
   */
  var makeRemoteClient = function (displayName) {
    var newClient;
    NetSimLocalClientNode.create(shard, displayName, function (e, n) {
      newClient = n;
    });
    expect(newClient).toBeDefined();
    return newClient;
  };

  /**
   * Synchronous router creation on shard for test
   * @returns {NetSimRouterNode}
   */
  var makeRemoteRouter = function () {
    var newRouter;
    NetSimRouterNode.create(shard, function (e, r) {
      newRouter = r;
    });
    expect(newRouter).toBeDefined();
    return newRouter;
  };

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    shard = fakeShard();
  });

  describe('defaults', function () {
    beforeEach(function () {
      simEntity = new NetSimLocalClientNode();
      vizElement = new NetSimVizSimulationNode(simEntity);
    });

    it('is a VizElement', function () {
      expect(vizElement).toBeInstanceOf(NetSimVizElement);
    });

    it('is a VizNode', function () {
      expect(vizElement).toBeInstanceOf(NetSimVizNode);
    });

    it('has default properties', function () {
      expect(vizElement.correspondingNodeID_).toBeUndefined();
      expect(vizElement.autoDnsAddress).toBeUndefined();
    });
  });

  describe('initializing from a client node', function () {
    beforeEach(function () {
      simEntity = makeRemoteClient('Jonathan A Deough');
      vizElement = new NetSimVizSimulationNode(simEntity);
    });

    it("captures the client's node ID", function () {
      expect(simEntity.entityID).toBe(vizElement.getCorrespondingEntityId());
    });

    it("shows the client's display name (by default)", function () {
      expect('Jonathan').toBe(vizElement.displayName_.text());
    });

    it("shows the client's hostname when level expects it", function () {
      NetSimGlobals.getLevelConfig().showHostnameInGraph = true;
      vizElement = new NetSimVizSimulationNode(simEntity);
      expect('jonathan1').toBe(vizElement.displayName_.text());
    });

    it("knows it's not a router", function () {
      expect(vizElement.isRouter).toBe(false);
    });

    it('does not cache an auto-dns address', function () {
      expect(undefined).toBe(vizElement.autoDnsAddress);
    });

    it("does not assume it's the local node (must be told explicitly)", function () {
      expect(vizElement.isLocalNode).toBe(false);
    });

    it("does not assume it's the DNS node (must be told explicitly)", function () {
      expect(vizElement.isDnsNode).toBe(false);
    });
  });

  describe('initializing from a router node', function () {
    beforeEach(function () {
      simEntity = makeRemoteRouter();
      vizElement = new NetSimVizSimulationNode(simEntity);
    });

    it("captures the router's node ID", function () {
      expect(simEntity.entityID).toBe(vizElement.getCorrespondingEntityId());
    });

    it("shows the router's display name (by default)", function () {
      expect('Router 1').toBe(vizElement.displayName_.text());
    });

    it("shows the router's hostname when level expects it", function () {
      NetSimGlobals.getLevelConfig().showHostnameInGraph = true;
      vizElement = new NetSimVizSimulationNode(simEntity);
      expect('router1').toBe(vizElement.displayName_.text());
    });

    it("knows it's a router", function () {
      expect(vizElement.isRouter).toBe(true);
    });

    it('caches an auto-dns address', function () {
      expect('15').toBe(vizElement.autoDnsAddress);
    });

    it('is not the local node or dns node)', function () {
      expect(vizElement.isLocalNode).toBe(false);
      expect(vizElement.isDnsNode).toBe(false);
    });

    it("adds the 'router-node' class to its root element", function () {
      expect(vizElement.getRoot().is('.router-node')).toBe(true);
    });

    it('is visible by default', function () {
      expect('').toBe(vizElement.getRoot().css('display'));
    });

    it('is hidden in broadcast mode', function () {
      NetSimGlobals.getLevelConfig().broadcastMode = true;
      vizElement = new NetSimVizSimulationNode(simEntity);
      expect('none').toBe(vizElement.getRoot().css('display'));
    });
  });
});
