describe('Observer', function () {
  var Observer = require('@cdo/apps/Observer');
  var ObservableEventDEPRECATED = require('@cdo/apps/ObservableEventDEPRECATED');
  var observer, eventA, eventB, log, funcX, funcY;

  beforeEach(function () {
    observer = new Observer();
    eventA = new ObservableEventDEPRECATED();
    eventB = new ObservableEventDEPRECATED();
    log = '';
    funcX = function () {
      log += 'X';
    };
    funcY = function () {
      log += 'Y';
    };
  });

  describe('Registration and call ordering', function () {
    it('calls registered functions in order of registration', function () {
      observer.observe(eventA, funcX);
      observer.observe(eventA, funcX);
      observer.observe(eventA, funcY);
      observer.observe(eventA, funcX);
      observer.observe(eventA, funcY);

      eventA.notifyObservers();

      expect(log).toBe('XXYXY');
    });

    it('does not share functions between events', function () {
      observer.observe(eventA, funcX);
      observer.observe(eventB, funcY);

      eventA.notifyObservers();

      expect(log).toBe('X');
    });

    it('can be fired multiple times', function () {
      observer.observe(eventA, funcX);
      observer.observe(eventA, funcX);
      observer.observe(eventA, funcY);

      eventA.notifyObservers();

      expect(log).toBe('XXY');

      eventA.notifyObservers();

      expect(log).toBe('XXYXXY');
    });
  });

  describe('Keys and removal', function () {
    it('can unregister from all events at once', function () {
      observer.observe(eventA, funcX);
      observer.observe(eventA, funcY);
      observer.observe(eventB, funcX);

      eventA.notifyObservers();
      expect(log).toBe('XY');

      eventB.notifyObservers();
      expect(log).toBe('XYX');

      observer.unobserveAll();
      eventA.notifyObservers();
      expect(log).toBe('XYX');

      eventB.notifyObservers();
      expect(log).toBe('XYX');
    });

    it('can safely unregister when original references to events are lost', function () {
      observer.observe(eventA, funcX);

      eventA.notifyObservers();
      expect(log).toBe('X');

      eventA = null;

      // Might be obvious, but we can do this safely because the observer
      // still has an internal reference to the event.
      observer.unobserveAll();
    });
  });

  it('respects binding `this` to the function passed into register', function () {
    var clientA = {log: ''};
    var clientB = {log: ''};
    var funcUsesThis = function () {
      this.log += 'Z';
      this.that = this;
    };

    observer.observe(eventA, funcUsesThis.bind(clientA));
    observer.observe(eventA, funcUsesThis.bind(clientB));
    eventA.notifyObservers();

    expect(clientA.log).toBe('Z');
    expect(clientA.that).toBe(clientA);
    expect(clientB.log).toBe('Z');
    expect(clientB.that).toBe(clientB);
  });

  it('passes arguments through to observers', function () {
    var funcWithArg = function (note) {
      log += note;
    };

    observer.observe(eventA, funcX);
    observer.observe(eventA, funcWithArg);

    eventA.notifyObservers('W');

    expect(log).toBe('XW');
  });
});
