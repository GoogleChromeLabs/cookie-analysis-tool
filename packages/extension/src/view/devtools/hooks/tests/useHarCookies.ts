/*
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Internal dependencies.
 */
import { getCookies, getHARCookie } from '../useHarCookies';

const ENTRY = {
  // Not full object.
  _initiator: {},
  _priority: 'High',
  _resourceType: 'xhr',
  request: {
    method: 'GET',
    url: 'https://example.org/pagead/ppub_config?ippd=www.example.org',
    headers: [],
    queryString: [],
    cookies: [
      {
        name: 'cookiePreferences',
        value: 'CheckForPermission',
        path: '/',
        domain: '.doubleclick.net',
        expires: '2023-06-18T15:38:43.000Z',
        httpOnly: false,
        secure: true,
        sameSite: 'none',
      },
    ],
  },
  response: {
    status: 200,
    headers: [],
    cookies: [
      {
        name: 'test_cookie',
        value: 'CheckForPermission',
        path: '/',
        domain: '.doubleclick.net',
        expires: '2023-06-18T15:38:43.000Z',
        httpOnly: false,
        secure: true,
        sameSite: 'none',
      },
    ],
  },
};

const ENTRIES = [
  ENTRY,
  {
    _initiator: {},
    _priority: 'High',
    _resourceType: 'xhr',
    request: {
      method: 'GET',
      url: 'https://example.org/pagead/ppub_config?ippd=www.example.org',
      headers: [],
      queryString: [],
      cookies: [
        {
          name: '_ga_434343DB',
          value: 'CheckForPermission',
          path: '/',
          domain: '.doubleclick.net',
          expires: '2023-06-18T15:38:43.000Z',
          httpOnly: false,
          secure: true,
          sameSite: 'none',
        },
      ],
    },
    response: {
      status: 200,
      headers: [],
      cookies: [
        {
          name: '_gid',
          value: 'CheckForPermission',
          path: '/',
          domain: '.doubleclick.net',
          expires: '2023-06-18T15:38:43.000Z',
          httpOnly: false,
          secure: true,
          sameSite: 'none',
        },
      ],
    },
  },
];

const DICTIONARY = {
  cookiePreferences: [
    {
      platform: 'Google Tag Manager',
      category: 'Functional',
      name: 'cookiePreferences',
      domain: "Advertiser's website domain (1st party)",
      description: 'Registers cookie preferences of a user',
      retention: '2 years',
      dataController: 'Google',
      gdprUrl: 'https://privacy.google.com/take-control.html',
      wildcard: '0',
    },
  ],
  '_ga_*': [
    {
      platform: 'Google Analytics',
      category: 'Analytics',
      name: '_ga_*',
      domain:
        "google-analytics.com (3rd party) or advertiser's website domain (1st party)",
      description: 'ID used to identify users',
      retention: '2 years',
      dataController: 'Google',
      gdprUrl: 'https://privacy.google.com/take-control.html',
      wildcard: '1',
    },
  ],
  _gid: [
    {
      platform: 'Google Analytics',
      category: 'Analytics',
      name: '_gid',
      domain:
        "google-analytics.com (3rd party) or advertiser's website domain (1st party)",
      description: 'ID used to identify users for 24 hours after last activity',
      retention: '24 hours',
      dataController: 'Google',
      gdprUrl: 'https://privacy.google.com/take-control.html',
      wildcard: '0',
    },
  ],
};

describe('getCookies', () => {
  it('Should get list of cookies', () => {
    const requestCookies = getCookies(ENTRY, 'request', {});

    expect(requestCookies).toEqual(expect.arrayContaining([]));

    const responseCookies = getCookies(ENTRY, 'response', {});

    expect(responseCookies).toStrictEqual([
      {
        analytics: null,
        parsedCookie: {
          name: 'test_cookie',
          value: 'CheckForPermission',
          path: '/',
          domain: '.doubleclick.net',
          expires: '2023-06-18T15:38:43.000Z',
          httponly: false,
          secure: true,
          samesite: 'none',
        },
        headerType: 'response',
        url: 'https://example.org/pagead/ppub_config?ippd=www.example.org',
      },
    ]);

    const requestCookiesTest2 = getCookies(ENTRY, 'request', DICTIONARY);

    expect(requestCookiesTest2).toStrictEqual([
      {
        analytics: {
          platform: 'Google Tag Manager',
          category: 'Functional',
          name: 'cookiePreferences',
          domain: "Advertiser's website domain (1st party)",
          description: 'Registers cookie preferences of a user',
          retention: '2 years',
          dataController: 'Google',
          gdprUrl: 'https://privacy.google.com/take-control.html',
          wildcard: '0',
        },
        parsedCookie: {
          name: 'cookiePreferences',
          value: 'CheckForPermission',
          path: '/',
          domain: '.doubleclick.net',
          expires: '2023-06-18T15:38:43.000Z',
          httponly: false,
          secure: true,
          samesite: 'none',
        },
        headerType: 'request',
        url: 'https://example.org/pagead/ppub_config?ippd=www.example.org',
      },
    ]);
  });
});

describe('getHARCookie', () => {
  it('Should return HAR cookies', () => {
    const harCookie = getHARCookie(ENTRIES, 'response', DICTIONARY);

    expect(harCookie).toStrictEqual([
      {
        analytics: null,
        parsedCookie: {
          name: 'test_cookie',
          value: 'CheckForPermission',
          path: '/',
          domain: '.doubleclick.net',
          expires: '2023-06-18T15:38:43.000Z',
          httponly: false,
          secure: true,
          samesite: 'none',
        },
        headerType: 'response',
        url: 'https://example.org/pagead/ppub_config?ippd=www.example.org',
      },
      {
        analytics: {
          platform: 'Google Analytics',
          category: 'Analytics',
          name: '_gid',
          domain:
            "google-analytics.com (3rd party) or advertiser's website domain (1st party)",
          description:
            'ID used to identify users for 24 hours after last activity',
          retention: '24 hours',
          dataController: 'Google',
          gdprUrl: 'https://privacy.google.com/take-control.html',
          wildcard: '0',
        },
        parsedCookie: {
          name: '_gid',
          value: 'CheckForPermission',
          path: '/',
          domain: '.doubleclick.net',
          expires: '2023-06-18T15:38:43.000Z',
          httponly: false,
          secure: true,
          samesite: 'none',
        },
        headerType: 'response',
        url: 'https://example.org/pagead/ppub_config?ippd=www.example.org',
      },
    ]);
  });
});
