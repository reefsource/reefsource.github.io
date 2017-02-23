const sessionId = '58a3b61ddc313a776756bb5c';

const urlAPI = 'api/acquisitions';

const headersAPI = {'Authorization': 'scitran-user test'}
/**
 * Checks that an element has a non-empty `name` and `value` property.
 * @param  {Element} element  the element to check
 * @return {Bool}             true if the element is an input, false if not
 */
const isValidElement = element => {
  return element.name && element.value;
};

/**
 * Checks if an element’s value can be saved (e.g. not an unselected checkbox).
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the value should be added, false if not
 */
const isValidValue = element => {
  return (!['checkbox', 'radio'].includes(element.type) || element.checked);
};

/**
 * Checks if an input is a checkbox, because checkboxes allow multiple values.
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the element is a checkbox, false if not
 */
const isCheckbox = element => element.type === 'checkbox';

/**
 * Checks if an input is a `select` with the `multiple` attribute.
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the element is a multiselect, false if not
 */
const isMultiSelect = element => element.options && element.multiple;

/**
 * Retrieves the selected options from a multi-select as an array.
 * @param  {HTMLOptionsCollection} options  the options for the select
 * @return {Array}                          an array of selected option values
 */
const getSelectValues = options => [].reduce.call(options, (values, option) => {
  return option.selected ? values.concat(option.value) : values;
}, []);

/**
 * A more verbose implementation of `formToJSON()` to explain how it works.
 *
 * NOTE: This function is unused, and is only here for the purpose of explaining how
 * reducing form elements works.
 *
 * @param  {HTMLFormControlsCollection} elements  the form elements
 * @return {Object}                               form data as an object literal
 */
const formToJSON_deconstructed = elements => {

  // This is the function that is called on each element of the array.
  const reducerFunction = (data, element) => {

    // Add the current field to the object.
    data[element.name] = element.value;

    // For the demo only: show each step in the reducer’s progress.
    console.log(JSON.stringify(data));

    return data;
  };

  // This is used as the initial value of `data` in `reducerFunction()`.
  const reducerInitialValue = {};

  // To help visualize what happens, log the inital value, which we know is `{}`.
  console.log('Initial `data` value:', JSON.stringify(reducerInitialValue));

  // Now we reduce by `call`-ing `Array.prototype.reduce()` on `elements`.
  const formData = [].reduce.call(elements, reducerFunction, reducerInitialValue);

  // The result is then returned for use elsewhere.
  return formData;
};

/**
 * Retrieves input data from a form and returns it as a JSON object.
 * @param  {HTMLFormControlsCollection} elements  the form elements
 * @return {Object}                               form data as an object literal
 */
const formToJSON = elements => [].reduce.call(elements, (data, element) => {

  // Make sure the element has the required properties and should be added.
  if (isValidElement(element) && isValidValue(element)) {

    /*
     * Some fields allow for more than one value, so we need to check if this
     * is one of those fields and, if so, store the values as an array.
     */
    if (isCheckbox(element)) {
      data[element.name] = (data[element.name] || []).concat(element.value);
    } else if (isMultiSelect(element)) {
      data[element.name] = getSelectValues(element);
    } else {
      data[element.name] = element.value;
    }
  }

  return data;
}, {});

/**
 * A handler function to prevent default submission and run our custom script.
 * @param  {Event} event  the submit event triggered by the user
 * @return {void}
 */
const handleFormSubmit = event => {

  // Stop the form from submitting since we’re handling that with AJAX.
  event.preventDefault();

  // Call our function to get the form data.
  const data = formToJSON(form.elements);

  //alert(JSON.stringify(data, null, "  "));
  console.log(data);

  var files = form.elements.image_upload.files;

  if (files.length != 1) {
    console.error('There should be exactly one file to upload.');
  }

  // creating the acquisition that will contain the file

  var payload = {
    label: files[0].name.split('.')[0],
    session: sessionId,
    info: data
  };
  var req = {
    type: 'POST',
    url: urlAPI,
    data: JSON.stringify(payload),
    headers: headersAPI
  };
  $.ajax(req).then((response) => {
    console.log(response);
    var payload = new FormData();
    payload.append('file', files[0]);
    var metadata = {'type': 'gopro'};
    var blob = new Blob([JSON.stringify(metadata, null, 2)], {type : 'application/json'});
    payload.append('metadata', blob, '');
    var req = {
      url: urlAPI + '/' + response._id + '/files',
      data: payload,
      headers: headersAPI,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function () {
        console.log('upload succesfull');
      },
      error: () => {console.error('You made a mistake. Bad!');}
    };
    $.ajax(req);
  });



  modal.style.display = "none";
  upload_handler.style.display = "block";
  notification.innerHTML = "Now we only accpet <strong>1 image in a single upload.</strong> Sorry about the inconvenience.</p>"
  // Demo only: print the form data onscreen as a formatted JSON object.
  // const dataContainer = document.getElementsByClassName('results__display')[0];

  // Use `JSON.stringify()` to make the output valid, human-readable JSON.
  // dataContainer.textContent = JSON.stringify(data, null, "  ");

  // ...this is where we’d actually do something with the form data...
};

/*
 * This is where things actually get started. We find the form element using
 * its class name, then attach the `handleFormSubmit()` function to the
 * `submit` event.
 */
const form = document.getElementsByClassName('contact-form')[0];
form.addEventListener('submit', handleFormSubmit);
var modal = document.getElementById('upload-btn');
var upload_handler = document.getElementById("disappear");
var notification = document.getElementById("notification");
  // When the user clicks anywhere outside of the modal, close it
