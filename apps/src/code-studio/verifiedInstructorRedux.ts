const SET_VERIFIED = 'verifiedInstructor/SET_VERIFIED';
const SET_VERIFIED_RESOURCES = 'verifiedInstructor/SET_VERIFIED_RESOURCES';

export const setVerified = () => {
  return {
    type: SET_VERIFIED,
  } as const;
};

export const setVerifiedResources = () => {
  return {
    type: SET_VERIFIED_RESOURCES,
  } as const;
};

const initialState = {
  isVerified: false,
  // True if a page (course/script) has resources that are only available to
  // verified teachers
  hasVerifiedResources: false,
};

type VerifiedInstructorAction =
  | ReturnType<typeof setVerified>
  | ReturnType<typeof setVerifiedResources>;

export default function verifiedInstructor(
  state = initialState,
  action: VerifiedInstructorAction
) {
  if (action.type === SET_VERIFIED) {
    return {
      ...state,
      isVerified: true,
    };
  }

  if (action.type === SET_VERIFIED_RESOURCES) {
    return {
      ...state,
      hasVerifiedResources: true,
    };
  }

  return {
    ...state,
  };
}
