import NetSimTestUtils from '../../util/netsimTestUtils';

var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');
var NetSimVizNode = require('@cdo/apps/netsim/NetSimVizNode');
var NetSimVizWire = require('@cdo/apps/netsim/NetSimVizWire');

describe('NetSimVizWire', function () {
  var vizWire, localVizNode, remoteVizNode;

  describe('defaults', function () {
    beforeEach(function () {
      NetSimTestUtils.initializeGlobalsToDefaultValues();

      localVizNode = new NetSimVizNode();
      remoteVizNode = new NetSimVizNode();
      vizWire = new NetSimVizWire(localVizNode, remoteVizNode);
    });

    it('is a VizElement', function () {
      expect(vizWire).toBeInstanceOf(NetSimVizElement);
    });

    it('has default properties', function () {
      expect(0).toBe(vizWire.textPosX_);
      expect(0).toBe(vizWire.textPosY_);
      expect([]).toEqual(vizWire.encodings_);
      expect(localVizNode).toBe(vizWire.localVizNode);
      expect(remoteVizNode).toBe(vizWire.remoteVizNode);
    });

    it('immediately creates SVG elements', function () {
      var root = vizWire.getRoot();
      expect('[object SVGElement]').toBe(root[0].toString());

      var rootChildren = root.children();
      expect(3).toBe(rootChildren.length);

      var line = rootChildren[0];
      expect('[object SVGElement]').toBe(line.toString());

      var questionMark = rootChildren[1];
      expect('[object SVGElement]').toBe(questionMark.toString());

      var textBit = rootChildren[2];
      expect('[object SVGElement]').toBe(textBit.toString());
    });
  });
});
