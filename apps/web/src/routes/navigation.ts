import { useEffect, useState } from "react";

const navigateEvent = "admin-panel:navigate";

export function navigateTo(path: string, options: { replace?: boolean } = {}) {
  if (window.location.pathname === path) {
    return;
  }

  if (options.replace) {
    window.history.replaceState(null, "", path);
  } else {
    window.history.pushState(null, "", path);
  }

  window.dispatchEvent(new Event(navigateEvent));
}

export function usePathname() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const updatePath = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", updatePath);
    window.addEventListener(navigateEvent, updatePath);

    return () => {
      window.removeEventListener("popstate", updatePath);
      window.removeEventListener(navigateEvent, updatePath);
    };
  }, []);

  return path;
}
