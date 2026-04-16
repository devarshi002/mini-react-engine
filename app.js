// createElement
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children
    }
  };
}

// ---------------- GLOBAL ----------------
let oldTree = null;
let hooks = [];
let effects = [];
let index = 0;

let rootElement, rootContainer;

// ---------------- useState ----------------
function useState(initial) {
  const currentIndex = index;

  hooks[currentIndex] =
    hooks[currentIndex] !== undefined ? hooks[currentIndex] : initial;

  function setState(newVal) {
    hooks[currentIndex] = newVal;
    renderApp(rootElement, rootContainer);
  }

  index++;
  return [hooks[currentIndex], setState];
}

// ---------------- useEffect ----------------
function useEffect(callback, deps) {
  const currentIndex = index;
  const old = effects[currentIndex];

  let hasChanged = true;

  if (old) {
    hasChanged = deps.some((dep, i) => dep !== old.deps[i]);
  }

  if (hasChanged) {
    // 🔥 run cleanup immediately
    if (old && old.cleanup) {
      old.cleanup();
    }

    const cleanup = callback(); // run effect NOW

    effects[currentIndex] = {
      deps,
      cleanup
    };
  }

  index++;
}

// ---------------- useDebounce ----------------
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => clearTimeout(timer); // ✅ now works!
  }, [value, delay]);

  return debounced;
}

// ---------------- renderApp ----------------
function renderApp(element, container) {
  rootElement = element;
  rootContainer = container;

  index = 0;

  updateDom(container, element, oldTree);

  oldTree = element;
}

// ---------------- DIFFING ----------------
function updateDom(parent, newNode, oldNode, index = 0) {
  // 🔥 handle function components
  if (typeof newNode?.type === "function") {
    const newChild = newNode.type(newNode.props);
    const oldChild = oldNode ? oldNode.type(oldNode.props) : null;
    updateDom(parent, newChild, oldChild, index);
    return;
  }

  // create new
  if (!oldNode) {
    parent.appendChild(createDom(newNode));
    return;
  }

  // remove
  if (!newNode) {
    parent.removeChild(parent.childNodes[index]);
    return;
  }

  // replace
  if (newNode.type !== oldNode.type) {
    parent.replaceChild(createDom(newNode), parent.childNodes[index]);
    return;
  }

  // text node
  if (typeof newNode === "string") {
    if (newNode !== oldNode) {
      parent.childNodes[index].textContent = newNode;
    }
    return;
  }

  // update props
  updateProps(parent.childNodes[index], newNode.props, oldNode.props);

  // children diff
  const max = Math.max(
    newNode.props.children.length,
    oldNode.props.children.length
  );

  for (let i = 0; i < max; i++) {
    updateDom(
      parent.childNodes[index],
      newNode.props.children[i],
      oldNode.props.children[i],
      i
    );
  }
}

// ---------------- createDom ----------------
function createDom(element) {
  if (typeof element === "string") {
    return document.createTextNode(element);
  }

  if (typeof element.type === "function") {
    return createDom(element.type(element.props));
  }

  const dom = document.createElement(element.type);

  updateProps(dom, element.props, {});

  (element.props.children || []).forEach(child => {
    dom.appendChild(createDom(child));
  });

  return dom;
}

// ---------------- updateProps ----------------
function updateProps(dom, newProps, oldProps) {
  // remove old props
  Object.keys(oldProps).forEach(key => {
    if (key === "children") return;

    if (!(key in newProps)) {
      dom.removeAttribute(key);
    }
  });

  // set new props
  Object.keys(newProps).forEach(key => {
    if (key === "children") return;

    if (key.startsWith("on")) {
      const eventType = key.toLowerCase().substring(2);

      // 🔥 remove old event
      if (oldProps[key]) {
        dom.removeEventListener(eventType, oldProps[key]);
      }

      dom.addEventListener(eventType, newProps[key]);
    } 
    else if (key === "className") {
      dom.setAttribute("class", newProps[key]);
    } 
    else if (key === "value") {
      // 🔥 prevent cursor reset
      if (dom.value !== newProps[key]) {
        dom.value = newProps[key];
      }
    } 
    else {
      dom[key] = newProps[key];
    }
  });
}

// ---------------- APP ----------------
function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Dev");
  const [input, setInput] = useState("");

  const debounced = useDebounce(input, 1000);

  useEffect(() => {
    console.log("Count changed:", count);
  }, [count]);

  useEffect(() => {
    console.log("Debounced value:", debounced);
  }, [debounced]);

  return createElement(
    "div",
    { className: "container" },

    createElement("h2", null, "Mini React App"),

    createElement(
      "button",
      { onClick: () => setCount(count + 1) },
      "Count: " + count
    ),

    createElement(
      "button",
      { onClick: () => setName("React") },
      "Name: " + name
    ),

    createElement(
      "input",
      {
        value: input,
        oninput: (e) => setInput(e.target.value),
        placeholder: "Type something..."
      }
    )
  );
}

// start app
renderApp(createElement(App), document.getElementById("root"));