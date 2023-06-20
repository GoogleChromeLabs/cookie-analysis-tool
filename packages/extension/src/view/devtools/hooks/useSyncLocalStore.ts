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
 * External dependencies.
 */
import { useEffect } from 'react';

/**
 * Internal dependencies.
 */
import { type CookieData } from '../../../localStore';
import CookieStore from '../../../localStore/cookieStore';
import { getTab } from '../../../utils/getTab';
import { getCurrentTabId } from '../../../utils/getCurrentTabId';

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

const getCookies = (
  entries: Entry[],
  headerType: 'response' | 'request',
  tabUrl: string | unknown
): CookieData[] => {
  // @todo Fix ts error
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return entries.reduce((cookies, entry: Entry) => {
    const url = entry.request.url;
    const _cookies = entry[headerType].cookies.map((cookie) => {
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

    return [...cookies, ..._cookies];
  }, []);
};

const useSyncLocalStore = () => {
  useEffect(() => {
    chrome.devtools.network.getHAR(
      async (harLog: chrome.devtools.network.HARLog) => {
        const tabId = await getCurrentTabId();

        if (!tabId) {
          return;
        }

        const tab = await getTab(tabId);

        if (!tab) {
          return;
        }

        const requestCookies = getCookies(harLog.entries, 'request', tab.url);
        const responseCookies = getCookies(harLog.entries, 'response', tab.url);

        const cookies = [...requestCookies, ...responseCookies];

        await CookieStore.update(tabId, cookies);
      }
    );
  }, []);
};

export default useSyncLocalStore;
