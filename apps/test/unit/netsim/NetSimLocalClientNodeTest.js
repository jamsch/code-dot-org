var NetSimClientNode = require('@cdo/apps/netsim/NetSimClientNode');
var NetSimEntity = require('@cdo/apps/netsim/NetSimEntity');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimLogger = require('@cdo/apps/netsim/NetSimLogger');
var NetSimMessage = require('@cdo/apps/netsim/NetSimMessage');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');

var NetSimTestUtils = require('../../util/netsimTestUtils');

var assertTableSize = NetSimTestUtils.assertTableSize;
var fakeShard = NetSimTestUtils.fakeShard;

describe('NetSimLocalClientNode', function () {
  var testShard, testLocalNode, testRemoteNode;

  /**
   * Synchronous router creation on shard for test
   * @returns {NetSimRouterNode}
   */
  var makeRemoteRouter = function () {
    var newRouter;
    NetSimRouterNode.create(testShard, function (e, r) {
      newRouter = r;
    });
    expect(newRouter).toBeDefined();
    return newRouter;
  };

  beforeEach(function () {
    NetSimLogger.getSingleton().setVerbosity(NetSimLogger.LogLevel.NONE);
    NetSimTestUtils.initializeGlobalsToDefaultValues();

    testShard = fakeShard();

    NetSimLocalClientNode.create(
      testShard,
      'testLocalNode',
      function (err, node) {
        testLocalNode = node;
      }
    );
    expect(testLocalNode).toBeDefined();

    NetSimEntity.create(NetSimClientNode, testShard, function (err, node) {
      testRemoteNode = node;
    });
    expect(testRemoteNode).toBeDefined();
  });

  describe('onNodeTableChange_', function () {
    var lostConnection;
    beforeEach(function () {
      testLocalNode.initializeSimulation(null, null);

      // Set up testing for lost connection callback
      lostConnection = false;
      testLocalNode.setLostConnectionCallback(function () {
        lostConnection = true;
      });
      expect(lostConnection).toBe(false);
    });

    it('detects when own row has gone away and calls lost connection callback', function () {
      testShard.nodeTable.api_.remoteTable.deleteMany(
        [testLocalNode.entityID],
        function () {}
      );
      testShard.nodeTable.refresh();
      expect(lostConnection).toBe(true);
    });

    it('detects shard reset even when own ID has been reclaimed', function () {
      // Reset fake remote table and repopulate first two rows.
      testShard.nodeTable = NetSimTestUtils.overrideNetSimTableApi(
        testShard.nodeTable
      );
      NetSimEntity.create(NetSimClientNode, testShard, function () {});
      NetSimEntity.create(NetSimClientNode, testShard, function () {});

      testShard.nodeTable.refresh();
      expect(lostConnection).toBe(true);
    });
  });

  describe('onWireTableChange_', function () {
    it('detects when remote client disconnects, and removes local wire', function () {
      var localWireRow, remoteWireRow;

      testLocalNode.connectToNode(testRemoteNode, function () {});
      testRemoteNode.connectToNode(testLocalNode, function () {});

      localWireRow = testLocalNode.getOutgoingWire().buildRow();
      localWireRow.id = 1;
      remoteWireRow = testRemoteNode.getOutgoingWire().buildRow();
      remoteWireRow.id = 2;

      expect(localWireRow.localNodeID).toBe(remoteWireRow.remoteNodeID);
      expect(localWireRow.remoteNodeID).toBe(remoteWireRow.localNodeID);

      // Trigger onWireTableChange_ with both wires; the connection
      // should be complete!
      testLocalNode.shard_.wireTable.fullCacheUpdate_([
        localWireRow,
        remoteWireRow,
      ]);
      testLocalNode.onWireTableChange_();
      expect(testLocalNode.myRemoteClient).toEqual(testRemoteNode);

      // Trigger onWireTableChange_ without the remoteWire; the
      // connection should be broken
      testLocalNode.shard_.wireTable.fullCacheUpdate_([localWireRow]);
      testLocalNode.onWireTableChange_();
      expect(testLocalNode.getOutgoingWire()).toBeNull();
      expect(testLocalNode.myRemoteClient).toBeNull();
    });

    it('detects when attempted connection is rejected', function () {
      var testThirdNode;
      var localWireRow, remoteWireRow, thirdWireRow;

      NetSimEntity.create(NetSimClientNode, testShard, function (err, node) {
        testThirdNode = node;
      });
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testRemoteNode.connectToNode(testThirdNode, function () {});

      localWireRow = testLocalNode.getOutgoingWire().buildRow();
      localWireRow.id = 1;
      remoteWireRow = testRemoteNode.getOutgoingWire().buildRow();
      remoteWireRow.id = 2;

      testLocalNode.shard_.wireTable.fullCacheUpdate_([
        localWireRow,
        remoteWireRow,
      ]);
      testLocalNode.onWireTableChange_();
      var newLocalWireRow = testLocalNode.getOutgoingWire().buildRow();
      newLocalWireRow.id = 1;
      expect(newLocalWireRow).toEqual(localWireRow);
      expect(testLocalNode.myRemoteClient).toBeNull();

      testThirdNode.connectToNode(testRemoteNode, function () {});

      thirdWireRow = testThirdNode.getOutgoingWire().buildRow();
      thirdWireRow.id = 3;
      testLocalNode.shard_.wireTable.fullCacheUpdate_([
        localWireRow,
        remoteWireRow,
        thirdWireRow,
      ]);
      testLocalNode.onWireTableChange_();
      expect(testLocalNode.getOutgoingWire()).toBeNull();
    });
  });

  describe('sendMessage', function () {
    it('fails with error when not connected', function () {
      var error;
      testLocalNode.sendMessage('101010010101', function (e) {
        error = e;
      });
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Cannot send message; not connected.');
      assertTableSize(testShard, 'messageTable', 0);
    });

    it('puts the message in the messages table', function () {
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessage('10101010101', function () {});
      assertTableSize(testShard, 'messageTable', 1);
    });

    it('callback has undefined result, even on success', function () {
      // Init to non-success values to make sure they get set.
      var err = true;
      var result = true;
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessage('10100110101', function (e, r) {
        err = e;
        result = r;
      });
      expect(err).toBeNull();
      expect(result).toBeUndefined();
    });

    it('Generated message has correct from/to node IDs', function () {
      var fromNodeID, toNodeID;
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessage('101001100101', function () {});
      testShard.messageTable.refresh(function (err, rows) {
        fromNodeID = rows[0].fromNodeID;
        toNodeID = rows[0].toNodeID;
      });
      expect(fromNodeID).toBe(testLocalNode.entityID);
      expect(toNodeID).toBe(testRemoteNode.entityID);
    });

    it('Generated message has correct payload', function () {
      var message;
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessage('1010101010100101010', function () {});
      testShard.messageTable.refresh(function (err, rows) {
        message = new NetSimMessage(testShard, rows[0]);
      });
      expect('1010101010100101010').toBe(message.payload);
    });
  });

  describe('sendMessages', function () {
    var payloads = [
      '10100111',
      '0100110010',
      '0001100110',
      '00111000',
      '1000010100',
      '1110100110',
    ];

    it('fails with error when not connected', function () {
      var error;
      testLocalNode.sendMessages(payloads, function (e) {
        error = e;
      });
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Cannot send message; not connected.');
      assertTableSize(testShard, 'messageTable', 0);
    });

    it('succeeds immediately with empty payload', function () {
      var error, result;
      testLocalNode.sendMessages([], function (e, r) {
        error = e;
        result = r;
      });
      expect(error).toBeNull();
      expect(result).toBeUndefined();
    });

    it('puts all of the payloads into the message table', function () {
      testLocalNode.connectToNode(testRemoteNode, function () {});
      testLocalNode.sendMessages(payloads, function () {});
      assertTableSize(testShard, 'messageTable', payloads.length);
    });
  });

  describe('getShortDisplayName', function () {
    it('reflects no change for names below 10 characters', function () {
      testLocalNode.displayName_ = 'Sam';
      expect('Sam').toBe(testLocalNode.getShortDisplayName());

      testLocalNode.displayName_ = 'Sam Well';
      expect('Sam Well').toBe(testLocalNode.getShortDisplayName());

      // Note: spaces preserved for short names
      testLocalNode.displayName_ = 'Samuel 999';
      expect('Samuel 999').toBe(testLocalNode.getShortDisplayName());
    });

    it('uses first word for names longer than 10 characters', function () {
      // Even short first names used, as long as whole name is > 10
      testLocalNode.displayName_ = 'A Modest Proposal';
      expect('A').toBe(testLocalNode.getShortDisplayName());

      // Ordinary case
      testLocalNode.displayName_ = 'Jonathan Swift';
      expect('Jonathan').toBe(testLocalNode.getShortDisplayName());

      // First name longer than 10 characters
      testLocalNode.displayName_ = 'Constantine Rey';
      expect('Constantine').toBe(testLocalNode.getShortDisplayName());
    });
  });

  describe('getHostname', function () {
    it('is a transformation of the short display name and node ID', function () {
      expect(1).toBe(testLocalNode.entityID);
      testLocalNode.displayName_ = 'Sam';
      expect('sam1').toBe(testLocalNode.getHostname());
    });

    it('strips spaces, preserves digits', function () {
      expect(1).toBe(testLocalNode.entityID);
      testLocalNode.displayName_ = 'Sam Well';
      expect('samwell1').toBe(testLocalNode.getHostname());

      // Note: spaces preserved for short names
      testLocalNode.displayName_ = 'Samuel 999';
      expect('samuel9991').toBe(testLocalNode.getHostname());
    });

    it('abbreviates with short-name rules', function () {
      expect(1).toBe(testLocalNode.entityID);
      // Even short first names used, as long as whole name is > 10
      testLocalNode.displayName_ = 'A Modest Proposal';
      expect('a1').toBe(testLocalNode.getHostname());

      // Ordinary case
      testLocalNode.displayName_ = 'Jonathan Swift';
      expect('jonathan1').toBe(testLocalNode.getHostname());

      // First name longer than 10 characters
      testLocalNode.displayName_ = 'Constantine Rey';
      expect('constantine1').toBe(testLocalNode.getHostname());
    });
  });

  describe('makeWireRowForConnectingTo', function () {
    var wireRow;

    describe('a router', function () {
      var routerNode;

      beforeEach(function () {
        NetSimGlobals.setRandomSeed('fizzbusters');
        routerNode = makeRemoteRouter();
        wireRow = testLocalNode.makeWireRowForConnectingTo(routerNode);
      });

      it('Sets localNodeID to own entity ID', function () {
        expect(testLocalNode.entityID).toBe(wireRow.localNodeID);
      });

      it('Sets remoteNodeID to router entity ID', function () {
        expect(routerNode.entityID).toBe(wireRow.remoteNodeID);
      });

      it('Gets a random local address from the router', function () {
        // Pinned by 'setRandomSeed', above.
        expect('9').toBe(wireRow.localAddress);
      });

      it("Sets remoteAddress to router's address", function () {
        expect(routerNode.getAddress()).toBe(wireRow.remoteAddress);
      });

      it('Sets localHostname to own hostname', function () {
        expect(testLocalNode.getHostname()).toBe(wireRow.localHostname);
      });

      it("Sets remoteHostname to router's hostname", function () {
        expect(routerNode.getHostname()).toBe(wireRow.remoteHostname);
      });
    });

    describe('a client', function () {
      beforeEach(function () {
        wireRow = testLocalNode.makeWireRowForConnectingTo(testRemoteNode);
      });

      it('Sets localNodeID to own entity ID', function () {
        expect(testLocalNode.entityID).toBe(wireRow.localNodeID);
      });

      it('Sets remoteNodeID to remote entity ID', function () {
        expect(testRemoteNode.entityID).toBe(wireRow.remoteNodeID);
      });

      it('Leaves remaining fields undefined', function () {
        expect(wireRow.localAddress).toBeUndefined();
        expect(wireRow.remoteAddress).toBeUndefined();
        expect(wireRow.localHostname).toBeUndefined();
        expect(wireRow.remoteHostname).toBeUndefined();
      });
    });
  });

  // TODO: A test that covers connecting to a router and then disconnecting
  //       and ensures we end up in a consistent state.
});
