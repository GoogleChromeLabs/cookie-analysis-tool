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
import { type ReducerState, useCallback, useEffect, useReducer } from 'react';

/**
 * Internal dependencies.
 */
import { getCurrentTab } from '../../../../utils/getCurrentTabId';
import {
  updateCookieOnRequestFinished,
  updateInitialCookies,
} from './updateCookies';
import reducer from './reducer';
import type { Cookie, State } from './types';
import type { Devtools } from 'jest-chrome/types/jest-chrome';

const initialState = {
  cookies: {},
  tabURL: '',
};

const useHarCookies = () => {
  const [state, dispatch] = useReducer(
    reducer,
    initialState as ReducerState<State>
  );

  const setCookies = useCallback((cookies: { [key: string]: Cookie }) => {
    dispatch({ type: 'SET_COOKIES', payload: cookies });
  }, []);

  const setTabUrl = useCallback((url: string) => {
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
    const updateCookie = async (request: Devtools.network.Request) => {
      await updateCookieOnRequestFinished(request, setCookies);
    };

    chrome.devtools.network.getHAR(
      async (harLog: chrome.devtools.network.HARLog) => {
        await updateInitialCookies(harLog, setCookies);
      }
    );

    chrome.devtools.network.onRequestFinished.addListener(updateCookie);

    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(updateCookie);
    };
  }, [setCookies]);

  return state;
};

export default useHarCookies;
