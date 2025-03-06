import { useRef, useEffect } from "react"
import { usePortal } from "../../hooks"
import "./Modal.css"
import { Button } from "../Button"
import { getLanguageByKey } from "../utils/getLanguageByKey"
import { SpinnerOverContent } from "../SpinnerOverContent"

export const Modal = ({
  children,
  onClose,
  onConfirm,
  open,
  footer,
  title,
  width,
  height,
  loading,
  loadingButton
}) => {
  const modal = usePortal()
  const refModal = useRef()

  const actions = [
    <Button key="1" onClick={onClose}>
      {getLanguageByKey("Anuleaza")}
    </Button>,
    <Button
      key="2"
      onClick={onConfirm}
      variant="primary"
      loading={loadingButton}
    >
      {getLanguageByKey("Confirma")}
    </Button>
  ]

  const renderFooter = (footer) => {
    if (footer) {
      return footer(actions)
    }

    if (footer === null) {
      return null
    }

    return (
      <div className=" modal-btn-footer | d-flex gap-8 justify-content-end">
        {actions}
      </div>
    )
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refModal.current && refModal.current === event.target) {
        onClose?.()
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, onClose])

  return open
    ? modal(
        <div
          ref={refModal}
          className="modal"
          style={{ "--width": `${width}px`, "--height": `${height}px` }}
        >
          <div className="modal-content-body">
            {title && (
              <div className="modal-title | mb-16">
                <h2>{title}</h2>
              </div>
            )}

            {children}

            <div className="modal-footer-action-btns">
              {renderFooter(footer)}
            </div>

            <SpinnerOverContent loading={loading} />
          </div>
        </div>
      )
    : null
}
