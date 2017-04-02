let grid_size_x;
let grid_size_y;
let ctx;
let block_size = 13;
let start_delay = 100;
let step_delay = 1000;
let generation = 0;
let state_global;
let drift_pixel = 0;
let option = {
    color_tenth: 0,
    freeze: 0
};

function windowLoad() {
    start_canvas();
}

function start_canvas() {
    let canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    let rect = document.body.getBoundingClientRect();
    grid_size_x = Math.floor(rect.width / block_size);
    grid_size_y = Math.floor(rect.height / block_size);
    canvas.width = grid_size_x * block_size;
    canvas.height = grid_size_y * block_size;
    state_global = get_seed();
    requestAnimationFrame(draw_life);

    window.setTimeout(function() {
        window.setInterval(function() {
            drift_pixel-=1;
        }, step_delay/20);
        window.setInterval(function() {
            let state = calculate_next_generation(state_global);
            state_global = state;
            generation++;
        }, step_delay);
    }, start_delay);
}

function wrap_around(i, limit) {
    if(i > limit - 1) {
        i = i - limit;
    } else if(i < 0) {
        i = limit + i;
    }
    return i;
}

function drift(x, state) {
    let a = [];
    for(let row = 0; row < grid_size_y; row++) {
        for(let col = 0; col < grid_size_x; col++) {
            if(col == 0) {
                a[row] = [];
            }
            src_row = row;
            src_col = wrap_around(col + x, grid_size_x);
            a[row][col] = state[src_row][src_col];
        }
    }
    return a;
}

function calculate_next_generation(seed) {
    if(option.freeze) {
        return seed;
    }

    let a = [];
    let any = false;
    for(let row = 0; row < grid_size_y; row++) {
        for(let col = 0; col < grid_size_x; col++) {
            let check_col_left = wrap_around(col - 1, grid_size_x);
            let check_col_right = wrap_around(col + 1, grid_size_x);
            let check_row_up = wrap_around(row - 1, grid_size_y);
            let check_row_down = wrap_around(row + 1, grid_size_y);

            let count_neighbors = seed[row][check_col_left]
                + seed[row][check_col_right]
                + seed[check_row_up][check_col_left]
                + seed[check_row_up][col]
                + seed[check_row_up][check_col_right]
                + seed[check_row_down][check_col_left]
                + seed[check_row_down][col]
                + seed[check_row_down][check_col_right];

            if(col == 0) {
                a[row] = [];
            }
            if(seed[row][col] == 1) {
                a[row][col] = (count_neighbors == 2
                || count_neighbors == 3) ? 1 : 0;
            } else {
                a[row][col] = count_neighbors == 3 ? 1 : 0;
            }
        }
    }

    return a;
}

function get_seed() {
    let a = [];

    for(let row = 0; row < grid_size_y; row++) {
        for(let col = 0; col < grid_size_x; col++) {
            if(col == 0) {
                a[row] = [];
            }
            a[row] = a[row] || [];
            a[row][col] = Math.random() < 0.5 ? 1 : 0;
        }
    }
    return a;
}


let last_generation_drawn;
let last_drift_pixel = false;
function draw_life() {
    if(last_generation_drawn != generation || last_drift_pixel != drift_pixel) {
        draw_life_frame(state_global);
        last_generation_drawn = generation;
        last_drift_pixel = drift_pixel;
    }
    requestAnimationFrame(draw_life);
}

function draw_life_frame(state) {
    let translate_px = drift_pixel % block_size;
    let translate_length = Math.floor((drift_pixel - translate_px) / block_size) % grid_size_x;

    ctx.clearRect(0,0,grid_size_x*block_size, grid_size_y*block_size);
    ctx.clearRect(0,0,1700, grid_size_y*block_size);
    ctx.fillStyle = '#CCCCCC';
    ctx.strokeStyle = '#000000';

    ctx.save();

    ctx.translate(translate_px,0);
    if(translate_px > block_size)
    console.log(translate_px);
    if(translate_length == 0) {
        draw_life_section(state, 0, grid_size_y-1, 0, grid_size_x-1);
    } else if(translate_length < 0) {
        let boundry = Math.abs(translate_length);

        let left_start = boundry;
        let left_end = grid_size_x - 1;
        let right_start = 0;
        let right_end = boundry; // draw 1 past to clip partial column
        let width_rows_skipped = block_size * (1 + left_end - left_start);

        draw_life_section(state, 0, grid_size_y-1, left_start, left_end);

        ctx.save();
        ctx.translate(width_rows_skipped, 0);
        draw_life_section(state, 0, grid_size_y-1, right_start, right_end);
        ctx.restore();

    } else if(translate_length > 0) {
        let boundry = grid_size_x - translate_length - 1;

        let left_start = boundry;
        let left_end = grid_size_x - 1;
        let right_start = 0;
        let right_end = boundry -1;

        let width_rows_skipped = block_size * (1 + left_end - left_start);

        draw_life_section(state, 0, grid_size_y-1, left_start, left_end);

        ctx.save();
        ctx.translate(width_rows_skipped, 0);
        draw_life_section(state, 0, grid_size_y-1, right_start, right_end);
        ctx.restore();
    }

    ctx.restore();
}

function draw_life_section(state, start_row, row_end, start_col, col_end) {
    for(let row = start_row; row <= row_end; row++) {
        let y = row * block_size;
        for(let col = start_col; col <= col_end; col++) {
            if(state[row][col] == 1) {
                let x = (col - start_col) * block_size;
                if(option.color_tenth && col % 10 == 0) {
                    ctx.save();
                    ctx.fillStyle = 'red';
                    ctx.fillRect(x, y, block_size, block_size);
                    ctx.restore();
                } else {
                    ctx.fillRect(x, y, block_size, block_size);
                }
                ctx.strokeRect(x, y, block_size, block_size);
            }
        }
    }
}

window.addEventListener("load", windowLoad);