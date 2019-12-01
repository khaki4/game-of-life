import {MutableRefObject, useCallback, useEffect, useRef, useState} from "react";
import produce from "immer";
import {createContainer} from "unstated-next";
import {numCols, numRows, operations} from "../constant";

const getCurrentTime = () => new Date().getTime();

export const gridManger = new (class {
  setToOff = () => 0;
  setToRandom = () => (Math.random() > 0.5 ? 1 : 0);
  generateGrid = (setValue: () => number) => () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(Array.from(Array(numCols), setValue));
    }
    return rows;
  };
})();

export function useGameOfLife() {
  const [grid, setGrid] = useState(
    gridManger.generateGrid(gridManger.setToOff)
  );
  const [running, setRunning] = useState(false);
  const runningRef: MutableRefObject<boolean> = useRef(running);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const runSimulation = useSimulation(runningRef, setGrid);
  const { getItemBackground } = useUI(grid);
  const onClickToggle = useCallback(() => {
    setRunning(!running);
    if (!running) {
      runningRef.current = true;
      runSimulation(getCurrentTime());
    }
  }, [setRunning, running, runSimulation]);
  const onClickRandom = useCallback(() => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(Array.from(Array(numCols), gridManger.setToRandom));
    }
    setGrid(rows);
  }, [setGrid]);
  const onClickClear = useCallback(() => {
    setGrid(gridManger.generateGrid(gridManger.setToOff));
  }, [setGrid]);
  const onClickItemHandler = useCallback((x: number, y: number) => () => {
    const newGrid = produce(grid, gridCopy => {
      gridCopy[x][y] = grid[x][y] ? 0 : 1;
    })
    setGrid(newGrid);
  }, [grid]);

  return {
    grid,
    setGrid,
    running,
    onClickToggle,
    onClickRandom,
    onClickClear,
    onClickItemHandler,
    getItemBackground
  };
}

function useUI(grid: Array<Array<number>>) {
  const getItemBackground = useCallback((x, y) => {
    return grid[x][y] ? 'pink' : undefined;
  }, [grid])

  return { getItemBackground };
}

function useSimulation(
  runningRef: MutableRefObject<boolean>,
  setGrid: (value: ((prevState: any[]) => any[]) | any[]) => void
) {
  const simulation = useCallback(function recur(startTime) {
    let _startTime = startTime;
    const time = getCurrentTime() - _startTime;
    if (!runningRef.current) {
      return;
    }

    if (time >= 100) {
      setGrid(grid => {
        return produce(grid, gridCopy => {
          for (let i = 0; i < numRows; i++) {
            for (let k = 0; k < numCols; k++) {
              let neighbors = 0;

              operations.forEach(([x, y]) => {
                const newI = i + x;
                const newK = k + y;
                if (
                  newI >= 0 &&
                  newI < numRows &&
                  newK >= 0 &&
                  newK < numCols
                ) {
                  neighbors += grid[newI][newK];
                }
              });

              if (neighbors < 2 || neighbors > 3) {
                gridCopy[i][k] = 0;
              } else if (grid[i][k] === 0 && neighbors === 3) {
                gridCopy[i][k] = 1;
              }
            }
          }
        });
      });
      _startTime = getCurrentTime();
    }

    requestAnimationFrame(() => recur(_startTime));
  }, [setGrid, runningRef]);
  return simulation;
}

export const GameOfLife = createContainer(useGameOfLife);
