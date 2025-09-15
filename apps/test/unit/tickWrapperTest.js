var tickWrapper = require('./../integration/util/tickWrapper');

function createFakeApp() {
  return {
    tickCount: 0,
    onTick: function () {
      this.tickCount++;
    },
  };
}

describe('tickWrapper', function () {
  afterEach(function () {
    tickWrapper.reset();
  });

  it('runOnAppTick', function () {
    var app1 = createFakeApp();

    var calledMe = false;
    tickWrapper.runOnAppTick(app1, 2, function () {
      calledMe = true;
    });

    app1.onTick();
    expect(calledMe).toBe(false);
    expect(app1.tickCount).toBe(1);

    app1.onTick();
    expect(calledMe).toBe(false);
    expect(app1.tickCount).toBe(2);

    app1.onTick();
    expect(calledMe).toBe(true);
    expect(app1.tickCount).toBe(3);
  });

  it('tickAppUntil', function (done) {
    var app1 = createFakeApp();

    tickWrapper
      .tickAppUntil(app1, function () {
        return app1.tickCount === 3;
      })
      .then(function () {
        // tickCount is 4 because our predicate function runs at the beginning of
        // the loop, and our original onTick is still called before we get to
        // promise resolution
        expect(app1.tickCount).toBe(4);
        done();
      });

    app1.onTick();
    app1.onTick();
    app1.onTick();
    app1.onTick();
  });

  it('never calls action if reset before tick count', function () {
    var app1 = createFakeApp();
    app1.onTick;

    var calledMe = false;
    tickWrapper.runOnAppTick(app1, 3, function () {
      calledMe = true;
    });

    app1.onTick();
    app1.onTick();
    expect(calledMe).toBe(false);
    expect(app1.tickCount).toBe(2);
    tickWrapper.reset();
    app1.onTick();
    app1.onTick();
    expect(app1.tickCount).toBe(4);
    expect(calledMe).toBe(false);
  });

  it('can have multiple preTick functions, and reset successfully', function () {
    var app1 = createFakeApp();
    var originalOnTick = app1.onTick;

    var predicate1Calls = 0;
    var predicate2Calls = 0;

    tickWrapper.tickAppUntil(app1, function () {
      predicate1Calls++;
      return false;
    });
    tickWrapper.tickAppUntil(app1, function () {
      predicate2Calls++;
      return false;
    });

    app1.onTick();
    app1.onTick();
    expect(predicate1Calls).toBe(2);
    expect(predicate2Calls).toBe(2);
    expect(app1.tickCount).toBe(2);
    tickWrapper.reset();
    app1.onTick();
    expect(app1.tickCount).toBe(3);
    expect(predicate1Calls).toBe(2);
    expect(predicate2Calls).toBe(2);
    expect(app1.onTick).toBe(originalOnTick);
  });
});
