import { useRef, useEffect } from "react";
import { usePortal } from "../../hooks";
import "./Modal.css";
import { Button } from "../Button";

export const Modal = ({
  children,
  onClose,
  open,
  footer,
  title,
  width,
  height,
}) => {
  const modal = usePortal();
  const refModal = useRef();

  const actions = [
    <Button onClick={onClose}>Close</Button>,
    <Button variant="primary">Ok</Button>,
  ];

  const renderFooter = (footer) => {
    if (footer) {
      return footer(actions);
    }

    if (footer === null) {
      return null;
    }

    return (
      <div className=" modal-btn-footer | d-flex gap-8 justify-content-end">
        {actions}
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refModal.current && refModal.current === event.target) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  return open
    ? modal(
        <div
          ref={refModal}
          className="modal"
          style={{ "--width": `${width}px`, "--height": `${height}px` }}
        >
          <div className="modal-content-body">
            {title && (
              <div className="modal-title">
                <h2>{title}</h2>
              </div>
            )}

            <div>{children}</div>

            <div>{renderFooter(footer)}</div>
          </div>
        </div>,
      )
    : null;
};
