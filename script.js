let grid_size_x;
let grid_size_y;
let ctx;
let ctx_off_screen;
let buffer_image;
let block_size = 12;
let start_delay = 100;
let step_delay = 1000;
let generation = 0;
let state_global;
let drift_pixel = 0;
let option = {
    color_tenth: 0,
    freeze: 0,
    border_guide: 0
};

function windowLoad() {
    start_canvas();
}

function initialize_off_screen_context() {
    let canvas = document.createElement('canvas');
    ctx_off_screen = canvas.getContext('2d');
    canvas.width = grid_size_x * block_size;
    canvas.height = grid_size_y * block_size;
}

function start_canvas() {
    let rect = document.body.getBoundingClientRect();
    grid_size_x = Math.floor(rect.width / block_size);
    grid_size_y = Math.floor(rect.height / block_size);

    let canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    initialize_off_screen_context();
    canvas.width = grid_size_x * block_size;
    canvas.height = grid_size_y * block_size;
    state_global = get_seed();
    requestAnimationFrame(draw_life);

    window.setTimeout(function() {
        window.setInterval(function() {
            drift_pixel-=2;
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
    draw_life_off_screen(state);

    let mod_drift = drift_pixel % (grid_size_x * block_size);
    ctx.putImageData(buffer_image, mod_drift, 0);
    if(mod_drift < 0) {
        ctx.putImageData(buffer_image, mod_drift + grid_size_x*block_size, 0);
    } else if(mod_drift > 0) {
        ctx.putImageData(buffer_image, mod_drift + -grid_size_x*block_size, 0);
    }
}

function draw_life_off_screen(state) {
    ctx_off_screen.clearRect(0,0,grid_size_x*block_size, grid_size_y*block_size);
    ctx_off_screen.fillStyle = '#CCCCCC';
    ctx_off_screen.strokeStyle = '#000000';

    for(let row = 0; row < grid_size_y; row++) {
        let y = row * block_size;
        for(let col = 0; col < grid_size_x; col++) {
            if(state[row][col] == 1) {
                let x = col * block_size;
                if(option.color_tenth && col % 10 == 0) {
                    ctx_off_screen.save();
                    ctx_off_screen.fillStyle = 'red';
                    ctx_off_screen.fillRect(x, y, block_size, block_size);
                    ctx_off_screen.restore();
                } else {
                    ctx_off_screen.fillRect(x, y, block_size, block_size);
                }
                ctx_off_screen.strokeRect(x, y, block_size, block_size);
            }
        }
    }
    if(option.border_guide) {
        ctx_off_screen.save();
        ctx_off_screen.beginPath();
        ctx_off_screen.strokeStyle = 'red';
        ctx_off_screen.moveTo(grid_size_x*block_size-3, 0);
        ctx_off_screen.lineTo(grid_size_x*block_size-3, grid_size_y*block_size);
        ctx_off_screen.stroke();
        ctx_off_screen.restore();
    }
    buffer_image = ctx_off_screen.getImageData(0,0, grid_size_x*block_size, grid_size_y*block_size);
}

window.addEventListener("load", windowLoad);