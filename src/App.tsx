import React, {MutableRefObject, useCallback, useEffect, useRef} from "react";
import {useState} from "react";
import produce from "immer";
import GameItem from "./GameItem";
import {itemSize, numCols, numRows, operations} from './constant';

const getCurrentTime = () => new Date().getTime();

const gridManger = new (class {
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

const makeOnClickHandler = (grid: any, setGrid: any) => ([x, y]: [
  number,
  number
]) => () => {
  const newGrid = produce(grid, (gridCopy: any) => {
    gridCopy[x][y] = grid[x][y] ? 0 : 1;
  });
  setGrid(newGrid);
};

const App: React.FC = React.memo(() => {
  const {
    grid,
    setGrid,
    running,
    onClickHandlerWidthGrid,
    onClickToggle,
    onClickRandom,
    onClickClear
  } = useGameOfLife();

  return (
    <>
      <button onClick={onClickToggle}>{running ? "stop" : "start"}</button>
      <button onClick={onClickRandom}>random</button>
      <button onClick={onClickClear}>clear</button>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, ${itemSize}px)`
        }}
      >
        {grid.map((rows, i) => {
          return rows.map((_, k) => {
            return (
              <GameItem
                key={`${i}-${k}`}
                grid={grid}
                setGrid={setGrid}
                i={i}
                k={k}
                onClickHandlerWidthGrid={onClickHandlerWidthGrid}
              />
            );
          });
        })}
      </div>
    </>
  );
});


function useGameOfLife() {
  const [grid, setGrid] = useState(
    gridManger.generateGrid(gridManger.setToOff)
  );
  const [running, setRunning] = useState(false);
  const runningRef: MutableRefObject<boolean> = useRef(running);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);
  const runSimulation = useSimulation(runningRef, setGrid);
  const onClickHandlerWidthGrid = makeOnClickHandler(grid, setGrid);
  const onClickToggle = useCallback(() => {
    setRunning(!running);
    if (!running) {
      runningRef.current = true;
      runSimulation(getCurrentTime());
    }
  }, [setRunning, running, runningRef.current, runSimulation, getCurrentTime]);
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

  return {
    grid,
    setGrid,
    running,
    onClickHandlerWidthGrid,
    onClickToggle,
    onClickRandom,
    onClickClear
  };
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
  }, []);
  return simulation;
}

export default App;
