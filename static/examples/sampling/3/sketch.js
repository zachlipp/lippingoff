var canvas_width = 800;
var canvas_height = 250;
var temperature_slider;
var data_selector;
var temperature;
var margin_left;
var margin_top;
var bar_scale;
var data;
var sample_text;
var index_to_highlight;
var k;
var p;

function setup() {
  margin_left = 50;
  margin_top = 80;
  margin_bottom = margin_top / 2;

  createCanvas(canvas_width, canvas_height);
  font = textFont();

  temperature_slider = createSlider(0.01, 3, value=1, steps=0.01);
  temperature_slider.position(x=canvas_width * 0.77, y=canvas_height * 0.2);

  data_selector = createRadio()
  data_selector.position(x = temperature_slider.x, y=canvas_height * 0.75)
  data_selector.option("car", "The car is... (flat)")
  data_selector.option("basketball", "The GOAT is... (peaked)")
  data_selector.style("color: #FFF")
  data_selector.style("font-family: sans-serif");
  data_selector.style("font-size: 14px");
  data_selector.style("text-shadow: 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000")
  // This causes the line break between options. How do I avoid magic numbers here?
  data_selector.size(145);
  data_selector.selected("basketball");
  data_selector.input( () => {
    temperature_slider.value(1);
    index_to_highlight=NaN;
    redraw()
    }
  );
  temperature_slider.input( () => {
    index_to_highlight=NaN
    redraw()}
  );
  data = generate_data(data_selector.value());


  sample_button = createButton("Generate the next token!");
  sample_button.position(x = data_selector.x, y=margin_top * 0.1);
  sample_button.mousePressed(display_sample);

  bar_scale = data_selector.x * 0.15;

  top_k_input = createInput();
  top_k_input.position(x = data_selector.x, y=data_selector.y - 100);
  top_k_input.size(40);
  top_k_input.input( () => {
    top_p_input.value(1);
    index_to_highlight=NaN

    redraw()}
  );

  top_p_input = createSlider(0.01, 1, value=1, steps=0.01);
  top_p_input.position(x=data_selector.x, y=data_selector.y - 50);
  top_p_input.input( () => {
    top_k_input.value("");
      index_to_highlight=NaN
    redraw()});

  //temperature_slider.hide();
  //top_k_input.hide();
  //top_p_input.hide();
}

function display_sample() {
  [index, sample] = decode(data.tokens, categorical_sample(probs));
  index_to_highlight = index;
  redraw();
  push();
  strokeWeight(3);
  stroke("black");
  textSize(16);
  fill("#FFF")
  text(`${sample}`, x=temperature_slider.x - 1.3 * margin_left, y=canvas_height * 0.61);
  noStroke();
  pop();
}

function generate_data(data_type) {
  if (data_type == "car") {
    return  {
      "tokens": ["red", "blue", "a ", "parked", "fast"],
      "logits": [5.15, 5.05, 5, 4.98, 4.95],
      "prompt": "The car is...",
    };
  } else if (data_type == "basketball") {
    return {
      "logits": [7, 6, 5, 1.2, 1.1],
      "tokens": ["Jalen", "LeBron", "Caitlyn", "Anthony", "Michael"],
      "prompt": "The greatest basketball player of all time is..."
  }
}
}

function find_k(data, temperature, p) {
  let logits = data.logits.slice();
  let probs = [];

  let sum = logits.map((a) => exp(a/temperature)).reduce((x, y) => x + y);

  for (let i=0; i<logits.length; i++) {
    let score = exp(logits[i] / temperature);
    probs.push(score / sum);
  }

  pmf = cumsum(probs);

  for (let i=0; i<pmf.length; i++) {
    if (pmf[i] >= p) {
      return [pmf, i + 1]
    }
  }
}


function draw_bars(data, temperature, margin_left, margin_top, bar_scale, highlight_index) {
  push();
  translate(margin_left * 2, margin_top);
  textSize(18);
  // TODO Should these live here or in draw
  // TODO Not everything should be white text
  // TODO Configure text in one place
  strokeWeight(3);
  stroke("black");
  text("Scores", -5, -10)
  text("Probs", margin_left * 1.2, -10)
  text("Decoder", temperature_slider.x - margin_left * 4.5,  -10)
  // TODO: Magic number -100
  text("Tokens", -margin_left * 1.5, -10)
  let prompt = data.prompt;
  text("Prompt: " + prompt, -margin_left * 1.6, -50)
  textSize(12);
  let logits = data.logits;
  let offset = 1
  noStroke();

  let h = canvas_height - margin_top - margin_bottom;
  bar_width =  (h / logits.length) * 0.8;
  bar_margin = (h / logits.length) * 0.2;

  let norm = logits.reduce((a, b) => a + b);
  true_probs = softmax(data, temperature);

  for(let i=0; i<logits.length; i++) {
    push();
    if (i == highlight_index) {
      fill("orange");
    } else {
      fill('steelblue');
    }
    noStroke();
    translate(0, i * (bar_width + bar_margin));
    rect(margin_left, 0, true_probs[i] * bar_scale, bar_width);
    rect(-5, 0, logits[i]/norm * margin_left * 2, bar_width)
    fill('#FFF');
    textSize(14)
    strokeWeight(3);
    stroke("black");
    text(data.tokens[i], -margin_left * 1.5, bar_width/2 + 5)
    noStroke();
    fill('#FFF');
    textSize(13)
    text(true_probs[i].toPrecision(2), margin_left + 5, bar_width/2 + 5);
    text(logits[i], 0, bar_width/2 + 5)
    pop();
  }
  pop();
}

function softmax(data, temperature, k) {
  let logits = data.logits.slice();
  let probs = [];
  if (k) {
    for (let i=0; i<logits.length; i++) {
      if (i >= k) {
        logits[i] = 0
      }
    }
  }
  let sum = 0;
  for (let i=0; i<logits.length; i++) {
    let score = exp(logits[i] / temperature);
    if (k > 0 && i >= k) {
      score = 0;
    }
    sum += score;
  }
  for (let i=0; i<logits.length; i++) {
    let score = exp(logits[i] / temperature);
    if (k > 0 && i >= k) {
      score = 0;
    }
    probs.push(score / sum);
  }
  return probs
}


// https://stackoverflow.com/a/55261098
function cumsum(data) {
  return data.map((sum = 0, n => sum += n));
}

function display_temperature_text(data_type) {
  if (data_type == "homogenous") {
    text("If your logits are very similar, your softmax outputs will also be similar. \nConsider t∈(0, 1) to concentrate the distribution (decreasing sample variance).", x=margin_left, y = temperature_slider.y)
  } else if (data_type == "heterogenous") {
    text("If your logits are varied, your softmax outputs will have a defined peak, or bias.\nConsider t>1 to spread out the distribution (increasing the sample variance).", x=margin_left, y = temperature_slider.y)
  }
}

function categorical_sample(weights) {
    for (var i = 1; i < weights.length; i++)
        weights[i] += weights[i - 1];

    var random = Math.random()

    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;

    return i
}

function decode(tokens, i) {
  return [i, tokens[i]];
}

function find_horizontal_position(k) {
  return k * (bar_width + bar_margin) - bar_margin / 2;
}

function draw_top_k(k, probs, highlight_index) {
  push();
  let y = find_horizontal_position(k);
  translate(margin_left * 2, margin_top);
  strokeWeight(3);
  stroke("black");
  textSize(18);
  text("Rescaled", bar_scale + margin_left, -10);
  line(-1.5 * margin_left, y, margin_left + 2 * bar_scale, y)
  if (k < probs.length) {
    textSize(16);
    text("Everything below\nthis line is set to 0", margin_left + 1.5  * bar_scale, y + 30);
  }

  let h = canvas_height - margin_bottom - margin_top;
  bar_width =  (h / probs.length) * 0.8;
  bar_margin = (h / probs.length) * 0.2;

  let norm = probs.reduce((a, b) => a + b);

  for(let i=0; i<probs.length; i++) {
    push();
    if (i == highlight_index) {
      fill("orange");
    } else {
      fill('steelblue');
    }
    noStroke();
    translate(bar_scale + 10, i * (bar_width + bar_margin));
    rect(margin_left, 0, probs[i] * bar_scale, bar_width);
    fill('#FFF');
    textSize(13)
    text(probs[i].toPrecision(2), margin_left + 5, bar_width/2 + 5);
    pop();
  }

  pop();
}


function draw_top_p(p, data, temperature, highlight_index) {
  let logits = data.logits;
  let [pmf, k] = find_k(data, temperature, p);
  // TODO: This sets probs globally and this is needed
  probs = softmax(data, temperature, k);
  push();
  let y = find_horizontal_position(k);
  textSize(18);
  translate(margin_left * 2, margin_top);
  strokeWeight(3);
  stroke("black");
  text("Sum", margin_left + bar_scale + 10, -10);
  text("Rescaled", margin_left + 2 * bar_scale + 10, -10);
  line(-1.5 * margin_left, y, margin_left + 3 * bar_scale, y);

  if (k < logits.length) {
    textSize(16)
    text("Everything below\nthis line is set to 0", margin_left + 2.5 * bar_scale, y + 30);
  }


  let h = canvas_height - margin_top - margin_bottom;
  bar_width =  (h / pmf.length) * 0.8;
  bar_margin = (h / pmf.length) * 0.2;

  let norm = pmf.reduce((a, b) => a + b);

  for(let i=0; i<probs.length; i++) {
    push();
    if (i == highlight_index) {
      fill("orange");
    } else {
      fill('steelblue');
    }
    noStroke();
    translate(bar_scale + 10, i * (bar_width + bar_margin));
    rect(margin_left, 0, pmf[i] * bar_scale, bar_width);
    rect(margin_left + bar_scale + 10, 0, probs[i] * bar_scale, bar_width)
    fill('#FFF');
    textSize(13)
    text(pmf[i].toPrecision(2), margin_left + 5, bar_width/2 + 5);
    text(probs[i].toPrecision(2), margin_left + 5 + bar_scale + 10, bar_width/2 + 5);
    pop();
  }
  // p line
  drawingContext.setLineDash([5, 15])
  line(bar_scale + margin_left + 10 + p * bar_scale, 0, bar_scale + margin_left + 10 + p * bar_scale, h - bar_margin);
  // TODO: Why does stroke here look weird?
  noStroke();
  text(`p=${p}`, bar_scale + margin_left + 10 + p * bar_scale, h + bar_margin)

  pop();
}

function draw () {
  push();
  background("#e0be85");
  temperature = temperature_slider.value();
  fill('#FFF');
  textSize(15);
  stroke("black")
  strokeWeight(2);
  text("Prompt", x=data_selector.x, y=data_selector.y - 5)
  text(`Temperature (t): ${temperature}`, x=temperature_slider.x, y=temperature_slider.y - 5);
  text("Top K", x=top_k_input.x, y=top_k_input.y - 5);
  text("Top P", x=top_p_input.x, y=top_p_input.y - 5);
  k = top_k_input.value();
  p = top_p_input.value();
  if (k!="") {
    k = Number(k)
  } else {
    k = NaN
  }
  if (p!="") {
    p = Number(p)
  } else {
    p = NaN
  }
  data = generate_data(data_type=data_selector.value());

  if (k >= 1 && k <= data.logits.length) {
    probs = softmax(data, temperature, k)
    draw_top_k(k, probs, index_to_highlight);
  } else if (p >= 0 && p < 1) {
    draw_top_p(p, data, temperature, index_to_highlight);
  } else {
    probs = softmax(data, temperature);
  }

  draw_bars(data, temperature,
            margin_left,
            margin_top, bar_scale, index_to_highlight);
  pop();
  textSize(150);
  text("}", x=temperature_slider.x - 2.5 * margin_left, y=canvas_height * 0.75)
  noLoop();
}
