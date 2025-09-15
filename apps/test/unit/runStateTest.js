import JSInterpreter from '@cdo/apps/lib/tools/jsinterpreter/JSInterpreter';

var runState = require('@cdo/apps/redux/runState');

var testUtils = require('./../util/testUtils');

describe('runState', () => {
  testUtils.setExternalGlobals();

  describe('stepSpeed', function () {
    var reducer = runState.default;

    it('is initially 1', function () {
      var state = reducer(null, {});
      expect(state.stepSpeed).toBe(1);
    });

    it('remains 1 when set to null', function () {
      var state = reducer(null, runState.setStepSpeed(null));
      expect(state.stepSpeed).toBe(1);
    });

    it('remains 1 when set to undefined', function () {
      var state = reducer(null, runState.setStepSpeed(undefined));
      expect(state.stepSpeed).toBe(1);
    });

    it('can be set to 0.0', function () {
      var state = reducer(null, runState.setStepSpeed(0.0));
      expect(state.stepSpeed).toBe(0);
    });

    it('can be set to a decimal', function () {
      var state = reducer(null, runState.setStepSpeed(0.5));
      expect(state.stepSpeed).toBe(0.5);
    });
  });

  describe('isRunning reducer', function () {
    var reducer = runState.default;

    it('starts out false', function () {
      var state = reducer(null, {});
      expect(state.isRunning).toBe(false);
    });

    it('can be set to true when false', function () {
      var previousState = {
        isRunning: false,
      };
      var state = reducer(previousState, runState.setIsRunning(true));
      expect(state.isRunning).toBe(true);
    });

    it('can be set to false when true', function () {
      var previousState = {
        isRunning: true,
      };
      var state = reducer(previousState, runState.setIsRunning(false));
      expect(state.isRunning).toBe(false);
    });

    it('can be set to true when already true', function () {
      var previousState = {
        isRunning: true,
      };
      var state = reducer(previousState, runState.setIsRunning(true));
      expect(state.isRunning).toBe(true);
    });

    it('sets isDebuggerPaused to false when running is set to false', function () {
      var previousState = {
        isRunning: false,
        isDebuggerPaused: true,
      };
      var state = reducer(previousState, runState.setIsRunning(false));
      expect(state.isRunning).toBe(false);
      expect(state.isDebuggerPaused).toBe(false);
    });

    it('doesnt change isDebuggerPaused when set to true', function () {
      var previousState = {
        isRunning: true,
        isDebuggerPaused: true,
      };
      var state = reducer(previousState, runState.setIsRunning(true));
      expect(state.isRunning).toBe(true);
      expect(state.isDebuggerPaused).toBe(true);
    });

    it('sets isDebuggingSprites to false when running is set to false', function () {
      var previousState = {
        isRunning: true,
        isDebuggingSprites: true,
      };
      var state = reducer(previousState, runState.setIsRunning(false));
      expect(state.isRunning).toBe(false);
      expect(state.isDebuggingSprites).toBe(false);
    });

    it('doesnt change isDebuggingSprites when set to true', function () {
      var previousState = {
        isRunning: true,
        isDebuggingSprites: true,
      };
      var state = reducer(previousState, runState.setIsRunning(true));
      expect(state.isRunning).toBe(true);
      expect(state.isDebuggingSprites).toBe(true);
    });
  });

  describe('isDebuggerPaused reducer', function () {
    var reducer = runState.default;

    it('starts out false', function () {
      var state = reducer(null, {});
      expect(state.isDebuggerPaused).toBe(false);
    });

    it('can be set to true when false', function () {
      var previousState = {
        isDebuggerPaused: false,
      };
      var state = reducer(
        previousState,
        runState.setIsDebuggerPaused(true, JSInterpreter.StepType.IN)
      );
      expect(state.isDebuggerPaused).toBe(true);
      expect(state.nextStep).toBe(JSInterpreter.StepType.IN);
    });

    it('can be set to false when true', function () {
      var previousState = {
        isDebuggerPaused: true,
      };
      var state = reducer(
        previousState,
        runState.setIsDebuggerPaused(false, JSInterpreter.StepType.RUN)
      );
      expect(state.isDebuggerPaused).toBe(false);
      expect(state.nextStep).toBe(JSInterpreter.StepType.RUN);
    });

    it('can be set to true when already true', function () {
      var previousState = {
        isDebuggerPaused: true,
      };
      var state = reducer(
        previousState,
        runState.setIsDebuggerPaused(true, JSInterpreter.StepType.OVER)
      );
      expect(state.isDebuggerPaused).toBe(true);
      expect(state.nextStep).toBe(JSInterpreter.StepType.OVER);
    });

    it('sets isRunning to true when debugging', function () {
      var previousState = {
        isRunning: true,
        isDebuggerPaused: false,
        nextStep: undefined,
      };
      var state = reducer(previousState, runState.setIsDebuggerPaused(true));
      expect(state).toEqual({
        isRunning: true,
        isDebuggerPaused: true,
        nextStep: undefined,
      });
    });

    it('doesnt change isRunning when set to false', function () {
      var previousState = {
        isRunning: true,
        isDebuggerPaused: false,
        nextStep: undefined,
      };
      var state = reducer(previousState, runState.setIsDebuggerPaused(false));
      expect(state).toEqual({
        isRunning: true,
        isDebuggerPaused: false,
        nextStep: undefined,
      });
    });
  });

  describe('isDebuggingSprites reducer', function () {
    var reducer = runState.default;

    it('starts out false', function () {
      var state = reducer(null, {});
      expect(state.isDebuggingSprites).toBe(false);
    });

    it('can be set to true when false', function () {
      var previousState = {
        isRunning: true,
        isDebuggingSprites: false,
      };
      var state = reducer(previousState, runState.setIsDebuggingSprites(true));
      expect(state.isDebuggingSprites).toBe(true);
    });

    it('can be set to false when true', function () {
      var previousState = {
        isRunning: true,
        isDebuggingSprites: true,
      };
      var state = reducer(previousState, runState.setIsDebuggingSprites(false));
      expect(state.isDebuggingSprites).toBe(false);
    });

    it('doesnt change to true when isRunning is set to false', function () {
      var previousState = {
        isRunning: false,
        isDebuggingSprites: false,
      };
      var state = reducer(previousState, runState.setIsDebuggingSprites(true));
      expect(state.isDebuggingSprites).toBe(false);
    });
  });
});
