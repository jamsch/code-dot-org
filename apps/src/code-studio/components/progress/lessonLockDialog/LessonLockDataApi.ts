import _ from 'lodash';
import {useMemo} from 'react';

import {useFetch} from '@cdo/apps/util/useFetch';
import {makeEnum} from '@cdo/apps/utils';

export const LockStatus = makeEnum('Locked', 'Editable', 'ReadonlyAnswers');

export type LockStatusValue = 'Locked' | 'Editable' | 'ReadonlyAnswers';

export type UserLockState = {
  /** name of student */
  name: string;
  /**  lock status (corresponds to the radio buttons in the dialog) */
  lockStatus: LockStatusValue;
  /** opaque user_level data sent by server used to identify a user's lock data */
  userLevelData: unknown;
};

/** Array of UserLockState objects, usually representing the lock state for the students in a one section */
export type LockState = UserLockState[];

/** Return type from /api/lock_status */
type LockStatusResponse = {
  [sectionId: number]: {
    lessons: {
      [lessonId: number]: Array<{
        user_level_data: unknown;
        name: string;
        locked: boolean;
        readonly_answers: boolean;
      }>;
    };
  };
};

/**
 * Retrieves the lock state from the server and extracts the data needed by
 * the LeesonLockDialog.
 * @param unitId unit id
 * @param lessonId lesson id
 * @param sectionId section id
 */
export function useGetLockState(
  unitId: number,
  lessonId: number,
  sectionId: number
) {
  const {loading, data} = useFetch<LockStatusResponse>(
    `/api/lock_status?script_id=${unitId}`
  );

  const serverLockState = useMemo(
    () => extractLockData(data, sectionId, lessonId),
    [data, sectionId, lessonId]
  );

  return {loading, serverLockState};
}

/**
 * Extracts and converts the lock status for the given section and lesson.
 * The first parameter is the parsed response to /api/lock_status from the server.
 * @param serverLockState parsed response to /api/lock_status
 * @param sectionId section id
 * @param lessonId lesson id
 * @returns Array of objects containing lock status info for each student in the given
 *    section for the given lesson.
 */
function extractLockData(
  serverLockState: LockStatusResponse | null,
  sectionId: number,
  lessonId: number
): LockState {
  const lessonData = serverLockState?.[sectionId]?.lessons?.[lessonId] ?? [];

  if (!lessonData) {
    return [];
  }

  return lessonData.map(studentData => ({
    name: studentData.name,
    lockStatus: toLockStatus(studentData),
    userLevelData: studentData.user_level_data,
  }));
}

/**
 * Updates the server so that its lock state matches newLockState.
 */
export function saveLockState(
  previousLockState: LockState,
  newLockState: LockState,
  csrfToken: string
) {
  const lockStateChanges = newLockState
    .filter((item, index) => !_.isEqual(item, previousLockState[index]))
    .map(item => ({
      user_level_data: item.userLevelData,
      locked: item.lockStatus === LockStatus.Locked,
      readonly_answers: item.lockStatus === LockStatus.ReadonlyAnswers,
    }));

  return fetch('/api/lock_status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'same-origin',
    body: JSON.stringify({updates: lockStateChanges}),
  });
}

/**
 * Converts an object with locked and readonly_answers fields to a LockStatus enum.
 */
function toLockStatus(lockData: {
  locked: boolean;
  readonly_answers: boolean;
}): LockStatusValue {
  return lockData.locked
    ? LockStatus.Locked
    : lockData.readonly_answers
    ? LockStatus.ReadonlyAnswers
    : LockStatus.Editable;
}
