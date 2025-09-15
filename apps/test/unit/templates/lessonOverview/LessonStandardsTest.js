import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LessonStandards, {
  ExpandMode,
} from '@cdo/apps/templates/lessonOverview/LessonStandards';

import {cspStandards, cstaStandards} from './sampleStandardsData';

describe('LessonStandards', () => {
  it('renders standard with parent category', () => {
    const standard = cspStandards[0];
    const wrapper = mount(<LessonStandards standards={[standard]} />);
    const text = wrapper.text();
    expect(text).toContain(standard.frameworkName);
    expect(text).toContain(standard.parentCategoryShortcode);
    expect(text).toContain(standard.parentCategoryDescription);
    expect(text).toContain(standard.categoryShortcode);
    expect(text).toContain(standard.categoryDescription);
    expect(text).toContain(standard.shortcode);
    expect(text).toContain(standard.description);
  });

  it('renders standard without parent category', () => {
    const standard = cstaStandards[0];
    const wrapper = mount(<LessonStandards standards={[standard]} />);
    const text = wrapper.text();
    expect(text).toContain(standard.frameworkName);
    expect(text).toContain(standard.categoryShortcode);
    expect(text).toContain(standard.categoryDescription);
    expect(text).toContain(standard.shortcode);
    expect(text).toContain(standard.description);
  });

  it('renders many standards from different frameworks', () => {
    const standards = cspStandards.concat(cstaStandards);
    const wrapper = mount(<LessonStandards standards={standards} />);
    const text = wrapper.text();
    standards.forEach(standard => {
      expect(text).toContain(standard.shortcode);
      expect(text).toContain(standard.description);
    });

    const frameworks = wrapper.find('Framework');
    expect(frameworks.length).toBe(2);

    const parentCategories = wrapper.find('UnconnectedParentCategory');
    expect(parentCategories.length > 0).toBe(true);
    parentCategories.forEach(parentCategory => {
      expect(isOpen(parentCategory)).toBe(false);
    });
    const categories = wrapper.find('UnconnectedCategory');
    expect(categories.length > 0).toBe(true);
    categories.forEach(category => {
      expect(isOpen(category)).toBe(false);
    });
  });

  it('renders many standards with all standards expanded', () => {
    const standards = cspStandards.concat(cstaStandards);
    const wrapper = mount(
      <LessonStandards standards={standards} expandMode={ExpandMode.ALL} />
    );
    const frameworks = wrapper.find('Framework');
    expect(frameworks.length).toBe(2);

    const parentCategories = wrapper.find('UnconnectedParentCategory');
    expect(parentCategories.length > 0).toBe(true);
    parentCategories.forEach(parentCategory => {
      expect(isOpen(parentCategory)).toBe(true);
    });

    const categories = wrapper.find('UnconnectedCategory');
    expect(categories.length > 0).toBe(true);
    categories.forEach(category => {
      expect(isOpen(category)).toBe(true);
    });
  });
});

function isOpen(wrapper) {
  const details = wrapper.find('details').first();
  return details.prop('open');
}
