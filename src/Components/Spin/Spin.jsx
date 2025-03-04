import "./Spin.css"

export const Spin = ({ width, height }) => {
  return (
    <div
      className="spin"
      style={{ "--width": `${width}px`, "--height": `${height}px` }}
    />
  )
}
