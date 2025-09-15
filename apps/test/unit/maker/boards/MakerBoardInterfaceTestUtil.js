/** @file Exports a set of tests that verify the MakerBoard interface */
import {EventEmitter} from 'events'; // see node-libs-browser

/**
 * Interface that our board controllers must implement to be usable with
 * Maker Toolkit.
 * @interface MakerBoard
 * @extends EventEmitter
 */

/**
 * Run the set of interface conformance tests on the provided class.
 * @param {function} BoardClass
 * @param {function} boardSpecificSetup optional
 */
export function itImplementsTheMakerBoardInterface(
  BoardClass,
  boardSpecificSetup = null,
  boardSpecificTeardown = null
) {
  describe('implements the MakerBoard interface', () => {
    let board;

    beforeEach(() => {
      board = new BoardClass();
      // Opportunity to stub anything needed to test a board
      if (boardSpecificSetup) {
        boardSpecificSetup(board);
      }
    });

    afterEach(() => {
      if (boardSpecificTeardown) {
        boardSpecificTeardown(board);
      }
    });

    it('is an EventEmitter', () => {
      expect(board).toBeInstanceOf(EventEmitter);
    });

    /**
     * Open a connection to the board on its configured port.
     *
     * @function
     * @name MakerBoard#connect
     * @returns {Promise} resolved when the board is ready to use.
     */
    describe('connect()', () => {
      it('returns a Promise', () => {
        const retVal = board.connect();
        expect(typeof retVal.then).toBe('function');
        return retVal;
      });
    });

    /**
     * Disconnect and clean up the board controller and all components.
     *
     * @function
     * @name MakerBoard#destroy
     */
    describe('destroy()', () => {
      it(`returns a promise`, () => {
        const retVal = board.destroy();
        expect(retVal).toBeInstanceOf(Promise);
        return retVal;
      });
    });

    /**
     * Marshals the board component controllers and appropriate constants into the
     * given JS Interpreter instance so they can be used by student code.
     *
     * @function
     * @name MakerBoard#installOnInterpreter
     * @param {codegen} codegen
     * @param {JSInterpreter} jsInterpreter
     */
    describe('installOnInterpreter(codegen, jsInterpreter)', () => {
      let jsInterpreter;

      beforeEach(() => {
        jsInterpreter = {
          globalProperties: {},
          createGlobalProperty: function (key, value) {
            jsInterpreter.globalProperties[key] = value;
          },
          addCustomMarshalObject: jest.fn(),
        };

        return board.connect();
      });

      it(`doesn't return anything`, () => {
        const retVal = board.installOnInterpreter(jsInterpreter);
        expect(retVal).toBeUndefined();
      });
    });

    /**
     * @function
     * @name MakerBoard#pinMode
     * @param {number} pin
     * @param {number} modeConstant
     */
    describe(`pinMode(pin, modeConstant)`, () => {
      it(`doesn't return anything`, () => {
        return board.connect().then(() => {
          const retVal = board.pinMode(11, 1023);
          expect(retVal).toBeUndefined();
        });
      });
    });

    /**
     * @function
     * @name MakerBoard#digitalWrite
     * @param {number} pin
     * @param {number} value
     */
    describe(`digitalWrite(pin, value)`, () => {
      it(`doesn't return anything`, () => {
        return board.connect().then(() => {
          const retVal = board.digitalWrite(11, 1023);
          expect(retVal).toBeUndefined();
        });
      });
    });

    /**
     * @function
     * @name MakerBoard#digitalRead
     * @param {number} pin
     * @param {function.<number>} callback
     */
    describe(`digitalRead(pin, callback)`, () => {
      beforeEach(() => {
        return board.connect();
      });

      it(`doesn't return anything`, () => {
        const retVal = board.digitalRead(11, () => {});
        expect(retVal).toBeUndefined();
      });

      it(`calls callback with value`, done => {
        board.digitalRead(11, value => {
          expect(typeof value).toBe('number');
          done();
        });
      });
    });

    /**
     * @function
     * @name MakerBoard#analogWrite
     * @param {number} pin
     * @param {number} value
     */
    describe(`analogWrite(pin, value)`, () => {
      it(`doesn't return anything`, () => {
        return board.connect().then(() => {
          const retVal = board.analogWrite(11, () => {});
          expect(retVal).toBeUndefined();
        });
      });
    });

    /**
     * @function
     * @name MakerBoard#analogRead
     * @param {number} pin
     * @param {function.<number>} callback
     */
    describe(`analogRead(pin, callback)`, () => {
      beforeEach(() => {
        return board.connect();
      });
      it(`doesn't return anything`, () => {
        const retVal = board.analogRead(11, () => {});
        expect(retVal).toBeUndefined();
      });

      it(`calls callback with value`, done => {
        board.analogRead(11, value => {
          expect(typeof value).toBe('number');
          done();
        });
      });
    });

    /**
     * @function
     * @name MakerBoard#boardConnected
     * @return {boolean} whether a real board is connected
     */
    describe(`boardConnected()`, () => {
      it(`returns a boolean`, () => {
        expect(typeof board.boardConnected()).toBe('boolean');
      });
    });

    /**
     * @function
     * @name MakerBoard#createLed
     * @param {number} pin
     * @return {Led} a newly constructed Led component
     */
    describe(`createLed(pin)`, () => {
      beforeEach(() => {
        return board.connect();
      });

      it(`returns an Led component`, () => {
        const led = board.createLed(10);
        expect(typeof led.on).toBe('function');
        expect(typeof led.off).toBe('function');
        expect(typeof led.toggle).toBe('function');
        expect(typeof led.blink).toBe('function');
      });
    });

    /**
     * @function
     * @name MakerBoard#createButton
     * @param {number} pin
     * @return {Button} a newly constructed Button component
     */
    describe(`createButton(pin)`, () => {
      // Example code:
      // var newButton = createButton(2);
      // onBoardEvent(newButton, "down", function() {
      //   console.log("pressed");
      // });

      beforeEach(() => {
        return board.connect();
      });

      it(`returns a Button component`, () => {
        const button = board.createButton(10);
        // Check the basic button shape
        expect(button).toBeInstanceOf(EventEmitter);
        expect(button).toHaveProperty('isPressed');
      });
    });
  });
}
