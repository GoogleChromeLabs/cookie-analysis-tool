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
  getCurrentTab,
  getCurrentTabId,
} from '../../../../../utils/getCurrentTabId';
import { CookieData } from '../../../../../localStore';

/**
 * Retrieves new cookies from the given entries by invoking the callback function.
 * @param entries - An array of entries.
 * @param callback - The callback function to extract cookies from entries.
 * @param dictionary - The cookie dictionary for analytics matching.
 * @returns A dictionary of new cookies with the cookie name as the key.
 */
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
