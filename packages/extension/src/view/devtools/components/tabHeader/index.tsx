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

interface TabHeaderProps {
  tabsNames: string[];
  selectedIndex: number;
  setIndex: (index: number) => void;
}

const TabHeader: React.FC<TabHeaderProps> = ({
  tabsNames,
  selectedIndex,
  setIndex,
}) => {
  return (
    <>
      {tabsNames.map((name, index: number) => (
        <div
          key={name}
          className={`h-full mx-1 px-3 flex justify-center items-center rounded-t-lg cursor-pointer ${
            selectedIndex === index ? 'bg-slate-100' : 'bg-slate-200'
          }`}
          onClick={() => setIndex(index)}
        >
          <p>{name}</p>
        </div>
      ))}
    </>
  );
};

export default TabHeader;
