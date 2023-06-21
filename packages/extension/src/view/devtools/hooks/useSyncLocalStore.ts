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
import { useEffect } from 'react';

/**
 * Internal dependencies.
 */
import { type CookieData } from '../../../localStore';
import CookieStore from '../../../localStore/cookieStore';
import { getCurrentTab, getCurrentTabId } from '../../../utils/getCurrentTabId';

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

const getCookies = (entry, headerType, tabUrl) => {
  const url = entry?.request.url;

  return entry[headerType].cookies.map((cookie: Cookie) => {
    const updatedCookie: { [key: string]: unknown } = {};

    Object.entries(cookie).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      updatedCookie[lowerKey] = value;
    });

    return {
      parsedCookie: updatedCookie,
      headerType,
      url,
      toplevel: tabUrl,
    };
  });
};

const getHARCookie = (
  entries: Entry[] = [],
  headerType: 'response' | 'request',
  tabUrl: string | unknown
): CookieData[] => {
  return entries.reduce((cookies, entry) => {
    const _cookies = getCookies(entry, headerType, tabUrl);
    return [...cookies, ..._cookies];
  }, []);
};

const updateCookies = async (entries, callback) => {
  const currentTab = await getCurrentTab();

  if (!currentTab) {
    return;
  }

  const currentTabId = await getCurrentTabId(currentTab);

  const requestCookies = callback(entries, 'request', currentTab.url);
  const responseCookies = callback(entries, 'response', currentTab.url);

  const cookies = [...requestCookies, ...responseCookies];

  if (!cookies.length) {
    return;
  }

  await CookieStore.update(currentTabId, cookies);
};

const updateCookieOnRequestFinished = async (request) => {
  await updateCookies(request, getCookies);
};

const updateInitialCookies = async (harLog: chrome.devtools.network.HARLog) => {
  await updateCookies(harLog.entries, getHARCookie);
};

const useSyncLocalStore = () => {
  useEffect(() => {
    chrome.devtools.network.getHAR(updateInitialCookies);

    chrome.devtools.network.onRequestFinished.addListener(
      updateCookieOnRequestFinished
    );

    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(
        updateCookieOnRequestFinished
      );
    };
  }, []);
};

export default useSyncLocalStore;
