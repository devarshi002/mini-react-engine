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

// render
function render(element, container) {
    if(typeof element.type === 'function'){
        const child = element.type(element.props)
        render(child, container)
        return
    }

    const dom = document.createElement(element.type)


    Object.keys(element.props || {}.forEach(key => {
        if (key === "children") return;

        if(key.startsWith("on")) {
            const eventType = key.toLowerCase().subString(2);
            dom.addEventListener(eventType, element.props[key]);
        }else {
            dom[key] = element.props[key]
        }
    }))

    element.props.children.forEach(child => {
    if (typeof child === "object") {
      render(child, dom);
    } else {
      dom.appendChild(document.createTextNode(child));
    }
  });

  container.appendChild(dom);
}

// state
let hooks = [];
let index = 0;
let rootElement, rootContainer;


function useState(initial) {
  const currentIndex = index;
  hooks[currentIndex]=
    hooks[currentIndex] !== undefined ? hooks[currentIndex] : initial;

    function setState(newVal) {
        hooks[currentIndex] = newVal
        renderApp(rootElement, rootContainer)
    }

    index++

    return [hooks[currentIndex], setState]
}

// renderApp
function renderApp(element, container) {
  rootElement = element;
  rootContainer = container;
  index = 0;

  container.innerHTML = "";
  render(element, container);
}

// App Component
function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Dev");
  return createElement(
    "div",
    null,
    createElement(
        "button",
    { onClick: () => setCount(count + 1) },
    "Count: " + count
    ),
    createElement(
        "button",
        {onClick: ()=> setName("React")},
        "Name: " + name
    )
    
  );
}

// start app
renderApp(createElement(App), document.getElementById("root"));