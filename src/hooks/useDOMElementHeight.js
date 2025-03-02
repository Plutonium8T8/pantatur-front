import { useState, useLayoutEffect } from "react";

export const useDOMElementHeight = (domElement) => {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    setHeight(domElement.current?.offsetHeight);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return height;
};
