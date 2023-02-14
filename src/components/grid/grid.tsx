import * as React from "react";
import { Cell } from "../../App";

const Grid = (props: any) => {
  const grid = props.grid as Cell[][];
  const showShips = props.showShips;
  const canFire = props.canFire;

  const handleMouseDown = (cell: Cell) => {
    if(!canFire)
    props.onShipPlacement("start", cell);
  };
  const handleMouseUp = (cell: Cell) => {
    if(!canFire)
    props.onShipPlacement("end", cell);
  };

  const handleClick = (cell: Cell) => {
    if (canFire) {
      props.onFire(cell);
    }
  };

  return (
    <div>
      {grid.map((row, i) => (
        <div className="row" key={i}>
          {row.map((cell, j) => (
            <div
              className={[
                "cell",
                cell.type && showShips ? "ship" : "",
                cell.hit ? "hit" : "",
                cell.miss ? "miss" : "",
                cell.sunk ? "sunk" : "",
              ].join(" ")}
              key={j}
              onMouseDown={() => {
                handleMouseDown(cell);
              }}
              onMouseUp={() => {
                handleMouseUp(cell);
              }}
              onClick={()=>{
                handleClick(cell);
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;


