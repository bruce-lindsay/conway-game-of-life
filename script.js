let grid_size_x;
let grid_size_y;
let ctx;
let block_size;
let start_delay = 2000;
let step_delay = 100;

function windowLoad() {
    if(document.URL.includes('table=table')) {
        start_table();
    } else {
        start_canvas();
    }
}

function start_canvas() {
    block_size = 10;
    let canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    let rect = document.body.getBoundingClientRect();
    grid_size_x = Math.floor(rect.width / block_size);
    grid_size_y = Math.floor(rect.height / block_size);
    canvas.width = grid_size_x * block_size;
    canvas.height = grid_size_y * block_size;
    let state = get_seed();
    draw_life(state);
    window.setTimeout(function() {
        window.setInterval(function() {
            state = get_next_left(state);
            state = drift(-1, state);
            draw_life(state);
        }, step_delay);
    }, start_delay);
}

function start_table() {
    grid_size_x = 100;
    grid_size_y = 50;
    block_size = 5;

    let table = document.getElementById('table');
    table.style.width = grid_size_x * block_size + 'px';
    let state = get_seed();
    table.innerHTML = get_life_html(state);
    window.setTimeout(function() {
        window.setInterval(function() {
            state = get_next_left(state);
            state = drift(-1, state);
            table.innerHTML = get_life_html(state);
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

function get_next_left(seed) {
    let a = [];
    let any = false;
    for(let row = 0; row < grid_size_y; row++) {
        for(let col = 0; col < grid_size_x; col++) {
            let check_col_left = wrap_around(col - 1, grid_size_x);
            let check_col_right = wrap_around(col + 1, grid_size_x);
            let check_row_up = wrap_around(row - 1, grid_size_y);
            let check_row_down = wrap_around(row + 1, grid_size_y);

            let = count_neighbors = seed[row][check_col_left]
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

function draw_life(state) {
    ctx.clearRect(0,0,grid_size_x*block_size, grid_size_y*block_size)
    ctx.fillStyle = '#CCCCCC';
    ctx.strokeStyle = '#000000';
    for(let row = 0; row < grid_size_y; row++) {
        let row_loc = row * block_size;
        for(let col = 0; col < grid_size_x; col++) {
            if(state[row][col] == 1) {
                ctx.fillRect(col * block_size, row_loc, block_size, block_size);
                ctx.strokeRect(col * block_size, row_loc, block_size, block_size);
            }
        }
    }
}

function get_life_html(state) {
    let a = state;
    let rows = [];
    for(let row = 0; row < a.length; row++) {
        rows.push('<tr>');
        for(let col = 0; col < a[row].length; col++) {
            if(a[row][col] == 1) {
                rows.push('<td class=filled></td>');
            } else {
                rows.push('<td class=empty></td>');
            }

        }
        rows.push('</tr>');
    }
    return rows.join('');
}

window.addEventListener("load", windowLoad);