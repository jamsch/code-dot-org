/** @file Tests for NetSimLogPanel */
import $ from 'jquery';

var DataConverters = require('@cdo/apps/netsim/DataConverters');
var EncodingType = require('@cdo/apps/netsim/NetSimConstants').EncodingType;
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimLogPanel = require('@cdo/apps/netsim/NetSimLogPanel');

var NetSimTestUtils = require('../../util/netsimTestUtils');

/** ascii to binary */
function to_b(ascii) {
  return DataConverters.asciiToBinary(ascii, 8);
}

describe('NetSimLogPanel', function () {
  var panel, rootDiv;

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    rootDiv = $('<div>');
  });

  it('has default maximum packet size of 50', function () {
    panel = new NetSimLogPanel(rootDiv, {});
    expect(50).toBe(panel.maximumLogPackets_);
  });

  it('is open by default', function () {
    panel = new NetSimLogPanel(rootDiv, {});
    expect(panel.isMinimized()).toBe(false);
  });

  it('can be configured to be closed on creation', function () {
    panel = new NetSimLogPanel(rootDiv, {isMinimized: true});
    expect(panel.isMinimized()).toBe(true);
  });

  it('renders body on construction', function () {
    var initialHtml = rootDiv.html();
    panel = new NetSimLogPanel(rootDiv, {isMinimized: true});
    var newHtml = rootDiv.html();
    expect(initialHtml).not.toBe(newHtml);
    expect(newHtml.length > initialHtml.length).toBeTruthy();
  });

  describe('logging', function () {
    var scrollArea;
    beforeEach(function () {
      panel = new NetSimLogPanel(rootDiv, {
        packetSpec: NetSimGlobals.getLevelConfig().clientInitialPacketHeader,
        maximumLogPackets: 10,
      });

      panel.setEncodings([EncodingType.ASCII]);
      scrollArea = rootDiv.find('.scroll-area');
    });

    it('only renders enabled encodings', function () {
      panel.log(to_b('first-message'), 1);
      panel.setEncodings([EncodingType.ASCII]);

      expect(1).toBe(scrollArea.find('.packet:first tr.ascii').length);
      expect(0).toBe(scrollArea.find('.packet:first tr.decimal').length);
      expect(0).toBe(scrollArea.find('.packet:first tr.hexadecimal').length);
      expect(0).toBe(scrollArea.find('.packet:first tr.binary').length);
      expect(0).toBe(scrollArea.find('.packet:first tr.a_and_b').length);

      panel.setEncodings([]);

      expect(0).toBe(scrollArea.find('.packet:first tr.ascii').length);
      expect(0).toBe(scrollArea.find('.packet:first tr.decimal').length);
      expect(0).toBe(scrollArea.find('.packet:first tr.hexadecimal').length);
      expect(0).toBe(scrollArea.find('.packet:first tr.binary').length);
      expect(0).toBe(scrollArea.find('.packet:first tr.a_and_b').length);

      panel.setEncodings([
        EncodingType.ASCII,
        EncodingType.DECIMAL,
        EncodingType.HEXADECIMAL,
        EncodingType.BINARY,
        EncodingType.A_AND_B,
      ]);

      expect(1).toBe(scrollArea.find('.packet:first tr.ascii').length);
      expect(1).toBe(scrollArea.find('.packet:first tr.decimal').length);
      expect(1).toBe(scrollArea.find('.packet:first tr.hexadecimal').length);
      expect(1).toBe(scrollArea.find('.packet:first tr.binary').length);
      expect(1).toBe(scrollArea.find('.packet:first tr.a_and_b').length);
    });

    it('can log a packet', function () {
      expect(0).toBe(panel.packets_.length);
      expect(0).toBe(scrollArea.children().length);
      panel.log(to_b('fake-packet-binary'), 1);
      expect(1).toBe(panel.packets_.length);
      expect(1).toBe(scrollArea.children().length);
    });

    it('puts subsequent packets at the top of the log', function () {
      panel.log(to_b('first-message'), 1);
      panel.log(to_b('second-message'), 2);
      expect(2).toBe(scrollArea.children().length);
      expect(to_b('second-message')).toBe(panel.packets_[0].packetBinary_);
      expect('second-message').toBe(
        scrollArea.find('.packet:first tr.ascii td.message').text()
      );

      panel.log(to_b('third-message'), 3);
      expect(3).toBe(scrollArea.children().length);
      expect(to_b('third-message')).toBe(panel.packets_[0].packetBinary_);
      expect('third-message').toBe(
        scrollArea.find('.packet:first tr.ascii td.message').text()
      );
    });

    it('keeps a limited number of packets', function () {
      // The limit in this test is 10 (see beforeEach for describe("logging"))
      for (var i = 1; i <= 9; i++) {
        panel.log(to_b('packet ' + i), i);
      }
      expect(9).toBe(scrollArea.children().length);
      expect('packet 9').toBe(
        scrollArea.find('.packet:first tr.ascii td.message').text()
      );
      expect('packet 1').toBe(
        scrollArea.find('.packet:last tr.ascii td.message').text()
      );

      // Packet 10 does not cause culling
      panel.log(to_b('packet 10'), 10);
      expect(10).toBe(scrollArea.children().length);
      expect('packet 10').toBe(
        scrollArea.find('.packet:first tr.ascii td.message').text()
      );
      expect('packet 1').toBe(
        scrollArea.find('.packet:last tr.ascii td.message').text()
      );

      // Packet 11 causes packet 1 to drop off the end
      panel.log(to_b('packet 11'), 11);
      expect(10).toBe(scrollArea.children().length);
      expect('packet 11').toBe(
        scrollArea.find('.packet:first tr.ascii td.message').text()
      );
      expect('packet 2').toBe(
        scrollArea.find('.packet:last tr.ascii td.message').text()
      );
    });

    it('ignores duplicate packets by id', function () {
      panel.log(to_b('first-message'), 1);
      panel.log(to_b('first-message again'), 1);

      expect(1).toBe(scrollArea.children().length);
      expect('first-message').toBe(
        scrollArea.find('.packet:first tr.ascii td.message').text()
      );
    });
  });
});
