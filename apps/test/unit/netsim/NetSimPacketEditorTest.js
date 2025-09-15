/** @file Tests for NetSimPacketEditor */

var DataConverters = require('@cdo/apps/netsim/DataConverters');
var EncodingType = require('@cdo/apps/netsim/NetSimConstants').EncodingType;
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimPacketEditor = require('@cdo/apps/netsim/NetSimPacketEditor');

var NetSimTestUtils = require('../../util/netsimTestUtils');

describe('NetSimPacketEditor', function () {
  var editor, rootDiv;

  var alignDecimal = DataConverters.alignDecimal;
  var binaryToAB = DataConverters.binaryToAB;
  var binaryToDecimal = DataConverters.binaryToDecimal;
  var binaryToHex = DataConverters.binaryToHex;
  var formatAB = DataConverters.formatAB;
  var formatBinary = DataConverters.formatBinary;
  var formatHex = DataConverters.formatHex;

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    editor = new NetSimPacketEditor({
      packetSpec: NetSimGlobals.getLevelConfig().clientInitialPacketHeader,
      contentChangeCallback: function () {},
    });
    rootDiv = editor.getRoot();
  });

  it('only renders enabled encodings', function () {
    var message = 'test message';
    var binaryMessage = DataConverters.asciiToBinary(message, 8);
    editor.message = binaryMessage;

    editor.setEncodings([EncodingType.ASCII]);

    expect(1).toBe(rootDiv.find('tr.ascii').length);
    expect(0).toBe(rootDiv.find('tr.decimal').length);
    expect(0).toBe(rootDiv.find('tr.hexadecimal').length);
    expect(0).toBe(rootDiv.find('tr.binary').length);
    expect(0).toBe(rootDiv.find('tr.a_and_b').length);

    editor.setEncodings([]);

    expect(0).toBe(rootDiv.find('tr.ascii').length);
    expect(0).toBe(rootDiv.find('tr.decimal').length);
    expect(0).toBe(rootDiv.find('tr.hexadecimal').length);
    expect(0).toBe(rootDiv.find('tr.binary').length);
    expect(0).toBe(rootDiv.find('tr.a_and_b').length);

    editor.setEncodings([
      EncodingType.ASCII,
      EncodingType.DECIMAL,
      EncodingType.HEXADECIMAL,
      EncodingType.BINARY,
      EncodingType.A_AND_B,
    ]);

    expect(1).toBe(rootDiv.find('tr.ascii').length);
    expect(1).toBe(rootDiv.find('tr.decimal').length);
    expect(1).toBe(rootDiv.find('tr.hexadecimal').length);
    expect(1).toBe(rootDiv.find('tr.binary').length);
    expect(1).toBe(rootDiv.find('tr.a_and_b').length);

    expect(message).toBe(rootDiv.find('tr.ascii textarea.message').val());
    expect(formatBinary(binaryMessage, 8)).toBe(
      rootDiv.find('tr.binary textarea.message').val()
    );
    expect(alignDecimal(binaryToDecimal(binaryMessage, 8))).toBe(
      rootDiv.find('tr.decimal textarea.message').val()
    );
    expect(formatHex(binaryToHex(binaryMessage), 8)).toBe(
      rootDiv.find('tr.hexadecimal textarea.message').val()
    );
    expect(formatAB(binaryToAB(binaryMessage), 8)).toBe(
      rootDiv.find('tr.a_and_b textarea.message').val()
    );
  });
});
