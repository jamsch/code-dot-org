/**
 * @file Exports a set of tests that verify  that the micro:bit board
 * components and component constructors are available from the interpreter
 */
import {
  MB_COMPONENT_COUNT,
  MB_COMPONENTS,
} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';

import {boardSetupAndStub} from './MicroBitTestHelperFunctions';
export function itMakesMicroBitComponentsAvailable(
  Board,
  boardSpecificSetup = null,
  boardSpecificTeardown = null
) {
  /**
   * After installing on the interpreter, test that the components and
   * component constructors are available from the interpreter
   */
  describe('Micro Bit components accessible from interpreter', () => {
    let jsInterpreter;
    let board;

    beforeEach(() => {
      board = new Board();
      boardSetupAndStub(board);

      jsInterpreter = {
        globalProperties: {},
        createGlobalProperty: function (key, value) {
          jsInterpreter.globalProperties[key] = value;
        },
        addCustomMarshalObject: jest.fn(),
      };
      // Opportunity to stub anything needed to test a board
      if (boardSpecificSetup) {
        boardSpecificSetup(board);
      }

      return board.connect();
    });

    afterEach(() => {
      if (boardSpecificTeardown) {
        boardSpecificTeardown(board);
      }
    });

    describe('adds component constructors', () => {
      beforeEach(() => {
        board.installOnInterpreter(jsInterpreter);
      });

      it(`correct number of them`, () => {
        expect(jsInterpreter.addCustomMarshalObject.mock.calls).toHaveLength(
          MB_COMPONENTS.length
        );
      });

      MB_COMPONENTS.forEach(constructor => {
        it(constructor, () => {
          expect(jsInterpreter.globalProperties).toHaveProperty(constructor);
          expect(typeof jsInterpreter.globalProperties[constructor]).toBe(
            'function'
          );
          const passedObjects =
            jsInterpreter.addCustomMarshalObject.mock.calls.map(
              call => call[0].instance
            );
          expect(passedObjects).toContain(
            jsInterpreter.globalProperties[constructor]
          );
        });
      });
    });

    describe('adds components', () => {
      beforeEach(() => {
        board.installOnInterpreter(jsInterpreter);
      });

      it(`correct number of them`, () => {
        let globalPropsCount = MB_COMPONENTS.length + MB_COMPONENT_COUNT;
        expect(Object.keys(jsInterpreter.globalProperties)).toHaveLength(
          globalPropsCount
        );
      });

      ['buttonA', 'buttonB'].forEach(button => {
        describe(button, () => {
          let component;

          beforeEach(() => {
            component = jsInterpreter.globalProperties[button];
          });

          it('isPressed', () => {
            expect(typeof component.isPressed).toBe('boolean');
          });
          it('holdtime', () => {
            expect(typeof component.holdtime).toBe('number');
          });
        });
      });

      describe('ledScreen', () => {
        function expectLedToHaveFunction(fnName) {
          expect(typeof jsInterpreter.globalProperties.ledScreen[fnName]).toBe(
            'function'
          );
        }

        // Set of required functions derived from our dropletConfig
        [
          'on',
          'off',
          'toggle',
          'clear',
          'scrollString',
          'scrollNumber',
        ].forEach(fnName => {
          it(`${fnName}()`, () => expectLedToHaveFunction(fnName));
        });
      });

      describe('tempSensor', () => {
        let component;

        beforeEach(() => {
          component = jsInterpreter.globalProperties.tempSensor;
        });

        it('F', () => {
          expect(component).toHaveProperty('F');
        });

        it('C', () => {
          expect(component).toHaveProperty('C');
        });
      });

      describe('lightSensor', () => {
        let component;

        beforeEach(() => {
          component = jsInterpreter.globalProperties.lightSensor;
        });

        it('value', () => {
          expect(component).toHaveProperty('value');
        });

        it('threshold', () => {
          expect(component).toHaveProperty('threshold');
        });

        it('start()', () => {
          expect(typeof component.start).toBe('function');
        });

        it('setScale()', () => {
          expect(typeof component.setScale).toBe('function');
        });
      });

      describe('accelerometer', () => {
        let component;

        beforeEach(() => {
          component = jsInterpreter.globalProperties.accelerometer;
        });

        it('start()', () => {
          expect(typeof component.start).toBe('function');
        });
        it('getOrientation()', () => {
          expect(typeof component.getOrientation).toBe('function');
        });
        it('getAcceleration()', () => {
          expect(typeof component.getAcceleration).toBe('function');
        });
      });

      describe('compass', () => {
        let component;

        beforeEach(() => {
          component = jsInterpreter.globalProperties.compass;
        });

        it('start()', () => {
          expect(typeof component.start).toBe('function');
        });
        it('getHeading()', () => {
          expect(typeof component.getHeading).toBe('function');
        });
      });

      describe('board', () => {
        it('exists', () => {
          expect(jsInterpreter.globalProperties).toHaveProperty('board');
        });
      });
    });
  });
}
