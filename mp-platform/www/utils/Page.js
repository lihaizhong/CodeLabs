const lifecycle = ["onLoad", "onShow", "onReady", "onHide", "onUnload"];
const isObject = (value) => typeof value === "object" && value !== null;

export default function Page(options) {
  function bindAll(prop, newValue) {
    if (isObject(options.observers)) {
      Object.keys(options.observers).forEach((keyStr) => {
        const keys = keyStr.split(",");

        if (keys.includes(prop)) {
          options.observers[keyStr].apply(ENTITY, [newValue]);
        }
      });
    }

    if (isObject(options.bindHtml)) {
      Object.keys(options.bindHtml).forEach((keyStr) => {
        const keys = keyStr.split(",");

        if (keys.includes(prop)) {
          options.bindHtml[keyStr].apply(ENTITY, [newValue]);
        }
      });
    }
  }

  const ENTITY = {
    ...options,
    setData(data) {
      for (let key of Object.keys(data)) {
        if (this.data[key] !== undefined) {
          this.data[key] = data[key];
        }
      }
    },
  };
  const EventsRegistration = {
    visibilitychange: false,
    DOMContentLoaded: false,
    load: false,
    beforeunload: false,
  };

  delete ENTITY.observers;
  delete ENTITY.bindHtml;
  delete ENTITY.bindEvents;

  for (let key of Object.keys(ENTITY)) {
    if (lifecycle.includes(key)) {
      if (
        !EventsRegistration.visibilitychange &&
        (key === "onShow" || key === "onHide")
      ) {
        document.addEventListener("visibilitychange", () => {
          EventsRegistration.visibilitychange = true;
          document.hidden ? ENTITY.onHide() : ENTITY.onShow();
        });
        break;
      }

      if (key === "onLoad") {
        document.addEventListener("DOMContentLoaded", () => {
          EventsRegistration.DOMContentLoaded = true;
          const searchParams = new URLSearchParams(location.search.slice(1));
          const query = {};

          searchParams.forEach((value, key) => {
            query[decodeURIComponent(key)] = decodeURIComponent(value);
          });

          ENTITY.data = new Proxy(options.data, {
            set(target, prop, value, receiver) {
              Reflect.set(target, prop, value, receiver);
              bindAll.apply(ENTITY, [prop, value]);

              // 错误 "TypeError: 'set' on proxy: trap returned falsish for property 'current'" 在 JavaScript Proxy 的 set 陷阱在严格模式下返回一个假值时出现。
              // set 陷阱应该返回 true 以指示成功分配。返回 false 表示分配失败，并且在严格模式下，这会导致一个 TypeError。
              return true;
            },
          });

          if (isObject(options.bindEvents)) {
            Object.keys(options.bindEvents).forEach((key) => {
              const methodName = options.bindEvents[key];
              const [selector, eventName] = key.split(":");
              const $dom = document.querySelector(selector);

              if ($dom) {
                $dom.addEventListener(
                  eventName,
                  ENTITY[methodName].bind(ENTITY)
                );
              }
            });
          }

          ENTITY.onLoad(query);
        });
      }

      if (key === "onReady") {
        window.addEventListener("load", () => {
          EventsRegistration.load = true;
          ENTITY.onReady();
        });
      }

      if (key === "onUnload") {
        window.addEventListener("beforeunload", (event) => {
          EventsRegistration.beforeunload = true;
          // Cancel the event as stated by the standard.
          event.preventDefault();
          // Chrome requires returnValue to be set.
          event.returnValue = "";
          ENTITY.onUnload();
        });
      }
    }
  }
}
