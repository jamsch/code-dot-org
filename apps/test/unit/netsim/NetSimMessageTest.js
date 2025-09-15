import {assertOwnProperty} from '../../util/assertions';

var NetSimEntity = require('@cdo/apps/netsim/NetSimEntity');
var NetSimMessage = require('@cdo/apps/netsim/NetSimMessage');

var NetSimTestUtils = require('../../util/netsimTestUtils');

var assertTableSize = NetSimTestUtils.assertTableSize;
var fakeShard = NetSimTestUtils.fakeShard;

describe('NetSimMessage', function () {
  var testShard, messageTable;

  beforeEach(function () {
    testShard = fakeShard();
    messageTable = testShard.messageTable;
  });

  it('uses the message table', function () {
    var message = new NetSimMessage(testShard);
    expect(message.getTable()).toBe(testShard.messageTable);
  });

  it('implements MessageData', function () {
    var message = new NetSimMessage(testShard);

    assertOwnProperty(message, 'fromNodeID');
    expect(message.fromNodeID).toBeUndefined();

    assertOwnProperty(message, 'toNodeID');
    expect(message.toNodeID).toBeUndefined();

    assertOwnProperty(message, 'simulatedBy');
    expect(message.simulatedBy).toBeUndefined();

    assertOwnProperty(message, 'payload');
    expect(message.payload).toBe('');

    assertOwnProperty(message, 'extraHopsRemaining');
    expect(message.extraHopsRemaining).toBe(0);

    assertOwnProperty(message, 'visitedNodeIDs');
    expect(message.visitedNodeIDs).toEqual([]);
  });

  describe('isValid static check', function () {
    it('is minimally valid with a payload', function () {
      expect(NetSimMessage.isValid({})).toBe(false);
      expect(NetSimMessage.isValid({payload: ''})).toBe(true);
    });

    it('passes given a default-constructed NetSimMessage', function () {
      expect(NetSimMessage.isValid(new NetSimMessage())).toBe(true);
    });
  });

  it('converts MessageRow.base64Payload to local binary payload', function () {
    var message = new NetSimMessage(testShard, {
      fromNodeID: 1,
      toNodeID: 2,
      simulatedBy: 2,
      base64Payload: {
        string: 'kg==',
        len: 7,
      },
      extraHopsRemaining: 3,
      visitedNodeIDs: [4],
    });
    expect(message.payload).toBe('1001001');
  });

  it('gracefully converts a malformed base64Payload to empty string', function () {
    var message = new NetSimMessage(testShard, {
      base64Payload: {
        string: 'not a base64 string because of the question mark?',
        len: 7,
      },
    });
    expect(message.payload).toBe('');
  });

  describe('static method send', function () {
    it('adds an entry to the message table', function () {
      messageTable.refresh(function (err, rows) {
        expect(rows.length).toBe(0);
      });

      NetSimMessage.send(testShard, {payload: ''}, function () {});

      messageTable.refresh(function (err, rows) {
        expect(rows.length).toBe(1);
      });
    });

    it('Puts row values in remote table', function () {
      var fromNodeID = 1;
      var toNodeID = 2;
      var simulatedBy = 2;
      var base64Payload = {
        string: 'kg==',
        len: 7,
      };
      var extraHopsRemaining = 3;
      var visitedNodeIDs = [4];

      NetSimMessage.send(
        testShard,
        {
          fromNodeID: fromNodeID,
          toNodeID: toNodeID,
          simulatedBy: simulatedBy,
          payload: '1001001',
          extraHopsRemaining: extraHopsRemaining,
          visitedNodeIDs: visitedNodeIDs,
        },
        function () {}
      );

      messageTable.refresh(function (err, rows) {
        var row = rows[0];
        expect(row.fromNodeID).toBe(fromNodeID);
        expect(row.toNodeID).toBe(toNodeID);
        expect(row.simulatedBy).toBe(simulatedBy);
        expect(row.base64Payload).toEqual(base64Payload);
        expect(row.extraHopsRemaining).toBe(extraHopsRemaining);
        expect(row.visitedNodeIDs).toEqual(visitedNodeIDs);
      });
    });

    it('Returns no error to its callback when successful', function () {
      NetSimMessage.send(testShard, {payload: ''}, function (err) {
        expect(err).toBeNull();
      });
    });

    it('Returns error to its callback when given a non-binary String as a payload', function () {
      var returnedError;
      NetSimMessage.send(
        testShard,
        {
          fromNodeID: 1,
          toNodeID: 2,
          simulatedBy: 2,
          payload: 'some non-binary payload',
          extraHopsRemaining: 3,
          visitedNodeIDs: [4],
        },
        function (err) {
          returnedError = err;
        }
      );
      expect(returnedError).toBeInstanceOf(TypeError);
    });
  });

  it('can be instatiated from remote row', function () {
    var testRow;

    // Create a message row in remote table
    // The source payload that generates this Base64Payload is "1001001"
    messageTable.create(
      {
        fromNodeID: 1,
        toNodeID: 2,
        simulatedBy: 2,
        base64Payload: {
          string: 'kgA=',
          len: 7,
        },
        extraHopsRemaining: 3,
        visitedNodeIDs: [4],
      },
      function (err, row) {
        testRow = row;
      }
    );
    expect(testRow).toBeDefined();

    // Instantiate message
    var message = new NetSimMessage(testShard, testRow);
    expect(message.fromNodeID).toBe(1);
    expect(message.toNodeID).toBe(2);
    expect(message.simulatedBy).toBe(2);
    expect(message.payload).toBe('1001001');
    expect(message.extraHopsRemaining).toBe(3);
    expect(message.visitedNodeIDs).toEqual([4]);
  });

  it('can be removed from the remote table with destroy()', function () {
    var testRow;

    // Create a message row in remote table
    messageTable.create({}, function (err, row) {
      testRow = row;
    });
    expect(testRow).toBeDefined();

    // Call destroy()
    var message = new NetSimMessage(testShard, testRow);
    message.destroy();

    // Verify that message is gone from the remote table.
    var rowCount = Infinity;
    messageTable.refresh(function (err, rows) {
      rowCount = rows.length;
    });
    expect(rowCount).toBe(0);
  });

  describe('destroyEntities on messages', function () {
    it('deletes all messages passed to it', function () {
      NetSimMessage.send(
        testShard,
        {
          fromNodeID: 1,
          toNodeID: 2,
          simulatedBy: 2,
          payload: '001',
        },
        function () {}
      );
      NetSimMessage.send(
        testShard,
        {
          fromNodeID: 1,
          toNodeID: 2,
          simulatedBy: 2,
          payload: '010',
        },
        function () {}
      );
      NetSimMessage.send(
        testShard,
        {
          fromNodeID: 1,
          toNodeID: 2,
          simulatedBy: 2,
          payload: '100',
        },
        function () {}
      );
      assertTableSize(testShard, 'messageTable', 3);

      var messages;
      messageTable.refresh(function (err, rows) {
        messages = rows.map(function (row) {
          return new NetSimMessage(testShard, row);
        });
      });
      expect(3).toBe(messages.length);
      expect(messages[0]).toBeInstanceOf(NetSimMessage);

      NetSimEntity.destroyEntities(messages, function () {});
      assertTableSize(testShard, 'messageTable', 0);
    });
  });

  describe('MessageRow', function () {
    it('has expected row structure and default values', function () {
      var message = new NetSimMessage(testShard);
      var row = message.buildRow();

      assertOwnProperty(row, 'fromNodeID');
      expect(row.fromNodeID).toBeUndefined();

      assertOwnProperty(row, 'toNodeID');
      expect(row.toNodeID).toBeUndefined();

      assertOwnProperty(row, 'simulatedBy');
      expect(row.simulatedBy).toBeUndefined();

      assertOwnProperty(row, 'base64Payload');
      expect(row.base64Payload).toEqual({
        string: '',
        len: 0,
      });

      assertOwnProperty(row, 'extraHopsRemaining');
      expect(row.extraHopsRemaining).toBe(0);

      assertOwnProperty(row, 'visitedNodeIDs');
      expect(row.visitedNodeIDs).toEqual([]);
    });

    it('converts local binary payload to base64 before creating row', function () {
      var base64Payload = {
        string: 'kg==',
        len: 7,
      };
      var message = new NetSimMessage(testShard, {
        fromNodeID: 1,
        toNodeID: 2,
        simulatedBy: 2,
        base64Payload: base64Payload,
        extraHopsRemaining: 3,
        visitedNodeIDs: [4],
      });
      var row = message.buildRow();
      expect(row.base64Payload.string).toBe(base64Payload.string);
      expect(row.base64Payload.len).toBe(base64Payload.len);
    });
  });
});
