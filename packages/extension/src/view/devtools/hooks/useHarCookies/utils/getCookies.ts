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
import findAnalyticsMatch from '../../../../../worker/findAnalyticsMatch';
import type { CookieData } from '../../../../../localStore';
import type { Cookie, Entry } from '../types';

/**
 * Transforms individual cookies in an entry into a standard format,
 * applies analytics matching, and adds additional properties.
 * @param entry - The entry object containing cookies.
 * @param headerType - The type of header ('response' or 'request') to process.
 * @param dictionary - The cookie dictionary for analytics matching.
 * @returns An array of transformed cookies.
 */
export const getCookies = (entry: Entry, headerType: string, dictionary) => {
  const url = entry?.request.url;

  return entry[headerType].cookies.map((cookie) => {
    const updatedCookie: { [key: string]: Cookie } = {};

    Object.entries(cookie).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      updatedCookie[lowerKey] = <Cookie>value;
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

/**
 * Extracts and transforms cookies from multiple entries of a specific header type.
 * @param entries - An array of entries.
 * @param headerType - The type of header ('response' or 'request') to process.
 * @param dictionary - The cookie dictionary for analytics matching.
 * @returns An array of transformed cookies from all entries.
 */
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
