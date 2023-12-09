'use strict';

/* The main html tags, which can be controlled by users.
*/
let toggle = document.getElementById('toggle');
let header_color = document.getElementById('header_color');
let header_contrast = document.getElementById('header_contrast');
let pdf_color = document.getElementById('pdf_color');
let pdf_contrast = document.getElementById('pdf_contrast');
let side_color = document.getElementById('side_color');
let side_contrast = document.getElementById('side_contrast');
let top_boundary = document.getElementById('top_boundary');
let left_boundary = document.getElementById('left_boundary');
let right_boundary = document.getElementById('right_boundary');

/* This statement is basically the "core"/"main func" of this script.
It is executed every time the popup is opened and handles the main execution logic.
*/
chrome.tabs.query({currentWindow: true, active: true}).
then(
  query_result => {
    /* Check result's structure first. Just in case (eg browser incompatibility, future changes etc)
    */
    if (0 in query_result && 'id' in query_result[0] && 'url' in query_result[0]){
      let tab_id = query_result[0].id;
      /*
      Try to extract tab's parameters from storage.*/
      chrome.storage.session.get([String(tab_id)]).
      then(
        tab_settings => {
          /*
          The tab was already examined.*/
          if (tab_id in tab_settings){
            if (tab_settings[tab_id]['pdf'] == true){
              restore_tab_state(tab_id);
              add_listeners(tab_id);
            }
            else {
              hide_main_popup_content();
              show_message_for_non_pdf();
            }
          }
          // Otherwise check URL string and set initial tab's state.
          else {
            if (query_result[0].url.match(/^.+\.pdf$/i)){
              initialize_tab_state(tab_id);
              add_listeners(tab_id);
            }
            else{
              hide_main_popup_content();
              show_message_for_non_pdf();
              chrome.storage.session.set({ [String(tab_id)]: {'pdf': false} }).
              catch(
                error => {
                  display_error_message('set_storage_fail');
                  console.log(`Querying tab: Failed to store tab's settings. ${error}`);
                }
              );
            }
          }
        },
        error => {
          display_error_message('get_storage_fail');
          console.log(`Querying tab: Failed to get tab's settings. ${error}`);
        }
      );
    }
    // Shall not happen, but if does, then display error message.
    else{
      display_error_message('major_fail');
    }
  },
  error => {
    display_error_message('major_fail');
    console.log(`Querying tab: Failed to query tab. ${error}`);
  }
);


/***************   Logical components   ***************/

function initialize_tab_state(tab_id){
  /*
  First set defaults on popup's html tags.*/
  header_color.value = DEFAULT.header_color;
  header_contrast.value = DEFAULT.header_contrast;
  pdf_color.value = DEFAULT.pdf_color;
  pdf_contrast.value = DEFAULT.pdf_contrast;
  side_color.value = DEFAULT.side_color;
  side_contrast.value = DEFAULT.side_contrast;
  top_boundary.value = DEFAULT.top_boundary;
  left_boundary.value = DEFAULT.left_boundary;
  right_boundary.value = DEFAULT.right_boundary;
  /*
  Fill up the storage with defaults.*/
  chrome.storage.session.set({
    [String(tab_id)]: {
      'pdf': true,
      'toggle': 'on',
      'header_color': header_color.value,
      'header_contrast': header_contrast.value,
      'pdf_color': pdf_color.value,
      'pdf_contrast': pdf_contrast.value,
      'side_color': side_color.value,
      'side_contrast': side_contrast.value,
      'top_boundary': top_boundary.value,
      'left_boundary': left_boundary.value,
      'right_boundary': right_boundary.value
    }
  }).
  then(
    /**/
    () => {
      send_message_to_content_script(tab_id, 'initialization', DEFAULT);
    },
    error => {
      display_error_message('set_storage_fail');
      console.log(`Tab's initialization: Failed to store tab's settings. ${error}`);
    }
  );
}


function restore_tab_state(tab_id){
  chrome.storage.session.get([String(tab_id)]).
  then(
    parameters => {
      parameters = parameters[tab_id];
      if (parameters.toggle == 'on'){
        toggle.checked = false;
      }
      else{
        toggle.checked = true;
      }
      header_color.value = parameters.header_color;
      header_contrast.value = parameters.header_contrast;
      pdf_color.value = parameters.pdf_color;
      pdf_contrast.value = parameters.pdf_contrast;
      side_color.value = parameters.side_color;
      side_contrast.value = parameters.side_contrast;
      top_boundary.value = parameters.top_boundary;
      left_boundary.value = parameters.left_boundary;
      right_boundary.value = parameters.right_boundary;
      send_message_to_content_script(tab_id, 'initialization', parameters);
    },
    error => {
      display_error_message('get_storage_fail');
      console.log(`Tab's restoration: Failed to get tab's settings. ${error}`);
    }
  );
}


function add_listeners(tab_id){

  function store_parameters(tab_id, parameters, event){
    chrome.storage.session.set({ [tab_id]: parameters }).
    catch(
      error => {
        display_error_message('set_storage_fail');
        console.log(`${event}: Failed to store parameters. ${error}`);
      }
    );
  }

  function change_parameters(tab_id, key, value, event){
    chrome.storage.session.get([String(tab_id)]).
    then(
      parameters => {
        parameters = parameters[tab_id];
        parameters[key] = value;
        store_parameters(tab_id, parameters, event);
      },
      error => {
        display_error_message('get_storage_fail');
        console.log(`${event}: Failed to get tab's settings. ${error}`);
      }
    );
  }

  toggle.addEventListener('click', () => {
    chrome.storage.session.get([String(tab_id)]).
    then(
      parameters => {
        parameters = parameters[tab_id];
        if (parameters.toggle == 'off'){
          parameters.toggle = 'on';
          store_parameters(tab_id, parameters, 'Toggle-on');
          send_message_to_content_script(tab_id, 'toggle', 'on');
        }
        else{
          parameters.toggle = 'off';
          store_parameters(tab_id, parameters, 'Toggle-off');
          send_message_to_content_script(tab_id, 'toggle', 'off');
        }
      },
      error => {
        display_error_message('get_storage_fail');
        console.log(`Toggle: Failed to get tab's settings. ${error}`);
      }
    );
  });

  header_color.addEventListener('change', () => {
    change_parameters(tab_id, 'header_color', header_color.value, 'Header color');
    send_message_to_content_script(tab_id, 'header_color', header_color.value);
  });

  header_contrast.addEventListener('change', () => {
    change_parameters(tab_id, 'header_contrast', header_contrast.value, 'Header contrast');
    send_message_to_content_script(tab_id, 'header_contrast', header_contrast.value);
  });

  pdf_color.addEventListener('change', () => {
    change_parameters(tab_id, 'pdf_color', pdf_color.value, 'PDF color');
    send_message_to_content_script(tab_id, 'pdf_color', pdf_color.value);
  });

  pdf_contrast.addEventListener('change', () => {
    change_parameters(tab_id, 'pdf_contrast', pdf_contrast.value, 'PDF contrast');
    send_message_to_content_script(tab_id, 'pdf_contrast', pdf_contrast.value);
  });

  side_color.addEventListener('change', () => {
    change_parameters(tab_id, 'side_color', side_color.value, 'Side color');
    send_message_to_content_script(tab_id, 'side_color', side_color.value);
  });

  side_contrast.addEventListener('change', () => {
    change_parameters(tab_id, 'side_contrast', side_contrast.value, 'Side contrast');
    send_message_to_content_script(tab_id, 'side_contrast', side_contrast.value);
  });

  top_boundary.addEventListener('change', () => {
    change_parameters(tab_id, 'top_boundary', top_boundary.value, 'Top boundary');
    send_message_to_content_script(tab_id, 'top_boundary', top_boundary.value);
  });

  left_boundary.addEventListener('change', () => {
    change_parameters(tab_id, 'left_boundary', left_boundary.value, 'Left boundary');
    send_message_to_content_script(tab_id, 'left_boundary', left_boundary.value);
  });

  right_boundary.addEventListener('change', () => {
    change_parameters(tab_id, 'right_boundary', right_boundary.value, 'Right boundary');
    send_message_to_content_script(tab_id, 'right_boundary', right_boundary.value);
  });
}


/*********************      Support functionality      *********************/

function hide_main_popup_content(){
  document.getElementById('toggle_container').style.display = 'none';
  document.getElementById('sliders_container').style.display = 'none';
  document.getElementById('boundary_management_container').style.display = 'none';
}

function show_message_for_non_pdf(){
  document.getElementById('message_for_non_pdf').style.display = 'block';
}

function display_error_message(type){
  if (type == 'major_fail'){
    document.getElementById('tab_error').innerHTML = 'Failed to query the tab.';
  }
  if (type == 'get_storage_fail'){
    document.getElementById('tab_error').innerHTML = 'Failed to get data from storage.';
  }
  if (type == 'set_storage_fail'){
    document.getElementById('tab_error').innerHTML = 'Failed to store data in storage.';
  }
  if (type == 'script_execution_fail'){
    document.getElementById('tab_error').innerHTML = 'Failed to execute script.';
  }
  if (type == 'message_connection_fail'){
    document.getElementById('tab_error').innerHTML = 'Failed to establish connection between popup and content script.';
  }
  document.getElementById('tab_error').innerHTML += '<br><br>Possible ways to fix the issue:<br>' +
  '1) Soft reloading - ctrl + R<br>2) Hard reloading - ctrl + f5<br>3) Wait for the page to load before using extension.' +
  '<br><br>If nothing helps you might want to examine extension\'s log or create an issue in the upstream repository.';
  hide_main_popup_content();
  document.getElementById('tab_error').style.display = 'block';
}

function send_message_to_content_script(tab_id, event, value){
  chrome.tabs.sendMessage(tab_id, {message: {[event]: value}}).
  catch(
    error => {
      display_error_message('message_connection_fail');
      console.log(`${event}: Failed to connect to the content script. ${error}`);
    }
  );
}
