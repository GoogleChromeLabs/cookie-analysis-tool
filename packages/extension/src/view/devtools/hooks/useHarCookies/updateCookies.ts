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
import {
  type CookieDatabase,
  fetchDictionary,
} from '../../../../utils/fetchCookieDictionary';
import { getNewCookies } from './utils/getNewCookies';
import { getCookies, getHARCookie } from './utils/getCookies';
import type { Devtools } from 'jest-chrome/types/jest-chrome';

let cookieDB: CookieDatabase | null = null;

/**
 * Updates the cookies when a request is finished.
 * @param request - The request object.
 * @param setCookies - The function to update the cookies state.
 */
export const updateCookieOnRequestFinished = async (
  request: Devtools.network.Request,
  setCookies
) => {
  if (!cookieDB) {
    cookieDB = await fetchDictionary();
  }

  const cookies = await getNewCookies(request, getCookies, cookieDB);

  if (!Object.keys(cookies).length) {
    return;
  }

  setCookies(cookies);
};

/**
 * Updates the initial cookies when the HAR log is received.
 * @param harLog - The HAR log object containing network entries.
 * @param setCookies - The function to update the cookies state.
 */
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
