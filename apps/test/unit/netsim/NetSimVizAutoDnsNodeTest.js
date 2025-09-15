var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimVizAutoDnsNode = require('@cdo/apps/netsim/NetSimVizAutoDnsNode');
var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');
var NetSimVizNode = require('@cdo/apps/netsim/NetSimVizNode');

var NetSimTestUtils = require('../../util/netsimTestUtils');

describe('NetSimVizAutoDnsNode', function () {
  var vizElement;

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
  });

  describe('defaults', function () {
    beforeEach(function () {
      vizElement = new NetSimVizAutoDnsNode();
    });

    it('is a VizElement', function () {
      expect(vizElement).toBeInstanceOf(NetSimVizElement);
    });

    it('is a VizNode', function () {
      expect(vizElement).toBeInstanceOf(NetSimVizNode);
    });

    it('uses a DNS display name (by default)', function () {
      expect('DNS').toBe(vizElement.displayName_.text());
    });

    it('uses a dns hostname when level expects it', function () {
      NetSimGlobals.getLevelConfig().showHostnameInGraph = true;
      vizElement = new NetSimVizAutoDnsNode();
      expect('dns').toBe(vizElement.displayName_.text());
    });

    it("knows it's not a router", function () {
      expect(vizElement.isRouter).toBe(false);
    });

    it("knows it's not a local node", function () {
      expect(vizElement.isLocalNode).toBe(false);
    });

    it('knows it is a DNS node', function () {
      expect(vizElement.isDnsNode).toBe(true);
    });

    it("adds the 'auto-dns-node' class to its root element", function () {
      expect(vizElement.getRoot().is('.auto-dns-node')).toBe(true);
    });
  });
});
