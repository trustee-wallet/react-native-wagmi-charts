import * as React from 'react';

import { LineChartContext } from './Context';
import { useLineChartData, useLineChartId } from './Data';
import { useCurrentY } from './useCurrentY';

export function useLineChart() {
  const lineChartContext = React.useContext(LineChartContext);
  const maybeId = useLineChartId();
  const dataContext = useLineChartData({
    id: maybeId,
  });
  const currentY = useCurrentY();

  let tmpContext = { data: [] }
  // @ts-ignore
  for (const item of dataContext?.data) {
    // @ts-ignore
    tmpContext.data.push({ ...item })
  }

  return React.useMemo(
    () => ({ ...lineChartContext, ...tmpContext, currentY }),
    [lineChartContext, dataContext, currentY]
  );
}
