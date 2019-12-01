import React from 'react';
import produce from "immer";
import {itemSize} from './constant';

const GameItem: React.FC<any> = ({grid, setGrid, i, k}) => {
  return (
    <div
      onClick={() => {
        const newGrid = produce(grid, (gridCopy: Array<Array<number>>) => {
          gridCopy[i][k] = grid[i][k] ? 0 : 1;
        })
        setGrid(newGrid);
      }}
      style={{
        width: itemSize,
        height: itemSize,
        backgroundColor: grid[i][k] ? 'pink' : undefined,
        border: 'solid 1px black'
      }}/>
  );
};

export default GameItem;
