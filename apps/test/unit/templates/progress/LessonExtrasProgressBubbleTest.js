import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LessonExtrasFlagIcon from '@cdo/apps/templates/progress/LessonExtrasFlagIcon';
import LessonExtrasProgressBubble from '@cdo/apps/templates/progress/LessonExtrasProgressBubble';
import * as utils from '@cdo/apps/utils';

const defaultProps = {
  lessonExtrasUrl: '/extras',
  isPerfect: false,
  isSelected: false,
};

describe('LessonExtrasProgressBubble', () => {
  beforeEach(() => {
    jest.spyOn(utils, 'currentLocation').mockReturnValue({search: ''});
  });

  afterEach(() => {
    utils.currentLocation.mockRestore();
  });

  it('renders a link to given url', () => {
    const wrapper = shallow(<LessonExtrasProgressBubble {...defaultProps} />);

    expect(wrapper.props().href).toBe('/extras');
  });

  it('preserves query params', () => {
    utils.currentLocation.mockRestore();
    jest.spyOn(utils, 'currentLocation').mockReturnValue({search: '?foo=1'});

    const wrapper = shallow(<LessonExtrasProgressBubble {...defaultProps} />);

    expect(wrapper.props().href).toBe('/extras?foo=1');
  });

  it('removes id from query params', () => {
    utils.currentLocation.mockRestore();
    jest
      .spyOn(utils, 'currentLocation')
      .mockReturnValue({search: '?id=1&foo=1'});

    const wrapper = shallow(<LessonExtrasProgressBubble {...defaultProps} />);

    expect(wrapper.props().href).toBe('/extras?foo=1');
  });

  it('renders a small flag icon when not selected', () => {
    const wrapper = shallow(<LessonExtrasProgressBubble {...defaultProps} />);
    expect(16).toBe(wrapper.find(LessonExtrasFlagIcon).props().size);
  });

  it('renders a large flag icon when selected', () => {
    const wrapper = shallow(
      <LessonExtrasProgressBubble {...defaultProps} isSelected={true} />
    );
    expect(24).toBe(wrapper.find(LessonExtrasFlagIcon).props().size);
  });
});
