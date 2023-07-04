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
import type { Cookies } from '../../../../../../../localStore';

type SelectedFilters = {
  [keys: string]: Set<string>;
};

const filterCookies = (
  cookies: Cookies,
  selectedFilters: SelectedFilters
): Cookies => {
  const filteredCookies = {};

  if (!cookies || !Object.keys(selectedFilters).length) {
    return cookies;
  }

  Object.entries(cookies).forEach(([cookieName, cookieData]) => {
    let canShow = false;

    Object.entries(selectedFilters).forEach(([keys, selectedFilter]) => {
      const _keys = keys.split('.');
      const rootKey = _keys[0];
      const subKey = _keys[1];
      const value =
        cookieData[rootKey] && cookieData[rootKey][subKey]
          ? cookieData[rootKey][subKey]
          : '';

      canShow = value && selectedFilter?.has(value);
    });

    if (canShow) {
      filteredCookies[cookieName] = cookieData;
    }
  });

  return filteredCookies;
};

export default filterCookies;
