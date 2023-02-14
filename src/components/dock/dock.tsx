import React from 'react';
import { Ship } from '../../App';
import "./dock.css";




function Dock(props: any) {
    const ships = props.ships as Ship[];
  return (
    <div className="dock">
          {ships.map((ship) => (
            <div key={ship.type} className="ship-container" >
              {[...Array(ship.size)].map((s, i) => (
                <div
                  key={`${ship.type}:${i}`}
                  className={`ship-block  ${ship.type}`}
                  hidden={ship.placed}
                >
                  
                </div>
              ))}
            </div>
          ))}
        </div>
  );
}

export default Dock;
