import { useDerivedValue } from 'react-native-reanimated';

import { formatPrice } from '../../utils';
import type { TFormatterFn } from '../candle/types';
import { useLineChart } from './useLineChart';

export function useLineChartPrice({
  format,
  precision = 2,
  index,
  currencySymbol
}: { format?: TFormatterFn<string>; precision?: number; index?: number; currencySymbol?: string } = {}) {
  const { currentIndex, data } = useLineChart();

  const float = useDerivedValue(() => {
    if (
      (typeof currentIndex.value === 'undefined' ||
        currentIndex.value === -1) &&
      index == null
    )
      return '';

    if (!data) {
      return '';
    }

    let price = 0;
    // @ts-ignore
    price = data[Math.min(index ?? currentIndex.value, data.length - 1)]!.value;
    return price.toString();
  }, [currentIndex, data, precision]);
  const formatted = useDerivedValue(() => {
    let value = float.value || '';
    const formattedPrice = value ? formatPrice({ value }) : '';
    return format
      // @ts-ignore
      ? format({ value, formatted: formattedPrice, precision, currencySymbol })
      : formattedPrice;
  }, [float, format]);

  return { value: float, formatted };
}
