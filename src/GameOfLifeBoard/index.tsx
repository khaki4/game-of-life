import React from "react";
import GameItem from "./GameItem";
import {itemSize, numCols} from '../constant';
import {GameOfLife} from "./container";

const GameOfLifeBoard: React.FC = React.memo(() => {
  const {
    grid,
    running,
    onClickToggle,
    onClickRandom,
    onClickClear,
  } = GameOfLife.useContainer();

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
        {grid.map((rows, i) => rows.map((_, k) =>
          <GameItem
            key={`${i}${k}`}
            x={i}
            y={k}
          />
        ))}
      </div>
    </>
  )
});

export default React.memo(() => {
  return (
    <GameOfLife.Provider>
      <GameOfLifeBoard/>
    </GameOfLife.Provider>
  );
});
