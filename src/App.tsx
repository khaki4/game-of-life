import React, {MutableRefObject, useCallback, useEffect, useRef} from "react";
import {useState} from "react";
import produce from 'immer';

const numRows = 50;
const numCols = 50;
const operations = [[0, 1], [0, -1], [1, -1], [-1, 1], [1, 1], [-1, -1], [1, 0], [-1, 0]];
const getCurrentTime = () => new Date().getTime();

const gridManger = new class {
  setToOff = () => 0;
  setToRandom = () => Math.random() > 0.5 ? 1 : 0;
  generateGrid = (setValue: () => number) => () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(Array.from(Array(numCols), setValue));
    }
    return rows;
  };
}();

const App: React.FC = React.memo(() => {
  const [grid, setGrid] = useState(gridManger.generateGrid(gridManger.setToOff));
  const [running, setRunning] = useState(false);
  const runningRef: MutableRefObject<boolean> = useRef(running);
  useEffect(() => {
    runningRef.current = running;
  }, [runningRef.current, running]);
  const runSimulation = useSimulation(runningRef, setGrid);

  return (
    <>
      <button onClick={() => {
        setRunning(!running);
        if (!running) {
          runningRef.current = true;
          runSimulation(getCurrentTime());
        }
      }}>{running ? 'stop' : 'start'}</button>
      <button onClick={() => {
        const rows = [];
        for (let i = 0; i < numRows; i++) {
          rows.push(Array.from(Array(numCols), gridManger.setToRandom));
        }
        setGrid(rows);
      }}>
        random
      </button>
      <button onClick={() => {
        setGrid(gridManger.generateGrid(gridManger.setToOff));
      }}>
        clear
      </button>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${numCols}, 20px)`
      }}>
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div
              key={`${i}-${k}`}
              onClick={() => {
                const newGrid = produce(grid, gridCopy => {
                  gridCopy[i][k] = grid[i][k] ? 0 : 1;
                })
                setGrid(newGrid);
              }}
              style={{
                width: 20,
                height: 20,
                backgroundColor: grid[i][k] ? 'pink' : undefined,
                border: 'solid 1px black'
              }}/>
          ))
        )}
      </div>

    </>
  );
});

function useSimulation(runningRef: MutableRefObject<boolean>, setGrid: (value: (((prevState: any[]) => any[]) | any[])) => void) {
  const simulation = useCallback(function recur(startTime) {
    let _startTime = startTime;
    const time = getCurrentTime() - _startTime;
    if (!runningRef.current) {
      return;
    }

    if (time >= 100) {
      setGrid((grid) => {
        return produce(grid, gridCopy => {
          for (let i = 0; i < numRows; i++) {
            for (let k = 0; k < numCols; k++) {
              let neighbors = 0;

              operations.forEach(([x, y]) => {
                const newI = i + x;
                const newK = k + y;
                if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
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
        })
      });
      _startTime = getCurrentTime();
    }

    requestAnimationFrame(() => recur(_startTime));
  }, []);
  return simulation;
}

export default App;
