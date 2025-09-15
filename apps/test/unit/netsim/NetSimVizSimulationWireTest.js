var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');
var NetSimVizSimulationNode = require('@cdo/apps/netsim/NetSimVizSimulationNode');
var NetSimVizSimulationWire = require('@cdo/apps/netsim/NetSimVizSimulationWire');
var NetSimVizWire = require('@cdo/apps/netsim/NetSimVizWire');
var NetSimWire = require('@cdo/apps/netsim/NetSimWire');

var NetSimTestUtils = require('../../util/netsimTestUtils');

var fakeShard = NetSimTestUtils.fakeShard;

describe('NetSimVizSimulationWire', function () {
  var vizWire,
    vizLocalNode,
    vizRemoteNode,
    simWire,
    localNode,
    remoteNode,
    shard;

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
   * Synchronous wire creation on shard for test
   * @param {number} localNodeID
   * @param {number} remoteNodeID
   * @returns {NetSimWire}
   */
  var makeRemoteWire = function (localNodeID, remoteNodeID) {
    var newWire;
    NetSimWire.create(
      shard,
      {
        localNodeID: localNodeID,
        remoteNodeID: remoteNodeID,
      },
      function (e, w) {
        newWire = w;
      }
    );
    expect(newWire).toBeDefined();
    return newWire;
  };

  var getVizNodeByEntityID = function (_, id) {
    if (vizLocalNode && vizLocalNode.getCorrespondingEntityId() === id) {
      return vizLocalNode;
    } else if (
      vizRemoteNode &&
      vizRemoteNode.getCorrespondingEntityId() === id
    ) {
      return vizRemoteNode;
    }
    return undefined;
  };

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    shard = fakeShard();
  });

  describe('defaults', function () {
    beforeEach(function () {
      localNode = makeRemoteClient('Antony');
      remoteNode = makeRemoteClient('Cleopatra');
      simWire = makeRemoteWire(localNode.entityID, remoteNode.entityID);
      vizLocalNode = new NetSimVizSimulationNode(localNode);
      vizRemoteNode = new NetSimVizSimulationNode(remoteNode);
      vizWire = new NetSimVizSimulationWire(simWire, getVizNodeByEntityID);
    });

    it('is a VizElement', function () {
      expect(vizWire).toBeInstanceOf(NetSimVizElement);
    });

    it('is a VizWire', function () {
      expect(vizWire).toBeInstanceOf(NetSimVizWire);
    });

    it('has default properties', function () {
      expect(0).toBe(vizWire.textPosX_);
      expect(0).toBe(vizWire.textPosY_);
      expect([]).toEqual(vizWire.encodings_);
      expect(simWire.entityID).toBe(vizWire.getCorrespondingEntityId());
      expect(vizLocalNode).toBe(vizWire.localVizNode);
      expect(vizRemoteNode).toBe(vizWire.remoteVizNode);
    });

    it('sets addresses on its endpoints', function () {
      expect(vizLocalNode.address_).toBeUndefined();
      expect(vizRemoteNode.address_).toBeUndefined();
      simWire.localAddress = 'boo';
      simWire.remoteAddress = 'hiss';
      vizWire.configureFrom(simWire);
      expect('boo').toBe(vizLocalNode.address_);
      expect('hiss').toBe(vizRemoteNode.address_);
    });

    it('is hidden in broadcast mode', function () {
      NetSimGlobals.getLevelConfig().broadcastMode = true;
      vizWire.configureFrom(simWire);
      expect('none').toBe(vizWire.getRoot().css('display'));
    });
  });
});
