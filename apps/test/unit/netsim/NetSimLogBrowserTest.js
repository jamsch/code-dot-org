/** @file NetSimLogBrowser tests */
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import NetSimLogBrowser from '@cdo/apps/netsim/NetSimLogBrowser';
import i18n from '@cdo/netsim/locale';

describe('NetSimLogBrowser', function () {
  it('renders warning-free with the least possible parameters', function () {
    let shallowResult = shallow(
      <NetSimLogBrowser
        i18n={i18n}
        setRouterLogMode={jest.fn()}
        currentTrafficFilter="none"
        setTrafficFilter={jest.fn()}
        headerFields={[]}
        logRows={[]}
        senderNames={[]}
      />
    );
    expect(shallowResult).not.toHaveLength(0);
  });
});
