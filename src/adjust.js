'use strict';

/* Tags do not exist at the time of importing this script.
*/
let overlay, header_overlay, pdf_overlay, left_overlay, right_overlay;

chrome.runtime.onMessage.addListener(
  request => {
    let mode = Object.keys(request.message)[0];
    let value = request.message[mode];
    const references = {
      'initialization': create_overlay,
      'toggle': handle_toggle,
      'header_color': set_header_color,
      'header_contrast': set_header_contrast,
      'pdf_color': set_pdf_color,
      'pdf_contrast': set_pdf_contrast,
      'side_color': set_side_color,
      'side_contrast': set_side_contrast,
      'top_boundary': set_top_boundary,
      'left_boundary': set_left_boundary,
      'right_boundary': set_right_boundary
    };
    references[mode](value);
  }
);


/********************      Support functionality      ********************/

function make_rgb_color(value){
  let hex = parseInt(value, 10).toString(16);
  if (hex.length == 1) {
    hex = '0'.concat(hex); // Append zero, otherwise color will be invalid.
  }
  hex = hex.repeat(3); // Repeat 3 times for grey scaling.
  return '#' + hex;
}

function make_percent(value, mode='int'){
  if (mode == 'int'){
    return String(parseInt(value, 10)) + '%';
  }
  if (mode == 'float'){
    return String(parseFloat(value)) + '%';
  }
}

function make_contrast(value){
  /* Contrast values are converted to integers and concatenated with % sign, because users can set values in form n or n%.
  */
  return 'contrast(' + String(parseInt(value)) + '%)';
}


/************************      Handlers      **************************/

function create_overlay(parameters){
  /* Create initial div elements, which will be placed over pdf page.
  */
  // First check if overlay was already created.
  if (!overlay){

    let css_properties = {
      'position': 'fixed',
      'pointer-events': 'none',
      'mix-blend-mode': 'difference',
      'z-index': '1'
    };

    let header_color = parameters.header_color;
    let header_contrast = parameters.header_contrast;
    let pdf_color = parameters.pdf_color;
    let pdf_contrast = parameters.pdf_contrast;
    let side_color = parameters.side_color;
    let side_contrast = parameters.side_contrast;
    let top_boundary = parameters.top_boundary;
    let left_boundary = parameters.left_boundary;
    let right_boundary = parameters.right_boundary;
    let height_lower = String(100 - parseFloat(top_boundary)) + '%';

    /******   Now we can create <div>s   ******/

    overlay = document.createElement('div');
    overlay.id = 'overlay';
    document.body.appendChild(overlay);

    header_overlay = document.createElement('div');
    header_overlay.id = 'header_overlay';
    for (let key in css_properties) {
      header_overlay.style.setProperty(key, css_properties[key]);
    }
    header_overlay.style.setProperty('background-color', make_rgb_color(header_color));
    header_overlay.style.setProperty('filter', make_contrast(header_contrast));
    header_overlay.style.setProperty('top', '0');
    header_overlay.style.setProperty('left', '0');
    header_overlay.style.setProperty('width', '100%');
    header_overlay.style.setProperty('height', top_boundary);
    overlay.appendChild(header_overlay);

    left_overlay = document.createElement('div');
    left_overlay.id = 'left_overlay';
    for (let key in css_properties) {
      left_overlay.style.setProperty(key, css_properties[key]);
    }
    left_overlay.style.setProperty('background-color', make_rgb_color(side_color));
    left_overlay.style.setProperty('filter', make_contrast(side_contrast));
    left_overlay.style.setProperty('top', top_boundary);
    left_overlay.style.setProperty('left', '0%');
    left_overlay.style.setProperty('width', left_boundary);
    left_overlay.style.setProperty('height', height_lower);
    overlay.appendChild(left_overlay);

    pdf_overlay = document.createElement('div');
    pdf_overlay.id = 'pdf_overlay';
    for (let key in css_properties) {
      pdf_overlay.style.setProperty(key, css_properties[key]);
    }
    pdf_overlay.style.setProperty('background-color', make_rgb_color(pdf_color));
    pdf_overlay.style.setProperty('filter', make_contrast(pdf_contrast));
    pdf_overlay.style.setProperty('top', top_boundary);
    pdf_overlay.style.setProperty('left', left_boundary);
    pdf_overlay.style.setProperty('width', String(100 - parseFloat(left_boundary) - (100 - parseFloat(right_boundary))) + '%');
    pdf_overlay.style.setProperty('height', height_lower);
    overlay.appendChild(pdf_overlay);

    right_overlay = document.createElement('div');
    right_overlay.id = 'right_overlay';
    for (let key in css_properties) {
      right_overlay.style.setProperty(key, css_properties[key]);
    }
    right_overlay.style.setProperty('background-color', make_rgb_color(side_color));
    right_overlay.style.setProperty('filter', make_contrast(side_contrast));
    right_overlay.style.setProperty('top', top_boundary);
    right_overlay.style.setProperty('left', right_boundary);
    right_overlay.style.setProperty('width', String(100 - parseFloat(right_boundary)) + '%');
    right_overlay.style.setProperty('height', height_lower);
    overlay.appendChild(right_overlay);

    // Set to styles to make other handlers shorter and slightly more efficient.
    overlay = overlay.style;
    header_overlay = header_overlay.style;
    pdf_overlay = pdf_overlay.style;
    left_overlay = left_overlay.style;
    right_overlay = right_overlay.style;

    // Dont forget to show/hide the overlay depending on the toggle's state.
    if ('toggle' in parameters){
      if (parameters.toggle == 'on'){
        overlay.display = 'block';
      }
      else{
        overlay.display = 'none';
      }
    }
  }
}

function handle_toggle(value){
  if (value == 'off'){
    overlay.display = 'none';
  }
  else{
    overlay.display = 'block';
  }
}

function set_header_color(value){
  header_overlay.setProperty('background-color', make_rgb_color(value));
}

function set_header_contrast(value){
  header_overlay.setProperty('filter', make_contrast(value));
}

function set_pdf_color(value){
  pdf_overlay.setProperty('background-color', make_rgb_color(value));
}

function set_pdf_contrast(value){
  pdf_overlay.setProperty('filter', make_contrast(value));
}

function set_side_color(value){
  left_overlay.setProperty('background-color', make_rgb_color(value));
  right_overlay.setProperty('background-color', make_rgb_color(value));
}

function set_side_contrast(value){
  left_overlay.setProperty('filter', make_contrast(value));
  right_overlay.setProperty('filter', make_contrast(value));
}

function set_top_boundary(value){
  let upper_height = make_percent(value, 'float');
  let lower_height = make_percent(100 - parseFloat(value), 'float');

  header_overlay.setProperty('height', upper_height);
  left_overlay.setProperty('top', upper_height);
  left_overlay.setProperty('height', lower_height);
  pdf_overlay.setProperty('top', upper_height);
  pdf_overlay.setProperty('height', lower_height);
  right_overlay.setProperty('top', upper_height);
  right_overlay.setProperty('height', lower_height);
}

function set_left_boundary(value){
  let left = make_percent(value, 'float');
  let pdf_width = make_percent(100 - parseFloat(value) - parseFloat(right_overlay.getPropertyValue('width')), 'float');
  left_overlay.setProperty('width', left);
  pdf_overlay.setProperty('left', left);
  pdf_overlay.setProperty('width', pdf_width);
}

function set_right_boundary(value){
  let left = make_percent(value, 'float');
  let right_background_width = 100 - parseFloat(value);
  let pdf_width = make_percent(100 - right_background_width - parseFloat(left_overlay.getPropertyValue('width')), 'float');
  right_overlay.setProperty('left', left);
  right_overlay.setProperty('width', make_percent(right_background_width, 'float'));
  pdf_overlay.setProperty('width', pdf_width);
}
