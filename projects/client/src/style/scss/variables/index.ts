import { assertDefined } from '$lib/utils/assert/assertDefined.ts';
import * as exports from '$style/scss/variables/index.module.scss';

const variables = exports.default as unknown as {
  'breakpoint-desktop': `${string}px`;
  'breakpoint-wide': `${string}px`;
  'breakpoint-mobile': `${string}px`;
  'breakpoint-tablet-lg-max': `${string}px`;
  'breakpoint-tablet-lg-min': `${string}px`;
  'breakpoint-tablet-sm-max': `${string}px`;
  'breakpoint-tablet-sm-min': `${string}px`;
};

assertDefined(
  variables['breakpoint-mobile'],
  '!! breakpoint-mobile not loaded from SCSS !!',
);
assertDefined(
  variables['breakpoint-tablet-sm-min'],
  '!! breakpoint-tablet-sm-min not loaded from SCSS !!',
);
assertDefined(
  variables['breakpoint-tablet-sm-max'],
  '!! breakpoint-tablet-sm-max not loaded from SCSS !!',
);
assertDefined(
  variables['breakpoint-tablet-lg-min'],
  '!! breakpoint-tablet-lg-min not loaded from SCSS !!',
);
assertDefined(
  variables['breakpoint-tablet-lg-max'],
  '!! breakpoint-tablet-lg-max not loaded from SCSS !!',
);
assertDefined(
  variables['breakpoint-desktop'],
  '!! `breakpoint-desktop` not loaded from SCSS !!',
);
assertDefined(
  variables['breakpoint-wide'],
  '!! `breakpoint-wide` not loaded from SCSS !!',
);

export const breakpointDesktop = variables['breakpoint-desktop'];
export const breakpointMobile = variables['breakpoint-mobile'];
export const breakpointTabletLgMax = variables['breakpoint-tablet-lg-max'];
export const breakpointTabletLgMin = variables['breakpoint-tablet-lg-min'];
export const breakpointTabletSmMax = variables['breakpoint-tablet-sm-max'];
export const breakpointTabletSmMin = variables['breakpoint-tablet-sm-min'];
export const breakpointWide = variables['breakpoint-wide'];
