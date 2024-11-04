import { initializeGrid, displayBoard } from "./domController";
import { Player } from "./player";
import "./styles.css";

const userGrid = document.querySelector("#player-grid");
const userPlayer = new Player("Erik", true, userGrid);
userPlayer.gameboard.randomlyPlaceDogs();
initializeGrid(userPlayer.gameboard);
displayBoard(userPlayer.gameboard);

const opponentGrid = document.querySelector("#opponent-grid");
const opponentPlayer = new Player("Neighbor", false, opponentGrid);
opponentPlayer.gameboard.randomlyPlaceDogs();
initializeGrid(opponentPlayer.gameboard);
//displayBoard(opponentPlayer.gameboard);
