import { Injectable } from '@nestjs/common';
import { Grid } from '../common/types/grid';
import { DIAMOND } from '../common/constants';
import { Cell } from 'src/common/types/cell';

@Injectable()
export class GridService {
  constructor() {}

  /**
   * Creates a new grid where all unexposed cells are replaced with dummy cells with
   * value of empty string and exposed set to false.
   *
   * @param grid the grid to hide
   * @returns the new hidden grid
   */
  getHiddenGrid(
    grid: Grid,
  ): Array<Array<Cell | { value: ''; exposed: boolean }>> {
    const newGrid = grid.map((row) =>
      row.map((cell) => {
        return cell.exposed
          ? cell
          : ({ value: '', exposed: false } as { value: ''; exposed: boolean });
      }),
    );

    return newGrid;
  }

  createGrid(dimension: number, diamondCount: number): Grid {
    const grid = new Array(dimension);
    for (let i = 0; i < dimension; i++) {
      grid[i] = new Array(dimension)
        .fill(0)
        .map((value) => ({ value, exposed: false }));
    }

    return this.populateGridWithDiamonds(grid, dimension, diamondCount);
  }

  private populateGridWithDiamonds(
    grid: Grid,
    dimension: number,
    diamondCount: number,
  ) {
    const numbers = Array.from(
      { length: dimension * dimension },
      (_, i) => i + 1,
    );
    const shuffledNumbers = numbers.sort(() => Math.random() - 0.5);
    const diamonds = shuffledNumbers.slice(0, diamondCount);

    for (const diamond of diamonds) {
      const row = Math.floor((diamond - 1) / dimension);
      const col = (diamond - 1) % dimension;
      grid[row][col].value = DIAMOND;

      const adjacentCells = this.getAdjacentCells(row, col, dimension);
      for (const cell of adjacentCells) {
        const [row, col] = cell;
        if (grid[row][col].value !== DIAMOND) {
          grid[row][col].value = +grid[row][col].value + 1;
        }
      }
    }

    return grid;
  }

  /**
   * Given a row and column on a grid of a given dimension,
   * return all the adjacent cells as an array of [row, col] pairs.
   * The returned array will not include the cell at the given row and col,
   * and will not include any cells that are outside of the grid.
   *
   * @param row the row of the cell to get the adjacent cells of
   * @param col the column of the cell to get the adjacent cells of
   * @param dimension the size of the grid
   * @returns an array of [row, col] pairs, where each pair is an adjacent cell
   */
  private getAdjacentCells(
    row: number,
    col: number,
    dimension: number,
  ): Array<Array<number>> {
    const adjacentCells: Array<Array<number>> = [];
    adjacentCells.push(
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
      [row - 1, col - 1],
      [row - 1, col + 1],
      [row + 1, col - 1],
      [row + 1, col + 1],
    );
    return adjacentCells.filter(
      (value: Array<number>) =>
        value[0] >= 0 &&
        value[0] < dimension &&
        value[1] >= 0 &&
        value[1] < dimension,
    );
  }
}
