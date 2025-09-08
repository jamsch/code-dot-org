import type {PostMilestoneMode} from '@cdo/generated-scripts/sharedConstants';

import type {TestResult} from '../constants';
import type {SerializedAnimationList} from '../p5lab/shapes';

import type {MilestoneReport} from './reporting';
import type {AutoplayVideo} from './videos';

export type AppOptionsConfig = {
  embedded: boolean;
  scriptName: string;
  lessonPosition: string;
  levelPosition: string;
  autoplayVideo: AutoplayVideo;
  initialAnimationList: SerializedAnimationList;
  levelGameName: string;
  skinId: string;
  baseUrl: string;
  app: string;
  droplet: boolean;
  level: Level | Artist | Blockly;
  showUnusedBlocks: boolean;
  fullWidth: boolean;
  noHeader: boolean;
  noFooter: boolean;
  smallFooter: boolean;
  codeStudioLogo: boolean;
  hasI18n: boolean;
  whiteBackground: boolean;
  callouts: unknown;
  channel: string;
  readonlyWorkspace: boolean;
  isExternalProjectLevel: boolean;
  isLegacyShare: boolean;
  legacyShareStyle: boolean;
  postMilestoneMode: typeof PostMilestoneMode;
  puzzleRatingsUrl: string;
  authoredHintViewRequestsUrl: string;
  authoredHintsUsedIds: unknown;
  serverLevelId: number;
  serverProjectLevelId: number;
  gameDisplayName: string;
  appName: string;
  publicCaching: boolean;
  /**
   * Will be true if the user is 13 or older
   *
   * false if they are 12 or younger, and undefined if we don't know
   * (such as when they are not signed in).
   */
  is13Plus?: boolean;
  hasContainedLevels: boolean;
  hideSource: boolean;
  share: string;
  labUserId: string;
  isSignedIn: boolean;
  pinWorkspaceToBottom: boolean;
  hasVerticalScrollbars: boolean;
  showExampleTestButtons: boolean;
  report: ReportOptions;
  isUS: boolean;
  send_to_phone_url: string;
  teacherMarkdown: string;
  dialog: DialogOptions;
  locale: string;
  azureSpeechServiceVoices?: unknown;
  authenticityToken?: string;
  levelRequiresChannel: boolean;
  reduceChannelUpdates: boolean;
  hasOpenCodeReview: boolean;
  isViewingOwnProject: boolean;
  codeOwnersName?: string;
  recaptchaSiteKey?: string;
};

type ReportOptions = {
  fallback_response: FallbackResponse;
  lastReport: MilestoneReport;
  callback: unknown;
  sublevelCallback: unknown;
};

type FallbackResponse = {
  success: MilestoneResponse;
  failure: MilestoneResponse;
};

type Level = {
  skin: string;
  editCode: boolean;
  embed: boolean;
  isK1: boolean;
  isProjectLevel: boolean;
  skipInstructionsPopup: boolean;
  disableParamEditing: boolean;
  disableVariableEditing: boolean;
  useModalFunctionEditor: boolean;
  useContractEditor: boolean;
  contractHighlight: boolean;
  contractCollapse: boolean;
  examplesHighlight: boolean;
  examplesCollapse: boolean;
  definitionHighlight: boolean;
  definitionCollapse: boolean;
  freePlay: boolean;
  appWidth: number;
  appHeight: number;
  sliderSpeed: number;
  calloutJson: string;
  disableExamples: boolean;
  showTurtleBeforeRun: boolean;
  autocompletePaletteApisOnly: boolean;
  textModeAtStart: boolean;
  designModeAtStart: boolean;
  hideDesignMode: boolean;
  beginnerMode: boolean;
  levelId: string;
  puzzle_number: number;
  lesson_total: number;
  iframeEmbed: boolean;
  iframeEmbedAppAndCode: boolean;
  lastAttempt: unknown;
  submittable: boolean;
  levelVideos: Array<unknown>;
  mapReference: string;
  referenceLinks: Array<unknown>;
  isLastLevelInLesson: boolean;
  isLastLevelInScript: boolean;
  showEndOfLessonMsgs: boolean;
  anonymous: boolean;
  activity_guide_level: boolean;
};

type Artist = {
  startDirection: number;
  initialX: number;
  initialY: number;
  predraw_blocks: Array<unknown>;
  images: Array<unknown>;
  free_play: unknown;
  permitted_errors: unknown;
  impressive: unknown;
  discard_background: unknown;
  shapeways_url: unknown;
  disable_sharing: unknown;
};

type Blockly = {
  levelUrl: unknown;
  skin: unknown;
  initializationBlocks: unknown;
  startBlocks: unknown;
  toolboxBlocks: unknown;
  requiredBlocks: unknown;
  recommendedBlocks: unknown;
  solutionBlocks: unknown;
  aniGifUrl: unknown;
  isK1: unknown;
  skipInstructionsPopup: unknown;
  neverAutoplayVideo: unknown;
  scrollbars: unknown;
  ideal: unknown;
  minWorkspaceHeight: unknown;
  stepSpeed: unknown;
  sliderSpeed: unknown;
  disableParamEditing: unknown;
  disableVariableEditing: unknown;
  disableProcedureAutopopulate: unknown;
  use_modalFunctionEditor: unknown;
  useContractEditor: unknown;
  defaultNumExampleBlocks: unknown;
  openFunctionDefinition: unknown;
  contractHighlight: unknown;
  contractCollapse: unknown;
  examplesHighlight: unknown;
  examplesCollapse: unknown;
  examplesRequired: unknown;
  definitionHighlight: unknown;
  definitionCollapse: unknown;
  disableExamples: unknown;
  projectTemplateLevelName: unknown;
  hideShareAndRemix: unknown;
  isProjectLevel: unknown;
  editCode: unknown;
  codeFunctions: unknown;
  paletteCategoryAtStart: unknown;
  failureMessageOverride: unknown;
  dropletTooltipsDisabled: unknown;
  lockZeroParamFunctions: unknown;
  containedLevelNames: unknown;
  encryptedExamples: unknown;
  disableIfElseEditing: unknown;
};

type DialogOptions = {
  skipSound: boolean;
  preTitle: string;
  fallbackResponse: FallbackResponse;
  callback: unknown;
  sublevelCallback: unknown;
  app: string;
  level: unknown;
  shouldShowDialog: boolean;
};

export type LiveMilestoneResponse = MilestoneResponse & {
  timestamp: unknown;
  share_failure: {
    message: unknown;
    type: unknown;
    contents: unknown;
  };
  level_source: string;
  level_source_id: string;
  level_source_image_url: string;
};

type MilestoneResponse = {
  script_id: unknown;
  level_id: unknown;
  video_info: AutoplayVideo;
  /** path to 'next' level in the lesson/script sequence. */
  redirect: string;
  lesson_changing: {
    previous: {
      position: number;
      name: string;
    };
  };
  end_of_lesson_experience: boolean;
  hint_view_requests: HintViewRequest[];
  hint_view_request_url: string;
  message: string;
  puzzle_ratings_enabled: boolean;
};

type HintViewRequest = {
  feedback_type: TestResult;
  feedback_xml: string;
};
