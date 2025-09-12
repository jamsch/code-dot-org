/** @file Droplet-friendly command definitions for audio commands. */
import * as assetPrefix from '@cdo/apps/assetManagement/assetPrefix';
import AzureTextToSpeech from '@cdo/apps/AzureTextToSpeech';
import Sounds from '@cdo/apps/Sounds';
import i18n from '@cdo/locale';

import {apiValidateType, OPTIONAL, outputWarning} from './javascriptMode';

type ExecuteCmd = (
  id: string | null,
  name: string,
  opts: Record<string, unknown>
) => boolean;

/**
 * Inject an executeCmd method so this mini-library can be used in both
 * App Lab and Game Lab
 */
let executeCmd: ExecuteCmd;

export function injectExecuteCmd(fn: ExecuteCmd) {
  executeCmd = fn;
}

// Max text length for the playSpeech block.
export const MAX_SPEECH_TEXT_LENGTH = 750;

/**
 * Export a set of native code functions that student code can execute via the
 * interpreter.
 * Must be mixed in to the app's command list (see applab/commands.js)
 */
export const commands = {
  /**
   * Start playing a sound.
   *
   * TODO: Implement additional arguments as part of Sound Library Work
   * Spec: https://docs.google.com/document/d/11mpYgmomALyAr53BQl2Ufx0ZYXoMAswqlQBA0aRuNag/edit#heading=h.6uzt0nqaaco
   */
  playSound(opts: {
    /** The sound to play. */
    url: string;
    /** Whether to repeat the sound forever. */
    loop?: boolean;
    /**
     * If false (default) this call will stop other instances of the same sound from playing.
     * If true, multiple instances of the sound may be played simultaneously.
     */
    allowMultiple?: boolean;
    /** Called back when the sound starts playing with an argument of true. If the sound fails to play, called back with an argument of false. */
    callback?: (playSuccess: boolean) => void;
    /** Called back when the sound stops playing. */
    onEnded?: () => void;
  }) {
    const validUrl = apiValidateType(
      opts,
      'playSound',
      'url',
      opts.url,
      'string'
    );
    apiValidateType(opts, 'playSound', 'loop', opts.loop, 'boolean', OPTIONAL);
    const validCallback = apiValidateType(
      opts,
      'playSound',
      'callback',
      opts.callback,
      'function',
      OPTIONAL
    );
    const validOnEnded = apiValidateType(
      opts,
      'playSound',
      'onEnded',
      opts.onEnded,
      'function',
      OPTIONAL
    );

    if (!validUrl) {
      return;
    }

    const url = assetPrefix.fixPath(opts.url);
    if (Sounds.getSingleton().isPlaying(url)) {
      if (opts.callback && validCallback) {
        opts.callback(false);
      }
    }

    // TODO: Re-enable forceHTML5 after Varnish 4.1 upgrade.
    //       See Pivotal #108279582
    //
    //       HTML5 audio is not working for user-uploaded MP3s due to a bug in
    //       Varnish 4.0 with certain forms of the Range request header.
    //
    //       By commenting this line out, we re-enable Web Audio API in App
    //       Lab, which has the following effects:
    //       GOOD: Web Audio should not use the Range header so it won't hit
    //             the bug.
    //       BAD: This disables cross-domain audio loading (hotlinking from an
    //            App Lab app to an audio asset on another site) so it might
    //            break some existing apps.  This should be less problematic
    //            since we now allow students to upload and serve audio assets
    //            from our domain via the Assets API now.
    //
    let forceHTML5 = false;
    if (window.location.protocol === 'file:') {
      // There is no way to make ajax requests from html on the filesystem.  So
      // the only way to play sounds is using HTML5. This scenario happens when
      // students export their apps and run them offline. At this point, their
      // uploaded sound files are exported as well, which means varnish is not
      // an issue.
      forceHTML5 = true;
    }
    Sounds.getSingleton().playURL(url, {
      volume: 1.0,
      loop: !!opts.loop,
      forceHTML5: forceHTML5,
      allowHTML5Mobile: true,
      callback: validCallback && opts.callback,
      onEnded: validOnEnded && opts.onEnded,
    });
  },

  /**
   * Stop playing a sound, or all sounds.
   */
  stopSound(opts: {
    /** The sound to stop. Stop all sounds if omitted. */
    url: string;
  }) {
    const validUrl = apiValidateType(
      opts,
      'stopSound',
      'url',
      opts.url,
      'string',
      OPTIONAL
    );

    if (opts.url && validUrl) {
      const url = assetPrefix.fixPath(opts.url);
      if (Sounds.getSingleton().isPlaying(url)) {
        Sounds.getSingleton().stopLoopingAudio(url);
      }
    } else {
      Sounds.getSingleton().stopAllAudio();
    }
  },
  /**
   * Start playing given text as speech.
   */
  async playSpeech(opts: {
    /** The text to play as speech. */
    text: string;
    /** The gender of the voice to play. */
    gender: string;
    /** The language of the text to play. */
    language: string;
    /** Called when the sound is complete. */
    onComplete: () => void;
  }) {
    const validText = apiValidateType(
      opts,
      'playSpeech',
      'text',
      opts.text,
      'string'
    );
    const validGender = apiValidateType(
      opts,
      'playSpeech',
      'gender',
      opts.gender,
      'string'
    );
    const validOnComplete = apiValidateType(
      opts,
      'playSpeech',
      'onComplete',
      opts.onComplete,
      'function',
      OPTIONAL
    );

    if (!validText || opts.text.length === 0 || !validGender) {
      return;
    }
    apiValidateType(
      opts,
      'playSpeech',
      'language',
      opts.language,
      'string',
      OPTIONAL
    );

    // appOptions.authenticityToken is only expected/used when using this block on a script_level.
    // This is because script_levels remove Rails' authenticity token from the DOM for caching purposes:
    // https://github.com/code-dot-org/code-dot-org/pull/5753
    if (!appOptions) {
      return;
    }
    const {azureSpeechServiceVoices: voices, authenticityToken} = appOptions;
    let {text, gender, language} = opts;
    const {onComplete} = opts;

    // Fall back to defaults if requested language/gender combination is not available.
    if (!(voices?.[language] && voices[language][gender])) {
      language = 'English';
      gender = 'female';
    }

    const MAX_TEXT_LENGTH = 750;
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.slice(0, MAX_TEXT_LENGTH);
      outputWarning(i18n.textToSpeechTruncation());
    }

    const azureTTS = AzureTextToSpeech.getSingleton();
    const promise = azureTTS.createSoundPromise({
      text,
      gender,
      locale: voices?.[language].locale,
      authenticityToken,
      onFailure: (message: string) => outputWarning(message + '\n'),
      onComplete: validOnComplete ? onComplete : null,
    });
    azureTTS.enqueueAndPlay(promise);
  },
};

/**
 * Pass-through functions that call the configured `executeCmd` method with
 * arguments converted to an options object.
 */
export const executors = {
  playSound: (
    url: string,
    loop = false,
    callback: (playSuccess: boolean) => void
  ) => executeCmd(null, 'playSound', {url, loop, callback}),
  stopSound: (url: string) => executeCmd(null, 'stopSound', {url}),
  playSpeech: (
    text: string,
    gender: string,
    language = 'English',
    onComplete: () => void
  ) => executeCmd(null, 'playSpeech', {text, gender, language, onComplete}),
};
// Note to self - can we use _.zipObject to map argumentNames to arguments here?
