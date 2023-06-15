import { setState, getState } from "./state-manager.js";
import { funcs, defineFunc } from "./func-manager.js";
import * as appFunctions from "../js/main.js";

const findTags = /<\/(\w+)>[^<]*?<(\w+)/g;
const biggerSmallerRegex = />(.*?)</g;

const TEXT_ELEMENT = "TEXT_ELEMENT";

/*
  @var json object
  Virtual dom tree before seting new state
*/
let virtualDom;

/*
  @var json object
  Virtual dom tree after seting new state
*/
let newVirtualDom;
/*
  @var func 
  Function with App template
 */
let appFunction;

/**
 * Renders template from appFunc inside container
 * @param {function} appFunc
 * @param {HTMLElement} container
 * @returns
 */
const render = (appFunc, container) => {
  const template = createTemplate(appFunc);
  const MFWrappingErrors = mfWrappingErrors(template);

  if (MFWrappingErrors.length > 0) {
    container.innerHTML = generateMFErrorMessage(MFWrappingErrors);
    return;
  }

  virtualDom = Converter.htmlToJson(template);
  renderDom(virtualDom, container);
};

/**
 * Renders element inside container
 * @param {HtmlElement} element
 * @param {HtmlElement} container
 */
const renderDom = (element, container) => {
  const dom =
    element.type == TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = (key) => key !== "children";
  const isData = (key) => key.startsWith("data-");

  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      if (name == "class") {
        dom.className = element.props[name];
      } else if (isData(name)) {
        dom.setAttribute(name, element.props[name]);
      } else {
        dom[name] = element.props[name];
      }
    });

  element.props.children.forEach((child) => renderDom(child, dom));

  if (element.props.id == "last") {
    Array.from(dom.childNodes).forEach((child, i) => {
      container.appendChild(child);
    });
  } else {
    container.appendChild(dom);
  }
};

/**
 * Rerenders differences from old and new virtual DOM
 * @param {array} differences
 */
function updateDOM(differences) {
  // Iterate over the parent IDs
  differences.forEach((item) => {
    //Remove from DOM (case for  html-tags)
    if (item.newValue == null && typeof item.oldValue == "object") {
      // Retrieve the corresponding element in the real DOM
      const container = document.querySelector(
        `[data-mf="${item.parentDataMf}"]`
      );

      // Check if the element exists in the real DOM
      if (container) {
        //if it was tag or tags
        if (item.oldValue.props && item.oldValue.props["data-id"] !== null) {
          const elementToRemove = document.querySelector(
            `[data-id="${item.oldValue.props["data-id"]}"]`
          );

          if (elementToRemove) {
            container.removeChild(elementToRemove);
          }
        }
      }

      //Apply changes to the current element
    } else if (item.dataMf !== null) {
      const domElement = document.querySelector(`[data-mf="${item.dataMf}"]`);

      if (domElement) {
        if (item.property == "class") {
          domElement.className = item.newValue;

          //for checked case
        } else if (item.property == null) {
          domElement[item.newValue] = item.newValue;
        } else {
          domElement[item.property] = item.newValue;
        }
      }

      //Apply changes to the parent element
    } else {
      // Retrieve the corresponding element in the real DOM
      const container = document.querySelector(
        `[data-mf="${item.parentDataMf}"]`
      );

      // Check if the element exists in the real DOM
      if (container) {
        if (item.isReplace) {
          container.innerHTML = "";
        }

        if (item.property == "nodeValue") {
          container.innerHTML = item.newValue;
        } else {
          renderDom(item.newValue, container);
        }
      }
    }
  });
}

/**
 * Creates element of virtual DOM
 * @param {string} type
 * @param {object} props
 * @param  {...any} children
 * @returns {object}
 */
const createElement = (type, props, ...children) => {
  const element = {
    type,
    props: {
      ...props,
      ...(props.style && { style: props.style }),
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };

  return element;
};

/**
 * Creates text element of virtual DOM
 * @param {string} text
 * @returns {object}
 */
const createTextElement = (text) => {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
};

//Compares the old DOM to the new DOM. Returns the differences
function compareDOM(oldDom, newDom) {
  const diffResult = diffJSON(oldDom, newDom);

  if (Object.keys(diffResult).length === 0) {
    return {
      identical: true,
      differences: [],
    };
  }

  return {
    identical: false,
    differences: diffResult,
  };
}
// Compares the old DOM to the new DOM and returns the differences
function diffJSON(json1, json2) {
  const diffResult = [];

  // Pushing the differences to the diffResult array
  function addToDiffResult(key, oldValue, newValue, dataMf, parentDataMf, isReplace = false) {
    diffResult.push({
      property: key,
      oldValue: oldValue,
      newValue: newValue ? newValue : null,
      dataMf: dataMf ? dataMf : null,
      parentDataMf: parentDataMf,
      isReplace: isReplace,
    });
  }

  // Compares keys in two objects
  function compareObjects(obj1, obj2, path, parentDataMf) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    keys1.forEach((key) => {
      if (key === "children") {
        //if both keys are arrays, compare them
        if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
          compareArrays(obj1[key], obj2[key], path, obj2["data-mf"]);
        }
      } else if (!keys2.includes(key) || obj1[key] !== obj2[key]) {
        //if both keys are objects, compare them
        if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
          compareObjects(obj1[key], obj2[key], `${path}.${key}`, parentDataMf);
        } else if ( typeof obj1[key] !== "function" || typeof obj2[key] !== "function" ) {
          addToDiffResult(key, obj1[key], obj2[key], obj2["data-mf"], parentDataMf);
        }        
      }
    });

    keys2.forEach((key) => {
      //Add the new keys to the diffResult array
      if (!keys1.includes(key)) {
        addToDiffResult(null, obj1[key], obj2[key], obj2["data-mf"], parentDataMf);
      }
    });
  }

  // Compares two arrays, if differences found, pushes them to the diffResult array
  function compareArrays(arr1, arr2, path, parentDataMf) {
    // If the length of the old array is greater than the new array, remove the old elements that are not in the new array
    if (arr1.length > arr2.length) {
      for (let i = arr1.length-1; i >= 0; i--) {
        if (arr2[i] == null || arr1[i].props["data-id"] !== arr2[i].props["data-id"]) {
          //remove from DOM
          addToDiffResult(i, arr1[i], null, arr1[i]["data-mf"], parentDataMf);
          arr1.splice(i, 1);
        }
      }
    }

    const length = Math.max(arr1.length, arr2.length);
    for (let i = 0; i < length; i++) {
      const obj1 = arr1[i];
      const obj2 = arr2[i];
      //if both exist and both are objects, compare them. Otherwise, push the difference to the diffResult array
      if (obj1 && obj2 && typeof obj1 === "object" && typeof obj2 === "object") {
        compareObjects(obj1, obj2, `${path}[${i}]`, parentDataMf);
      } else if (obj1 !== obj2) {
        addToDiffResult(i, obj1, obj2, obj2 ? obj2["data-mf"] : null, parentDataMf, arr2.length == 1);
      }
    }
  }

  compareObjects(json1, json2, "root", "0");

  return diffResult;
}

/**
 * Converts string with html tags to json-object (virtual DOM)
 * @param {string} html
 * @returns {object}
 */
function htmlToJson(html) {
  html = trimHtml(html);

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const isEvent = (key) => key.startsWith("on");

  function parseNode(node, parent, level, levelOrder) {
    let obj = {};
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) {
        obj = createTextElement(node.textContent);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      let attributes = {};

      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        attributes[attr.name] = attr.value;

        if (isEvent(attr.name)) {
          if (funcs.has(attr.value)) {
            attributes[attr.name] = funcs.get(attr.value);
          } else {
            displayErrorMessage(attr.name + " is not a valid event");
          }
        }
      }

      let children = [];
      let currentDataMf;

      if (attributes["data-id"]) {
        currentDataMf = parent + "." + level + "." + attributes["data-id"];
      } else {
        currentDataMf = parent + "." + level + "." + levelOrder;
      }

      for (let i = 0; i < node.childNodes.length; i++) {
        const childNode = node.childNodes[i];

        children.push(parseNode(childNode, currentDataMf, level + 1, i));
      }

      attributes["data-mf"] = currentDataMf;

      obj = createElement(node.tagName.toLowerCase(), attributes, ...children);
    }

    return obj;
  }

  return parseNode(doc.body.firstChild, 0, 0, 0);
}

const Converter = {
  htmlToJson,
};

// This code defines the createTemplate function, which takes in an appFunction as a parameter.
// If the appFunction is not a function, then it displays an error message and returns undefined.
// Otherwise, it defines the appFunction as the current app, and then returns the template created by the appFunction.
const createTemplate = (appFunction) => {
  if (typeof appFunction !== "function") {
    displayErrorMessage(appFunction + " is not a valid function");
    return;
  }
  defineApp(appFunction);
  const template = appFunction();
  document.getElementById("root").innerHTML = "";
  return template;
};

const defineApp = (func) => {
  appFunction = func;
};

// This function updates the state of the application
// and re-renders the application with the new state.
// The function accepts a new state as a parameter,
// and then calls the appFunction with the new state.
// The appFunction returns a template that is converted
// to a virtual DOM. The virtual DOM is compared to the
// previous virtual DOM to determine the differences.
// The differences are used to update the actual DOM.
// The previous virtual DOM is updated to the new virtual DOM.
const updateState = (newState) => {
  setState(newState);

  const template = appFunction(getState());
  newVirtualDom = Converter.htmlToJson(template);

  var diff = compareDOM(virtualDom, newVirtualDom);

  updateDOM(diff.differences);

  virtualDom = newVirtualDom;
};

// Remove all unnessesary input or characters from the html string
function trimHtml(html) {
  html = html.replace(/[\n\t]/g, "");
  html = html.replace(/<MF>/, "<div id='last'>");
  html = html.replace(/<\/MF>(?!.*<\/MF>)/m, "</div>");
  html = html.replace(/<MF>/g, "");
  html = html.replace(/<\/MF>/g, "");
  html = html.replace(biggerSmallerRegex, (match, content) => {
    const trimmed = content.replace(/ /g, "");
    if (trimmed.length === 0) {
      return `>${trimmed}<`;
    }
    return match;
  });
  //find closing and opening tags and remove inner text between them
  html = html.replace(findTags, "</$1><$2");
  return html;
}

function mfWrappingErrors(html) {
  if (!html) {
    errors = errors.concat("You need to export at least one valid function");
    return errors;
  }

  let didntMatch = 0;
  let errors = [];

  const regex = /(?<=`[\s\n]*<MF>)(.*?)(?=<\/MF>\s*`)/s;

  Object.entries(appFunctions).forEach(([name, func]) => {
    const funcString = func.toString();
    const match = funcString.match(regex);

    if (!match) {
      didntMatch++;
      errors = errors.concat(name);
    }
  });

  if (didntMatch !== 0) {
    return errors;
  }

  const parser = new DOMParser();
  const trimmedHtml = html.trim();
  const doc = parser.parseFromString(trimmedHtml, "text/html");
  const firstElement = Array.from(doc.body.childNodes).find(
    (node) => node.nodeType === 1
  );
  const allMFElements = doc.body.getElementsByTagName("MF");

  if (allMFElements.length === 0 || firstElement.tagName !== "MF") {
    errors = errors.concat(
      "The first element in the HTML is not wrapped with `<MF>` or there are no `<MF>` elements."
    );
    return errors;
  }

  let wrappedCount = 0;

  Array.from(allMFElements).forEach((element) => {
    if (
      Array.from(allMFElements).some((innerMFElement) =>
        innerMFElement.contains(element)
      )
    ) {
      wrappedCount++;
    }
  });

  if (wrappedCount !== allMFElements.length) {
    errors = errors.concat("Some elements are not wrapped with `<MF>` tags.");
  }

  return errors;
}

function generateMFErrorMessage(errors) {
  const style = `
    font-size: 16px;
    color: red;
    line-height: 1.5;
    white-space: pre-wrap;
    background-color: #ffffcc;
    padding: 20px;
    border: 2px solid red;
    border-radius: 5px;
  `;

  return `
    <div style="${style}">
      OOPS!
      The template in bomberman_app/js/main.js is not formatted correctly.
      You don't have the &lt;MF&gt; wrapper for all your html elements.
      
    ${
      errors.length > 0
        ? `Check your function(s): <b>${errors.join(", ")}</b>`
        : null
    }

      EX:
      const template = \`
      &lt;MF&gt;
        &lt;div id='main-wrapper'&gt;
          &lt;div id='main-wrappers-child'&gt;
            This works!
          &lt;/div&gt;
        &lt;/div&gt
      &lt;/MF&gt;
      \`
    </div>
  `;
}

function generateErrorMessage(errors) {
  const style = `
    font-size: 16px;
    color: red;
    line-height: 1.5;
    white-space: pre-wrap;
    background-color: #ffffcc;
    padding: 20px;
    border: 2px solid red;
    border-radius: 5px;
  `;

  return `
    <div style="${style}">
      OOPS!
      
    ${`<b>${errors}</b>`}

    </div>
  `;
}

// Display error message for invalid event or invalid function
function displayErrorMessage(message) {
  let errorMessage = document.getElementById("error-message");

  if (!errorMessage) {
    errorMessage = document.createElement("div");
    errorMessage.id = "error-message";
    document.body.appendChild(errorMessage);
  }

  errorMessage.innerHTML = generateErrorMessage(message);
  errorMessage.style.display = "block";
}

//Main object for working with a framework outside this file
const MiniFramework = {
  render,
  updateState,
  setState,
  getState,
  defineFunc,
  displayErrorMessage,
};

export default MiniFramework;
