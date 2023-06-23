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
// @ts-nocheck - @todo Fix ts issues.
/**
 * External dependencies.
 */
import { useCallback, useEffect, useReducer } from 'react';

/**
 * Internal dependencies.
 */
import { type CookieData } from '../../../localStore';
import { getCurrentTab, getCurrentTabId } from '../../../utils/getCurrentTabId';
import {
  type CookieDatabase,
  fetchDictionary,
} from '../../../utils/fetchCookieDictionary';
import findAnalyticsMatch from '../../../worker/findAnalyticsMatch';

type Cookie = {
  name: string;
  value: string;
  expires?: string | number | Date;
  path?: string;
  domain?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
};

type Entry = {
  request: {
    cookies: Cookie[];
    url: string;
  };
  response: {
    cookies: Cookie[];
  };
};

let cookieDB: CookieDatabase | null = null;

export const getCookies = (entry, headerType, dictionary) => {
  const url = entry?.request.url;

  return entry[headerType].cookies.map((cookie: Cookie) => {
    const updatedCookie: { [key: string]: unknown } = {};

    Object.entries(cookie).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      updatedCookie[lowerKey] = value;
    });

    const analytics = dictionary
      ? findAnalyticsMatch(updatedCookie.name, dictionary)
      : null;

    return {
      analytics,
      parsedCookie: updatedCookie,
      headerType,
      url,
    };
  });
};

export const getHARCookie = (
  entries: Entry[] = [],
  headerType: 'response' | 'request',
  dictionary
): CookieData[] => {
  return entries.reduce((cookies, entry) => {
    const _cookies = getCookies(entry, headerType, dictionary);
    return [...cookies, ..._cookies];
  }, []);
};

export const getNewCookies = async (entries, callback, dictionary) => {
  const currentTab = await getCurrentTab();
  const newCookies: { [key: string]: CookieData } = {};

  if (!currentTab) {
    return newCookies;
  }

  const currentTabId = await getCurrentTabId(currentTab);

  if (!currentTabId || Number(currentTabId) <= 0) {
    return newCookies;
  }

  const requestCookies = callback(entries, 'request', dictionary);
  const responseCookies = callback(entries, 'response', dictionary);

  const cookies = [...requestCookies, ...responseCookies];

  if (!cookies.length) {
    return newCookies;
  }

  for (const cookie of cookies) {
    if (cookie) {
      newCookies[cookie.parsedCookie.name] = cookie;
    }
  }

  return newCookies;
};

export const updateCookieOnRequestFinished = async (request, setCookies) => {
  if (!cookieDB) {
    cookieDB = await fetchDictionary();
  }

  const cookies = await getNewCookies(request, getCookies, cookieDB);

  if (!Object.keys(cookies).length) {
    return;
  }

  setCookies(cookies);
};

export const updateInitialCookies = async (
  harLog: chrome.devtools.network.HARLog,
  setCookies
) => {
  if (!cookieDB) {
    cookieDB = await fetchDictionary();
  }

  const cookies = await getNewCookies(harLog.entries, getHARCookie, cookieDB);

  if (!Object.keys(cookies).length) {
    return;
  }

  setCookies(cookies);
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_COOKIES':
      return {
        ...state,
        cookies: {
          ...state.cookies,
          ...action.payload,
        },
      };
    case 'SET_TAB_URL':
      return { ...state, tabURL: action.payload };
    default:
      return state;
  }
};

const useHarCookies = () => {
  const [state, dispatch] = useReducer(reducer, {
    cookies: {},
    tabURL: '',
  });

  const setCookies = useCallback((cookies) => {
    dispatch({ type: 'SET_COOKIES', payload: cookies });
  }, []);

  const setTabUrl = useCallback((url) => {
    dispatch({ type: 'SET_TAB_URL', payload: url });
  }, []);

  useEffect(() => {
    if (!state.tabURL) {
      (async () => {
        const currentTab = await getCurrentTab();

        if (currentTab && currentTab[0]?.url) {
          setTabUrl(currentTab[0]?.url);
        }
      })();
    }
  }, [setTabUrl, state.tabURL]);

  useEffect(() => {
    const updateCookie = async (request) => {
      await updateCookieOnRequestFinished(request, setCookies);
    };

    chrome.devtools.network.getHAR(async (harLog) => {
      await updateInitialCookies(harLog, setCookies);
    });

    chrome.devtools.network.onRequestFinished.addListener(updateCookie);

    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(updateCookie);
    };
  }, []);

  return state;
};

export default useHarCookies;
