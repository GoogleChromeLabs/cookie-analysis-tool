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
import React from 'react';

/**
 * Internal dependencies.
 */
import { type CookieData } from '../../../../../../../localStore';

interface IListItem {
  cookie: CookieData;
  isSelected: boolean;
  onClick: () => void;
}

const ListItem = ({ cookie, isSelected, onClick }: IListItem) => {
  return (
    <a
      href="#"
      className={`block hover:bg-secondary ${
        isSelected && 'bg-secondary border-r-4 border-gray-400'
      }`}
      onClick={onClick}
      data-testid="cookie-list-item"
    >
      <div className="px-4 py-3 sm:px-6 border-b">
        <div className="flex items-center justify-between">
          <div className="font-medium w-full flex items-center justify-between">
            <span className="text-sm truncate">{cookie.parsedCookie.name}</span>
          </div>
        </div>
        <div className="mt-0.5">
          <div
            className={`${
              isSelected ? 'font-bold' : 'font-medium'
            } truncate text-xs text-secondary`}
          >
            <span>{cookie.parsedCookie.value}</span>
          </div>
        </div>
        <div
          className={
            'mt-4 flex justify-between items-center text-xs text-secondary'
          }
        >
          <span className="font-bold">
            {cookie.analytics?.category || 'Uncategorized'}
          </span>
          <span
            className={`font-bold ${
              cookie.thirdParty ? 'text-third-party' : 'text-first-party'
            }`}
          >
            {cookie.thirdParty !== null
              ? cookie.thirdParty
                ? 'Third Party'
                : 'First Party'
              : 'Unknown'}
          </span>
        </div>
      </div>
    </a>
  );
};

export default ListItem;
