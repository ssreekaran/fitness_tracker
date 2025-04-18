import React from "react";
import "./DropdownButton.css";
const DropdownButton = ({
  children,
  open,
  toggle,
}: {
  children: React.ReactNode;
  open: boolean;
  toggle: React.MouseEventHandler<HTMLDivElement>;
}) => {
  return (
    <div
      onClick={toggle}
      className={`dropdown-btn ${open ? "button-open" : null}`}
    >
      {children}
      <span className="toggle-icon">
        {open ? (
          <img
            src="/gi-boomerang-icon-up.png"
            width={12}
            height={12}
          />
        ) : (
          <img
            src="/gi-boomerang-icon-down.png"
            width={12}
            height={12}
          />
        )}
      </span>
    </div>
  );
};

export default DropdownButton;
