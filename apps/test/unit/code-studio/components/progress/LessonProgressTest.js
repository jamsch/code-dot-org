import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedLessonProgress as LessonProgress} from '@cdo/apps/code-studio/components/progress/LessonProgress';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

describe('LessonProgress', () => {
  const defaultProps = {
    levels: [
      {
        id: '123',
        status: LevelStatus.not_tried,
      },
    ],
    stageId: 1,
    isLessonExtras: false,
  };

  it('uses progress bubbles', () => {
    const wrapper = shallow(<LessonProgress {...defaultProps} />);
    expect(wrapper.find('Connect(StatusProgressDot)').length).toBe(0);
    expect(wrapper.find('ProgressBubble').length).toBe(1);
  });

  it('does not include lesson extras when there is not a lessonExtrasUrl', () => {
    const wrapper = shallow(<LessonProgress {...defaultProps} />);
    expect(wrapper.find('LessonExtrasProgressBubble').length).toBe(0);
  });

  it('includes lesson extras when there is a lessonExtrasUrl', () => {
    const wrapper = shallow(
      <LessonProgress {...defaultProps} lessonExtrasUrl={'/extras'} />
    );
    expect(wrapper.find('LessonExtrasProgressBubble').length).toBe(1);
  });
});
