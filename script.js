// TODO: Redraw only when the grid changes, delete requestAnimationFrame. useEffect with JSON.stringify(grid)
// TODO: make BFS work to optimize for multiple smaller shapes
// TODO: drawCircle can be generalized for other shapes with custom isInside functions. seenCircle -> seenShape
// TODO: create a shape class with all of the above functionalities (a constraint array that "&&"-ed gives the condition for a point to be inside, and points which are in it)
// TODO: another way to do it - construct the shape once and keep the points in a hash table with stringified coordinates as keys

window.onload = () => {
	const canvas = document.getElementsByTagName("canvas")[0];
	const ctx = canvas.getContext("2d");

	const width = canvas.width;
	const height = canvas.height;

	const rows = 100;
	const columns = rows;

	const grid = [];
	for (let i = 0; i < rows; i++) {
		grid.push(new Array(rows));

		for (let j = 0; j < columns; j++) {
			// unset
			grid[i][j] = "white";
		}
	}

	const cellSize = height / rows;

	const drawGrid = () => {
		for (let i = 0; i <= rows; i++) {
			ctx.beginPath();
			ctx.moveTo(0, cellSize * i);
			ctx.lineTo(width, cellSize * i);
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		for (let i = 0; i <= columns; i++) {
			ctx.beginPath();
			ctx.moveTo(cellSize * i, 0);
			ctx.lineTo(cellSize * i, height);
			ctx.lineWidth = 1;
			ctx.stroke();
		}
	};

	const coordToRect = (x, y) => {
		const rectX = x - (x % cellSize);
		const rectY = y - (y % cellSize);

		return { x: rectX, y: rectY };
	};

	const fillCell = (x, y, color = "black") => {
		const rowIdx = x / cellSize;
		const colIdx = y / cellSize;

		// mark the cell
		grid[rowIdx][colIdx] = color;
	};

	const clearCell = (x, y) => {
		const rowIdx = x / cellSize;
		const colIdx = y / cellSize;

		// unmark the cell
		grid[rowIdx][colIdx] = "white";
	};

	const drawLineCoord = (x1, y1, x2, y2, color = "black", step = 0.1) => {
		const tan = (y2 - y1) / (x2 - x1);
		const angle = Math.atan(tan);

		const cos = Math.cos(angle);
		const dx = step * cos;

		const sin = Math.sin(angle);
		const dy = step * sin;

		let [x, y] = [x1, y1];

		const signX = Math.sign(x2 - x1);
		const signY = Math.sign(y2 - y1);

		const eps = step * 5;
		while (Math.hypot(y2 - y, x2 - x) >= eps) {
			const rectCoords = coordToRect(x, y);
			fillCell(rectCoords.x, rectCoords.y, color);

			x += Math.abs(dx) * signX;
			y += Math.abs(dy) * signY;
		}
	};

	// grid[x1][y1] -> first pixel, grid[x2][y2] -> second pixel
	const drawLinePixel = (x1, y1, x2, y2) => {
		drawLineCoord(
			x1 * cellSize,
			y1 * cellSize,
			x2 * cellSize,
			y2 * cellSize
		);
	};

	// rotate (x2,y2) around (x1,y1) by angle radians
	const rotatePoint = (x1, y1, x2, y2, angle) => {
		const sin = Math.sin(angle);
		const cos = Math.cos(angle);

		const rotatedX = cos * (x2 - x1) + sin * (y2 - y1) + x1;
		const rotatedY = cos * (y2 - y1) - sin * (x2 - x1) + y1;

		return [rotatedX, rotatedY];
	};

	// for BFS
	const circleSeen = [];
	for (let i = 0; i < rows; i++) {
		circleSeen.push(new Array(rows));

		for (let j = 0; j < columns; j++) {
			// not seen
			circleSeen[i][j] = 0;
		}
	}
	const drawCircle = (
		cx,
		cy,
		r,
		color = "grey",
		boundaryColor = "black",
		step = 0.01
	) => {
		const rectCoords = coordToRect(cx, cy);

		cx = rectCoords.x;
		cy = rectCoords.y;

		// get center of bounding cell
		cx = cx + cellSize / 2;
		cy = cy + cellSize / 2;

		const distToCenter = (x, y) => {
			return Math.hypot(cx - x, cy - y);
		};

		const isInside = (x, y) => {
			return distToCenter(x, y) <= r;
		};

		const directions = [
			[-1, 0],
			[1, 0],
			[0, 1],
			[0, -1],
		];
		const checkBoundary = (x, y) => {
			const neighbours = [];

			directions.forEach((neighbour) => {
				neighbours.push([
					x + neighbour[0] * cellSize,
					y + neighbour[1] * cellSize,
				]);
			});

			let hasExteriorNeighbour = false;
			neighbours.forEach((neighbour) => {
				hasExteriorNeighbour =
					hasExteriorNeighbour ||
					!isInside(neighbour[0], neighbour[1]);
			});

			let hasInteriorNeighbour = false;
			neighbours.forEach((neighbour) => {
				hasInteriorNeighbour =
					hasInteriorNeighbour ||
					isInside(neighbour[0], neighbour[1]);
			});

			if (isInside(x, y) && hasExteriorNeighbour && hasInteriorNeighbour)
				return true;
			else return false;
		};

		// ! NOT RUNNING
		// BFS

		// let i = (cx - cellSize / 2) / cellSize;
		// let j = (cy - cellSize / 2) / cellSize;
		// const queue = [[i, j]];
		// circleSeen[i][j] = 1;

		// const inBounds = (i, j) => {
		// 	return 0 <= i < circleSeen.length && 0 <= j < circleSeen[0].length;
		// };

		// while (queue.length !== 0) {
		// 	[i, j] = queue.shift();

		// 	let added = false;
		// 	directions.forEach((direction) => {
		// 		const new_i = i + direction[0];
		// 		const new_j = j + direction[1];

		// 		if (
		// 			inBounds(new_i, new_j) &&
		// 			isInside(
		// 				cellSize * i + cellSize / 2,
		// 				cellSize * j + cellSize / 2
		// 			) &&
		// 			!(circleSeen[i + direction[0]][j + directions[1]] === 1)
		// 		) {
		// 			queue.push([new_i, new_j]);
		// 			circleSeen[new_i][new_j] = 1;
		// 			added = true;
		// 		}
		// 	});

		// 	let isBoundary = false;
		// 	if (!added) {
		// 		isBoundary = checkBoundary(i, j);
		// 	}

		// 	const cellColor = isBoundary ? boundaryColor : color;

		// 	fillCell(i * cellSize, j * cellSize, cellColor);
		// }

		// Brute force
		for (let i = 0; i < grid.length; ++i) {
			for (let j = 0; j < grid.length; ++j) {
				const centerX = i * cellSize + cellSize / 2;
				const centerY = j * cellSize + cellSize / 2;
				if (isInside(centerX, centerY)) {
					const isBoundary = checkBoundary(centerX, centerY);
					const cellColor = isBoundary ? boundaryColor : color;

					fillCell(
						centerX - cellSize / 2,
						centerY - cellSize / 2,
						cellColor
					);
				}
			}
		}
	};

	const handleClick = (e) => {
		const bounding = canvas.getBoundingClientRect();
		const { x, y } = coordToRect(
			e.clientX - bounding.left,
			e.clientY - bounding.top
		);

		const rowIdx = x / cellSize;
		const colIdx = y / cellSize;

		if (grid[rowIdx][colIdx] === "white") {
			fillCell(x, y);
		} else clearCell(x, y);
	};

	canvas.addEventListener("click", handleClick);

	const handleMouseDown = (e) => {
		const bounding = canvas.getBoundingClientRect();

		let { oldX, oldY } = coordToRect(
			e.clientX - bounding.left,
			e.clientY - bounding.top
		);

		const handleMouseMove = (e) => {
			const { x, y } = coordToRect(
				e.clientX - bounding.left,
				e.clientY - bounding.top
			);

			// still inside the same cell, do nothing
			if (x === oldX && y === oldY) return;

			drawLineCoord(oldX, oldY, x, y);

			// update previous cell coordinates
			oldX = x;
			oldY = y;
		};

		canvas.removeEventListener("click", handleClick);
		canvas.addEventListener("mousemove", handleMouseMove);

		const onMouseUp = (e) => {
			canvas.removeEventListener("mousemove", handleMouseMove);
			canvas.removeEventListener("mouseup", onMouseUp);

			canvas.addEventListener("click", handleClick);

			// clear final cell to let "click" redraw it
			clearCell(oldX, oldY);
		};

		canvas.addEventListener("mouseup", onMouseUp);
	};

	canvas.addEventListener("mousedown", handleMouseDown);

	const drawCells = () => {
		for (let i = 0; i < grid.length; i++) {
			for (let j = 0; j < grid[0].length; j++) {
				if (grid[i][j] !== "white") {
					ctx.fillStyle = grid[i][j];
					ctx.fillRect(
						i * cellSize,
						j * cellSize,
						cellSize,
						cellSize
					);
				}
			}
		}
	};

	const draw = () => {
		drawCircle(width / 2, height / 2, 300);
		drawCells();
		drawGrid();

		window.requestAnimationFrame(draw);
	};
	window.requestAnimationFrame(draw);

	return;
};
