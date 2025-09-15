import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';

import {PageLabels} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import * as utils from '@cdo/apps/utils';

import FindYourRegion from '../../../../../src/code-studio/pd/application/teacher/FindYourRegion';

describe('TeacherApplication', () => {
  const fakeOptionKeys = Object.values(PageLabels).reduce(
    (acc, cur) => acc.concat(Object.keys(cur)),
    []
  );
  const fakeOptions = fakeOptionKeys.reduce(
    (acc, cur) => ({...acc, [cur]: ['1', '2', '3']}),
    {}
  );
  const defaultProps = {
    apiEndpoint: '/path/to/endpoint',
    options: fakeOptions,
    accountEmail: 'user@email.com',
    errors: [],
    data: {},
    onChange: () => {},
  };

  beforeEach(() => {
    jest.spyOn($, 'ajax').mockReturnValue(new $.Deferred());
    jest.spyOn($, 'param').mockReturnValue(new $.Deferred());
    jest.spyOn(window, 'fetch').mockReturnValue(Promise.resolve({ok: true}));
    jest.spyOn(utils, 'reload').mockImplementation();
    window.ga = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.ga = undefined;
  });

  it('Does not set schoolId if not provided', () => {
    const page = mount(
      <FindYourRegion {...defaultProps} data={{program: 'CSD'}} />
    );
    expect(page.find('SchoolAutocompleteDropdown').prop('value')).toBe(
      undefined
    );
  });

  it('Sets the school dropdown value from props', () => {
    const page = mount(
      <FindYourRegion {...defaultProps} data={{program: 'CSD', school: '50'}} />
    );
    expect(page.find('SchoolAutocompleteDropdown').prop('value')).toBe('50');
  });

  it('Sets the school dropdown value from storage', () => {
    const data = {program: 'CSD', school: '25'};

    const page = mount(<FindYourRegion {...defaultProps} data={data} />);
    expect(page.find('SchoolAutocompleteDropdown').prop('value')).toBe('25');
  });
});
