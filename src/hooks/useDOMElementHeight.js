import { useState, useLayoutEffect } from "react";

export const useDOMElementHeight = (refDomElement) => {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    setHeight(refDomElement.current?.offsetHeight);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return height;
};
