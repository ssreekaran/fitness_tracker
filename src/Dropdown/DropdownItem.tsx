import React from "react";
import "./DropdownItem.css";
const DropdownItem = ({
  children,
  onClick,
}: {
  children: string[];
  onClick: React.MouseEventHandler<HTMLDivElement>;
}) => {
  return (
    <div className="dropdown-item" onClick={onClick}>
      {children}
    </div>
  );
};

export default DropdownItem;
