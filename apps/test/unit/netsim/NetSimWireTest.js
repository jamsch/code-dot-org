import {assertOwnProperty} from '../../util/assertions';

var NetSimWire = require('@cdo/apps/netsim/NetSimWire');

var NetSimTestUtils = require('../../util/netsimTestUtils');

var assertTableSize = NetSimTestUtils.assertTableSize;
var fakeShard = NetSimTestUtils.fakeShard;

describe('NetSimWire', function () {
  var testShard, wireTable;

  beforeEach(function () {
    testShard = fakeShard();
    wireTable = testShard.wireTable;
  });

  it('uses the wire table', function () {
    var wire = new NetSimWire(testShard);
    expect(wire.getTable()).toEqual(testShard.wireTable);
  });

  it('has expected row structure and default values', function () {
    var wire = new NetSimWire(testShard);
    var row = wire.buildRow();

    assertOwnProperty(row, 'localNodeID');
    expect(row.localNodeID).toBeUndefined();

    assertOwnProperty(row, 'remoteNodeID');
    expect(row.remoteNodeID).toBeUndefined();

    assertOwnProperty(row, 'localAddress');
    expect(row.localAddress).toBeUndefined();

    assertOwnProperty(row, 'remoteAddress');
    expect(row.remoteAddress).toBeUndefined();

    assertOwnProperty(row, 'localHostname');
    expect(row.localHostname).toBeUndefined();

    assertOwnProperty(row, 'remoteHostname');
    expect(row.remoteHostname).toBeUndefined();
  });

  describe('static method create', function () {
    it('adds an entry to the wire table', function () {
      assertTableSize(testShard, 'wireTable', 0);

      NetSimWire.create(
        testShard,
        {
          localNodeID: 0,
          remoteNodeID: 0,
        },
        function () {}
      );

      assertTableSize(testShard, 'wireTable', 1);
    });

    it('immediately initializes entry with endpoints', function () {
      NetSimWire.create(
        testShard,
        {
          localNodeID: 1,
          remoteNodeID: 2,
        },
        function () {}
      );

      wireTable.refresh(function (err, rows) {
        expect(rows[0].localNodeID).toBe(1);
        expect(rows[0].remoteNodeID).toBe(2);
      });
    });

    it('Returns a NetSimWire to its callback', function () {
      NetSimWire.create(
        testShard,
        {
          localNodeID: 0,
          remoteNodeID: 0,
        },
        function (err, result) {
          expect(result).toBeInstanceOf(NetSimWire);
        }
      );
    });
  });

  it('can be instatiated from remote row', function () {
    var testRow;

    // Create a wire row in remote table
    wireTable.create(
      {
        localNodeID: 1,
        remoteNodeID: 2,
        localAddress: 3,
        remoteAddress: 4,
        localHostname: 'me',
        remoteHostname: 'you',
      },
      function (err, row) {
        testRow = row;
      }
    );
    expect(testRow).toBeDefined();

    // Instantiate wire
    var wire = new NetSimWire(testShard, testRow);
    expect(wire.localNodeID).toBe(1);
    expect(wire.remoteNodeID).toBe(2);
    expect(wire.localAddress).toBe(3);
    expect(wire.remoteAddress).toBe(4);
    expect(wire.localHostname).toBe('me');
    expect(wire.remoteHostname).toBe('you');
  });

  it('can be removed from the remote table with destroy()', function () {
    var testRow;

    // Create a wire row in remote table
    wireTable.create({}, function (err, row) {
      testRow = row;
    });
    expect(testRow).toBeDefined();

    // Call destroy()
    var wire = new NetSimWire(testShard, testRow);
    wire.destroy();

    // Verify that wire is gone from the remote table.
    assertTableSize(testShard, 'wireTable', 0);
  });
});
