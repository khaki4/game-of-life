import React from 'react';
import {itemSize} from '../constant';
import {GameOfLife} from "./container";

interface IProps {
  x: number;
  y: number;
}
const GameItem: React.FC<IProps> = React.memo(({ x, y }) => {
  const {
    onClickItemHandler,
    getItemBackground,
  } = GameOfLife.useContainer();

  return <div
    onClick={onClickItemHandler(x, y)}
    style={{
      width: itemSize,
      height: itemSize,
      backgroundColor: getItemBackground(x, y),
      border: 'solid 1px black'
    }}/>
});

export default GameItem;
