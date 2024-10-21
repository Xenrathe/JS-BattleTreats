import "./styles.css";
import { DomController } from "./domController";

const playerGrid = document.querySelector("#player-grid");
const opponentGrid = document.querySelector("#opponent-grid");
const domController = new DomController(playerGrid, opponentGrid);
domController.initializeGrid(playerGrid);
domController.initializeGrid(opponentGrid);
