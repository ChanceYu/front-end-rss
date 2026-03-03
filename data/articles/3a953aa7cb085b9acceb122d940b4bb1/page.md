---
title: "我们可以使用 Local Storage 代替 Context-Redux-Zustand 吗？"
link: "http://mp.weixin.qq.com/s/HOiaiuA4ek3cmTYxHshRJA"
date: 2025-12-09
md5: 3a953aa7cb085b9acceb122d940b4bb1
---

# 我们可以使用 Local Storage 代替 Context-Redux-Zustand 吗？

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

我最近收到一个问题：“什么时候该用 Redux / Zustand / Context API？为什么这些东西在 React 中是必须的？为什么不能直接用 Local Storage 代替？”我非常喜欢这样的问题。表面上看，答案很简单：因为它们的用途完全不同。

但仅仅是“表面上”而已。真的是这样吗？它们的用途到底哪里不同？它们不都是“存数据”吗？是不是 React 有什么奇怪的地方？如果是 Svelte 或 Angular 就可以用 Local Storage？或者其实是 Local Storage 本身有问题？又或者，现在其实没问题了？

毕竟，如果我们能摆脱所有的状态管理库，只用浏览器和语言自带的 API，那不是太爽了吗？

现在，就让我们来看看这是否真的可行。

---

## 为什么需要 Context / Redux / Zustand？

先来聊聊 Context / Redux / Zustand 等等存在的意义。我们为什么需要它们？

在 React 中，一切都围绕着 state 展开。我们通过 useState 或 useReducer 等 hook 把数据放入 state，在界面上 render 出来，并在需要更新时触发 state 更新。通常发生在用户和 UI 交互之后。

对于简单的场景，本地 state（即用 useState 管理、且只在当前组件内生效的 state）就足够了。比如一个下拉菜单的 isOpen 状态，只有下拉菜单组件自己需要知道它，其他组件根本不关心。

```code-snippet__js
const Dropdown = ({ children, trigger }) => {
  // 本地 state，仅 Dropdown 自身可见
  const [isOpen, setIsOpen] = useState();


  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>{trigger}</button>
      {isOpen && children}
    </>
  );
};
```
但有时我们需要在多个组件之间共享 state。比如一个复杂的过滤器系统，或一个“暗黑模式”主题：页面角落的按钮可以切换主题，但 isDarkMode 的值要分发给页面上一半的组件。

此时问题来了。React 是严格层级化的：组件之间只能通过 props 或回调在父子间传递数据，无法直接在兄弟组件之间通信。比如主题切换组件 `<ToggleTheme />` 无法直接把当前主题值传递给其他兄弟组件。

```code-snippet__js
const App = () => {
  return (
    <>
      {/* 这个组件内部有本地的 isDarkMode state */}
      <ToggleTheme />
      {/* 这个组件无法访问 ToggleTheme 的本地 state */}
      <SomeBeautifulContentComponent />
    </>
  );
};
```
为了解决这个问题，我们可以使用“提升 state（lifting state up）”的技巧：把 state 提到需要共享它的所有组件的最近公共父组件中，然后通过 props 分发。

```code-snippet__js
const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);


  return (
    <>
      <ToggleTheme
        isDarkMode={isDarkMode}
        onClick={() => setIsDarkMode(!isDarkMode)}
      />
      <SomeBeautifulContentComponent isDarkMode={isDarkMode} />
    </>
  );
};
```
但这种模式也有自己的问题。第一个问题是——**不必要的重新渲染**。第二个问题是——**props 链条臃肿**。即便是上面这个简单的例子，代码的复杂度也立刻上升了。若是 state 是个复杂对象，还要向不同层级的组件分发不同片段，代码会迅速变得难以维护。许多组件只是中转数据而不实际使用它。这种现象叫 **prop drilling**。

为了解决 prop drilling，我们需要 Context。Context 允许我们把 state 相关的逻辑抽离成独立组件，在任何需要的地方直接访问它，就像用电梯代替搬钢琴下楼梯一样。

```code-snippet__js
const App = () => {
  return (
    {/* 由 ThemeProvider 管理 isDarkMode 并通过 Context 分发 */}
    <ThemeProvider>
      {/* 直接从 Context 获取 isDarkMode */}
      <ToggleTheme />
      {/* 同样可从 Context 访问 isDarkMode */}
      <SomeBeautifulContentComponent />
    </ThemeProvider>
  );
};
```
每个状态管理库，比如 Redux、Zustand 等，都是在解决同样的问题，只是在实现方式和优缺点上不同。核心目标都是**避免 prop drilling**，并让 state 管理更清晰有序。

至于它们之间的差别以及该如何选择，那是另一个话题。现在我们来看看 Local Storage。

---

## 为什么需要 Local Storage？

到目前为止，我们讨论的都是 React 内部的状态管理。所有变量（无论是否在 state 中）都会在页面关闭或刷新时丢失。

如果我们希望数据能更持久，就需要外部存储方案，比如数据库、JSON 文件或 Local Storage。

Local Storage 是一种简单的浏览器持久化机制。只要浏览器存在，数据就不会消失（即使刷新页面或关闭标签页后重新打开，数据仍然在）。每个域名都有自己独立的 Local Storage 空间。

它只能存储字符串类型的键值对。你可以在 Chrome DevTools → Application → Local Storage 中查看当前网站存储的数据。

通常能看到分析数据、主题、token、用户偏好等内容。

以主题为例。主题不是必须要登录或接入后端的功能，但用户也不希望每次访问都重新选择。于是我们可以将用户偏好保存在 Local Storage 中，并在每次页面加载时读取。

```code-snippet__js
// 保存主题
localStorage.setItem("theme", "dark");


// 读取主题
const theme = localStorage.getItem("theme");


// 删除主题
localStorage.removeItem("theme");


// 清空全部
localStorage.clear();
```
在 React 中，我们通常会在应用初始化时读取 Local Storage：

```code-snippet__js
const theme = localStorage.getItem("theme");
```
然后放入 Context / Redux / Zustand 中，方便全局访问：

```code-snippet__js
const ThemeContext = createContext('light');


const ThemeProvider = ({ children }) => {
  const theme = localStorage.getItem("theme");
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};
```
再创建一个 hook：

```code-snippet__js
const useTheme = () => useContext(ThemeContext);
```
然后各组件直接使用：

```code-snippet__js
const Button = () => {
  const theme = useTheme();
  return ...;
};


const Navigation = () => {
  const theme = useTheme();
  return ...;
};
```
看到没？Context 和 Local Storage 的用途完全不同。

🤔🤨🤔

真的是这样吗？为什么不能直接在 useTheme hook 中读取 Local Storage？我们是不是可以简化一下？

```code-snippet__js
const Button = () => {
  const theme = localStorage.getItem("theme");
  return ...;
};
```
或者更优雅一些：

```code-snippet__js
const useTheme = () => localStorage.getItem("theme");
```
这样 Button 根本不需要知道 Local Storage 的存在。无 Context、无 Redux/Zustand，API 也更简单。那为什么不行？

---

## 为什么 Local Storage 不行：产品层面原因

有时，我们并不希望 Local Storage 的“持久化”特性。比如暗黑模式的确应该保留，但一个打开的抽屉、弹窗、复选框的状态就不该在刷新后还保留。否则用户会觉得是 Bug。

在这种情况下，我们会用 Redux/Context/Zustand 管理 UI state，仅让 Local Storage 保存需要持久化的部分（比如主题）。否则每次加载都得清空 Local Storage，反而更复杂。

---

## 为什么 Local Storage 不行：无法与 React 同步

即便我们想持久化大部分 state，也得解决一个问题：**如何让 React 知道 Local Storage 的变化**。

假设我们有个按钮切换主题：

```code-snippet__js
const ToggleThemeButton = () => {
  return (
    <button
      onClick={() => {
        // 切换主题
      }}
    >
      Dark mode on/off
    </button>
  );
};
```
如果我们只是执行：

```code-snippet__js
localStorage.setItem("theme", theme === "dark" ? "light" : "dark");
```
React 不会更新 UI，因为它不知道数据变了。React 的渲染机制依赖 state 更新触发重新渲染，而不是外部系统的变动。

因此，我们得在 useTheme 中用 state 来同步：

```code-snippet__js
const useTheme = () => {
  const initialTheme = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(initialTheme);


  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };


  return { theme, toggleTheme };
};
```
这样做虽然能用，但多个组件若都调用 useTheme，就会产生多个不共享的副本，互相不同步。

因此，我们又得回到 Context 或 Redux/Zustand。

```code-snippet__js
const ThemeProvider = ({ children }) => {
  const initialTheme = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(initialTheme);


  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };


  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```
---

## 为什么 Local Storage 不行：无法监听变化事件

假如应用的其他部分（甚至不是 React 代码）修改了 Local Storage 中的值，UI 会不同步。理论上我们可以监听浏览器的 “storage” 事件：

```code-snippet__js
useEffect(() => {
  window.addEventListener("storage", (event) => {
    if (event.key === "theme") {
      setTheme(event.newValue);
    }
  });
}, []);
```
但问题是：**“storage” 事件不会在当前标签页触发**。它只会在其他打开同一站点的标签页中触发。这虽然能实现多标签同步，但对当前页面完全无效。

我们可以手动 dispatch 事件来弥补，但这显然不优雅。

---

## 为什么 Local Storage 不行：SSR 和服务端组件

Local Storage 是浏览器 API，在服务端渲染（SSR）中不可用。在 Node 环境访问会报错 `localStorage is not defined`。

要么放弃 SSR，要么渲染默认值后再在客户端覆盖。

---

## 为什么 Local Storage 不行：全局键值与字符串限制

Local Storage 是全局的键值对存储，整个域名共享。要自己设计命名空间，否则不同库的 key 冲突会让应用崩溃。

另外，value 只能是字符串，没有布尔、对象或数组。因此需要频繁使用 JSON.parse / stringify，类型安全性也全无。

---

## 为什么 Local Storage 不行：错误处理

使用 Local Storage 时必须小心错误处理。

1. `JSON.parse(...)` 遇到非法 JSON 会直接抛错，导致整个应用崩溃。
2. 某些安全策略会抛 `SecurityError`。
3. 存储空间有限（5MB），超过会抛 `QuotaExceededError`。

调试或让用户“清空 Local Storage”都是灾难级体验。

---

## ✅ Local Storage 的正确用途

综上，理论上可以用 Local Storage 来做状态管理，但实际实现会更复杂、更脆弱，最后你还是得用 Redux/Zustand/Context 来配合 😅。所以完全没必要这样做，除非你确实有**持久化数据**的产品需求。

那它到底该怎么用？

- **表单数据备份**：长表单可定期保存到 Local Storage，防止用户意外刷新。
- **轻量后端替代**：比如主题、小游戏、无需登录的本地状态。
- **UI 记忆功能**：保存展开的菜单、选中的标签等。
- **跨标签通信**：实现实时同步、通知等高级功能。

但请记住：Local Storage **不是共享 state 的替代品**。Redux、Zustand、Context 才是。

  

原文地址：https://medium.com/@adevnadia/can-we-use-local-storage-instead-of-context-redux-zustand-a3e9e19176e9

  

原文作者： Nadia Makarevich

  

Node 社群
