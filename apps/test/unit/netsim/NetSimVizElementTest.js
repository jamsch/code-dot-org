var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');

describe('NetSimVizElement', function () {
  describe('defaults', function () {
    var vizElement;

    beforeEach(function () {
      vizElement = new NetSimVizElement();
    });

    it('has default properties', function () {
      expect(0).toBe(vizElement.posX);
      expect(0).toBe(vizElement.posY);
      expect(1).toBe(vizElement.scale);
      expect([]).toEqual(vizElement.tweens_);
      expect(vizElement.isDying()).toBe(false);
      expect(vizElement.isDead()).toBe(false);
    });

    it('immediately creates SVG root element', function () {
      var root = vizElement.getRoot();
      expect('[object SVGElement]').toBe(root[0].toString());
    });
  });
});
