import $ from 'jquery';

var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');
var NetSimVizNode = require('@cdo/apps/netsim/NetSimVizNode');

describe('NetSimVizNode', function () {
  describe('defaults', function () {
    var vizNode;

    beforeEach(function () {
      vizNode = new NetSimVizNode();
    });

    it('is a VizElement', function () {
      expect(vizNode).toBeInstanceOf(NetSimVizElement);
    });

    it('has default properties', function () {
      expect(vizNode.address_).toBeUndefined();
      expect(vizNode.dnsMode_).toBeUndefined();
      expect(vizNode.isRouter).toBe(false);
      expect(vizNode.isLocalNode).toBe(false);
      expect(vizNode.isDnsNode).toBe(false);
    });

    it('immediately creates SVG elements', function () {
      var root = vizNode.getRoot();
      expect('[object SVGElement]').toBe(root[0].toString());

      var rootChildren = root.children();
      expect(3).toBe(rootChildren.length);

      var circle = rootChildren[0];
      expect('[object SVGElement]').toBe(circle.toString());

      var nameGroup = rootChildren[1];
      expect('[object SVGElement]').toBe(nameGroup.toString());
      var nameChildren = $(nameGroup).children();
      expect(2).toBe(nameChildren.length);

      var addressGroup = rootChildren[2];
      expect('[object SVGElement]').toBe(addressGroup.toString());
      var addressChildren = $(addressGroup).children();
      expect(2).toBe(addressChildren.length);
    });
  });
});
