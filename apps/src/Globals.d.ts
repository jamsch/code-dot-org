// Global TypeScript definitions
// These are types that do not rely on any external imports. If you
// need to import to declare a type, add to GlobalsModule.d.ts instead.

// Type definition for SCSS modules imported in TypeScript files
declare module '*.module.scss' {
  const classes: {[key: string]: string};
  export default classes;
}

/** These are initialized on the `window.dashboard` object at `sites/studio/pages/code-studio.js` */
type StudioDashboard = {
  /** assets.js module */
  assets: Record<string, unknown>;
  /** clientState.js module */
  clientState: Record<string, unknown>;
  /** createCallouts.js module (default export) */
  createCallouts: (callouts: unknown) => void;
  /** codeStudioLevels.js module (specific imports) */
  codeStudioLevels: Record<string, unknown>;
  /** hashEmail.js module (default export) */
  hashEmail: (options: unknown) => void;
  /** header.js module */
  header: Record<string, unknown>;
  /** pairing.js module */
  pairing: Record<string, unknown>;
  /** popup-window.js module */
  popupWindow: JQuery.TypeEventHandler<
    unknown,
    null,
    unknown,
    unknown,
    'click'
  >;
  /** project.js module */
  project: Record<string, unknown>;
  /** reporting.js module */
  reporting: Record<string, unknown>;
  /** videos.js module */
  videos: Record<string, unknown>;
};

declare interface Window {
  /** LegacyDialog.js module (default export) */
  Dialog?: (options: unknown) => void;
  /** freeResponse.js module (default export) */
  FreeResponse?: unknown;
  /** multi.js module */
  Multi?: unknown;
  /** textMatch.js module (default export) */
  TextMatch?: unknown;
  /** Sounds instance from Sounds.js */
  CDOSounds?: unknown;

  dashboard: Partial<
    StudioDashboard & {
      rack_env: 'production' | 'test' | 'levelbuilder' | 'unit_test' | string;
      /** CODE_ORG_URL constant */
      CODE_ORG_URL: string;
    } & Record<string, unknown>
  >;
}

/**
 * Conditionally declared in `code-studio/initApp/loadApp.js`
 *
 * used by `audioApi.ts`
 */
declare const appOptions:
  | undefined
  | Partial<{
      azureSpeechServiceVoices?: Record<
        string,
        Record<string, {locale: string}>
      >;
      authenticityToken?: string;
      signedReplayLogUrl?: string;
    }>;

// Declaring dashboard as 'any' because it is not well documented.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const dashboard: any;
declare const IN_UNIT_TEST: boolean;
declare const IN_STORYBOOK: boolean;
declare const PISKEL_DEVELOPMENT_MODE: string;
declare const DEBUG_MINIFIED: number;

// Declaring stylelint as any for now. We are using this to lint CSS in Web Lab 2,
// which is currently experimental.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const stylelint: any;

// Imported static files are treated as strings
declare module '*.png' {
  const value: string;
  export = value;
}

declare module '*.svg' {
  const value: string;
  export = value;
}

declare module '*.gif' {
  const value: string;
  export = value;
}

// Modules without types
declare module '@blockly/plugin-scroll-options';
declare module '@blockly/keyboard-navigation';
declare module '@blockly/field-angle';
declare module '@blockly/field-bitmap';
declare module '@blockly/field-colour';
declare module '@cdo/locale';
declare module '@code-dot-org/maze';
declare module 'eslint-linter-browserify';
declare module '@replit/codemirror-css-color-picker';
