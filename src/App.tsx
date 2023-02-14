import React, { useEffect, useState } from "react";
import "./App.css";
import Dock from "./components/dock/dock";
import Grid from "./components/grid/grid";


export interface Cell {
  x: number;
  y: number;
  hit?: boolean;
  miss?: boolean;
  type?: string;
  count?: number;
  prob?: number;
  sunk?: boolean;
}

interface Enemy {
  targetStack: Cell[];
  mode: "HUNT" | "KILL";
  targetList: Cell[];
}

export interface Ship {
  type: string;
  size: number;
  placed: boolean;
}

const message = (text: string) => {
  console.log("MESSAGE: " + text);
};

const copy = (element: any) => {
  return JSON.parse(JSON.stringify(element));
};

function App() {
  const [probGrid, setProbGrid] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<
    "INIT" | "PLACEMENT" | "COMBAT" | "GAMEOVER"
  >("INIT");
  const [playerGrid, setPlayerGrid] = useState<Cell[][]>([]);
  const [enemyGrid, setEnemyGrid] = useState<Cell[][]>([]);
  // const [startCell, setStartCell] = useState<Cell>({ x: 0, y: 0 });
  // const [endCell, setEndCell] = useState<Cell>({ x: 0, y: 0 });
  const [enemy, setEnemy] = useState<Enemy>({
    targetStack: [],
    mode: "HUNT",
    targetList: [],
  });
  const [ships, setShips] = useState([
    { type: "carrier", size: 5, placed: false },
    { type: "battleship", size: 4, placed: false },
    { type: "submarine", size: 3, placed: false },
    { type: "cruiser", size: 3, placed: false },
    { type: "destroyer", size: 2, placed: false },
  ]);

  const [canFire, setCanFire] = useState<boolean>(false);

  let startCell: Cell;
  let endCell: Cell;

  useEffect(() => {
    console.log("effect", gameState);
    if (gameState !== "INIT") {
      return;
    }
    setGameState("PLACEMENT");

    setEnemy({
      targetStack: [],
      mode: "HUNT",
      targetList: [],
    });

    setPlayerGrid([]);
    setEnemyGrid([]);
    let tempGrid: Cell[][] = [];
    for (let y = 0; y < 10; y++) {
      if (!tempGrid[y]) {
        tempGrid = [...tempGrid, []];
      }
      for (let x = 0; x < 10; x++) {
        tempGrid = tempGrid.map((row, i) =>
          i === y ? row.concat({ x, y }) : row
        );
      }
    }
    setPlayerGrid(copy(tempGrid));
    setEnemyGrid(copy(tempGrid));
    console.log(playerGrid);
  }, []);

  const playerFire = (cell: Cell) => {
    console.log('playerFire');
    switch (gameState) {
      case "PLACEMENT":
        message("Place your ships before firing!");
        break;
      case "COMBAT":
        if (cell.hit || cell.miss) {
          break;
        }
        if (!fire(enemyGrid, cell))
        enemyFire();
        break;
      case "GAMEOVER":
        message("The game is over!");
        break;
      default:
        break;
    }
  };

  

  const findCell = (grid: Cell[][], x: number, y: number): Cell | undefined => {
    return grid
      .reduce((acc, curr) => acc.concat(curr), [])
      .find((cell) => cell.x === x && cell.y === y);
  };

  const handleShipPlacement = (startEnd:string, cell: Cell): void => {
    if(startEnd === "start") {
      startCell = cell;
      return;
    }
  
    endCell = cell;
    const x1 = startCell.x;
    const y1 = startCell.y;
    const x2 = endCell.x;
    const y2 = endCell.y;
    // check for straight line
    if (x1 !== x2 && y1 !== y2) {
      return;
    }
    const xStart = Math.min(x1, x2);
    const yStart = Math.min(y1, y2);
    const dir = x1 < x2 ? "V" : x2 < x1 ? "V" : y1 < y2 ? "H" : "H";
    const length = Math.abs(x1 - x2) + Math.abs(y1 - y2) + 1;

    // calculate length of ship to place
    // check if ship is already placed
    const ship = ships.find((s) => s.size === length && s.placed === false);
    if (ship) {
      // ship can be placed
      // get all cells
      const shipCells = [];
      switch (dir) {
        case "V":
          for (let n = xStart; n < xStart + length; n++) {
            shipCells.push(findCell(playerGrid, n, yStart));
          }
          break;

        case "H":
          for (let n = yStart; n < yStart + length; n++) {
            shipCells.push(findCell(playerGrid, xStart, n));
          }
          break;
        default:
          break;
      }

      const hasOverlap = shipCells.find((shipCell) => !!shipCell!.type);
      if (!hasOverlap) {
        shipCells.forEach((shipCell) => {
          const gridCell = findCell(playerGrid, shipCell!.x, shipCell!.y);
          gridCell!.type = ship.type;
        });
        ship.placed = true;
        setShips(
          ships.map((oldShip) => (oldShip.type == ship.type ? ship : oldShip))
        );
      }

      if (!ships.find((s) => !s.placed)) {
        placeEnemyShips();
        console.log("all ships placed");
        setCanFire(true);
      }
    }
  };

  const fire = (grid: Cell[][], cell: Cell): boolean => {
    // Find the target cell in the grid
    const gridCell = findCell(grid, cell.x, cell.y)!;

    // If the cell has already been hit or missed, return false
    if (gridCell.hit || gridCell.miss) {
      return false;
    }

    // If the cell is a ship
    if (gridCell.type) {
      // Mark the cell as hit
      gridCell.hit = true;

      // Check if the ship is destroyed
      if (!grid.flat().find((c) => c.type === gridCell.type && !c.hit)) {
        // If all cells of the same type have been hit, mark all as sunk and display message
        message(gridCell.type + " destroyed!");
        grid
          .flat()
          .filter((c) => c.type === gridCell.type && c.hit)
          .forEach((c) => {
            c.sunk = true;
          });
      }

      // Check if all ships have been destroyed
      if (!grid.flat().find((c) => c.type && !c.hit)) {
        message("GAME OVER");
        setGameState("GAMEOVER");
        return true;
      }
    } else {
      // If the cell is not a ship, mark as miss
      gridCell.miss = true;
    }
    return false;
  };

  const placeEnemyShips = (): void => {
    const enemyShips = ships.map((s) => ({ ...s, placed: false }));
    for (const s in enemyShips) {
      if (enemyShips.hasOwnProperty(s)) {
        const ship = enemyShips[s];
        while (!ship.placed) {
          const xStart = Math.round(Math.random() * 10) % 10;
          const yStart = Math.round(Math.random() * 10) % 10;
          const dir = Math.round(Math.random()) === 0 ? "H" : "V";
          const length = ship.size;

          let shipCells = [];
          switch (dir) {
            case "V":
              for (let n = xStart; n < xStart + length; n++) {
                shipCells.push(findCell(enemyGrid, n, yStart));
              }
              break;
            case "H":
              for (let n = yStart; n < yStart + length; n++) {
                shipCells.push(findCell(enemyGrid, xStart, n));
              }
              break;
          }

          shipCells = shipCells.filter((c) => c);

          if (shipCells.length !== ship.size) {
            // We went off the board :(
            continue;
          }

          const hasOverlap = shipCells.find((shipCell) => !!shipCell!.type);
          if (!hasOverlap) {
            shipCells.forEach((shipCell) => {
              const gridCell = findCell(enemyGrid, shipCell!.x, shipCell!.y)!;
              gridCell.type = ship.type;
            });
            ship.placed = true;
          }
        }
      }
    }
    setGameState("COMBAT");
    message("Combat has started!");
  };

  const enemyFire = () => {
    console.log('enemyFire')
    //calculateProbability(ships, playerGrid);

    const targetCells = calculateProbability(ships, playerGrid)
      .reduce((acc, curr) => acc.concat(curr), [])
      .filter((c) => c.prob === 1);
    const targetCell = targetCells.pop()!;

    console.log(targetCell)

    const targetList = enemy.targetList
    targetList.push(targetCell);

    setEnemy({...enemy,targetList})

    fire(playerGrid, targetCell);
  };

  const calculateProbability = (ships: any[], grid: Cell[][]) => {
    let tempGrid: Cell[][] = copy(grid);

    for (const s in ships) {
      if (ships.hasOwnProperty(s)) {
        const ship = ships[s];
        const length = ship.size;
        for (let d = 0; d < 2; d++) {
          const dir = d === 0 ? "H" : "V";

          for (let xStart = 0; xStart < 10; xStart++) {
            for (let yStart = 0; yStart < 10; yStart++) {
              let shipCells = [];
              switch (dir) {
                case "V":
                  for (let n = xStart; n < xStart + length; n++) {
                    shipCells.push(findCell(tempGrid, n, yStart));
                  }
                  break;
                case "H":
                  for (let n = yStart; n < yStart + length; n++) {
                    shipCells.push(findCell(tempGrid, xStart, n));
                  }
                  break;
              }

              shipCells = shipCells.filter((c) => c);

              if (shipCells.length !== ship.size) {
                // We went off the board :(
                continue;
              }

              if (shipCells.find((c) => c && (c.sunk || c.miss))) {
                continue;
              }

              let increment = 1;
              if (shipCells.find((c) => c?.hit)) {
                increment = 20;
              }

              shipCells.forEach((c) => {
                if (!c) return;
                if (c.count) {
                  c.count = c.count + increment;
                } else {
                  c.count = increment;
                }
                if (c.hit || c.miss || c.sunk) {
                  c.count = 0;
                }
              });
            }
          }
        }
      }
    }
    const max = tempGrid
      .reduce((acc, curr) => acc.concat(curr), [])
      .filter((c) => c.count)
      .reduce((acc, curr) => Math.max(acc, curr.count || 0), 0);
    
      tempGrid = tempGrid.map((row) => row.map((c) => ({ ...c, prob: c.count! / max })));

    setProbGrid(tempGrid);
    return tempGrid;
  };
  return (
    <div className="App">
      <header className="App-header noselect">
        React Battleship
        <hr />
        Enemy
        <Grid grid={enemyGrid} canFire={canFire} showShips={true} onFire={playerFire} onShipPlacement={()=>{}}/>
        
        Player
        <Grid grid={playerGrid} canFire={false} showShips={true} onShipPlacement={handleShipPlacement}  />

        
        <Dock ships={ships} />

        <div className="probgrid">
          {probGrid.map((row,i)=>(
            <div className="row" key={i}>
              {row.map((cell,j)=>(
                <div className="prob-cell" key={j} 
                style={{backgroundColor: 'rgba(1,0,0,'+(1-cell.prob!)+')'}}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

//[style.background-color]="'rgba(1,1,1,' + cell.prob + ')'"

export default App;
