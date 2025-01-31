import * as React from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import type { TLineChartDataProp } from './types';
import { LineChartDataProvider } from './Data';

import type { TLineChartContext, YRangeProp } from './types';
import { getDomain, lineChartDataPropToArray } from './utils';

export const LineChartContext = React.createContext<TLineChartContext>({
  // @ts-ignore
  currentX: { value: -1 },
  // @ts-ignore
  currentIndex: { value: -1 },
  domain: [0, 0],
  // @ts-ignore
  isActive: { value: false },
  yDomain: {
    min: 0,
    max: 0,
  },
  xDomain: undefined,
  xLength: 0,
});

type LineChartProviderProps = {
  children: React.ReactNode;
  data: TLineChartDataProp;
  high: number;
  low: number;
  yRange?: YRangeProp;
  onCurrentIndexChange?: (x: number) => void;
  xLength?: number;
  xDomain?: [number, number];
};

LineChartProvider.displayName = 'LineChartProvider';

export function LineChartProvider({
  children,
  data = [],
  high,
  low,
  yRange,
  onCurrentIndexChange,
  xLength,
  xDomain,
}: LineChartProviderProps) {
  const currentX = useSharedValue(-1);
  const currentIndex = useSharedValue(-1);
  const isActive = useSharedValue(false);

  const trusteeData = React.useMemo(() => {
    if (!high && !low) return data;
    // @ts-ignore
    return data?.map((item) => {
      const _item = { ...item };
      if (Number(_item?.value) > Number(high)) {
        _item.value = high;
      } else if (_item?.value * 1 < low * 1) {
        _item.value = low;
      }
      return _item;
    });
  }, [data]);

  const domain = React.useMemo(
    () =>
      getDomain(
        // @ts-ignore
        Array.isArray(trusteeData) ? trusteeData : Object.values(trusteeData)[0]
      ),
    [trusteeData]
  );

  const contextValue = React.useMemo<TLineChartContext>(() => {
    const values = lineChartDataPropToArray(trusteeData).map(({ value }) => value);
    const domainRows = Array.isArray(trusteeData)
      ? trusteeData
      : (Object.values(trusteeData)[0]);

    return {
      currentX,
      currentIndex,
      isActive,
      domain,
      yDomain: {
        min: yRange?.min ?? Math.min(...values),
        max: yRange?.max ?? Math.max(...values),
      },
      xDomain,
      // @ts-ignore
      xLength: xLength ?? domainRows?.length,
    };
  }, [
    currentIndex,
    currentX,
    trusteeData,
    domain,
    isActive,
    yRange?.max,
    yRange?.min,
    xLength,
    xDomain,
  ]);

  useAnimatedReaction(
    () => currentIndex.value,
    (x, prevX) => {
      if (x !== -1 && x !== prevX && onCurrentIndexChange) {
        runOnJS(onCurrentIndexChange)(x);
      }
    },
    [currentIndex]
  );

  return (
    <LineChartDataProvider data={trusteeData}>
      <LineChartContext.Provider value={contextValue}>
        {children}
      </LineChartContext.Provider>
    </LineChartDataProvider>
  );
}
